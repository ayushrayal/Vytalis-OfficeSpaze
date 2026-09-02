const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const registerAdmin = async ({ name, email, password, accessCode }) => {
  // Validate Access Code against environment variable
  if (!accessCode || accessCode !== process.env.ADMIN_ACCESS_CODE) {
    const error = new Error('Invalid access code');
    error.statusCode = 401;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check for duplicate email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  // Hash password using bcryptjs with 10 salt rounds
  const hashedPassword = await bcrypt.hash(password, 10);

  // Force role to ADMIN on backend
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: 'ADMIN'
  });

  return user;
};

const loginAdmin = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Explicitly select password and refreshTokenHash for verification
  const user = await User.findOne({ email: normalizedEmail }).select('+password +refreshTokenHash');

  if (!user || !user.isActive) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Compare password hash
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Generate Access Token (short-lived)
  const accessToken = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

  // Generate Refresh Token (long-lived)
  const refreshToken = jwt.sign(
    { userId: user._id.toString(), type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  // Hash the refresh token before storing in MongoDB
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  user.refreshTokenHash = refreshTokenHash;
  await user.save();

  return { user, accessToken, refreshToken };
};

const refreshAccessToken = async (refreshTokenCookie) => {
  if (!refreshTokenCookie) {
    const error = new Error('Refresh token is required');
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshTokenCookie, process.env.JWT_SECRET);
  } catch (err) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  if (decoded.type !== 'refresh') {
    const error = new Error('Invalid refresh token type');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.userId).select('+refreshTokenHash');
  if (!user || !user.isActive || !user.refreshTokenHash) {
    const error = new Error('User not found, inactive, or session revoked');
    error.statusCode = 401;
    throw error;
  }

  // Verify raw refresh token against stored bcrypt hash
  const isMatch = await bcrypt.compare(refreshTokenCookie, user.refreshTokenHash);
  if (!isMatch) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  // Refresh Token Rotation: issue NEW access token and NEW refresh token
  const newAccessToken = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );

  const newRefreshToken = jwt.sign(
    { userId: user._id.toString(), type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
  await user.save();

  return { newAccessToken, newRefreshToken };
};

const logoutUser = async (refreshTokenCookie) => {
  if (refreshTokenCookie) {
    try {
      const decoded = jwt.verify(refreshTokenCookie, process.env.JWT_SECRET, { ignoreExpiration: true });
      if (decoded && decoded.userId) {
        await User.findByIdAndUpdate(decoded.userId, { refreshTokenHash: null });
      }
    } catch (err) {
      // Ignore token decode errors during logout cleanup
    }
  }
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    const error = new Error('User not found or inactive');
    error.statusCode = 401;
    throw error;
  }
  return user;
};

module.exports = {
  registerAdmin,
  loginAdmin,
  refreshAccessToken,
  logoutUser,
  getCurrentUser
};
