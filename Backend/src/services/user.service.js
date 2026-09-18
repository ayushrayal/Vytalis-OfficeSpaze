const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { logActivity } = require('./activity.service');
const { ROLES, MODULES, ACTIONS, ADMIN_ONLY_MODULES } = require('../constants/permissions.constant');

/**
 * Ensures a mutation or deletion does not remove or deactivate the last active Admin.
 *
 * @param {object} targetUser - Mongoose User document or plain object with role and status
 */
const ensureNotLastActiveAdmin = async (targetUser) => {
  if (targetUser.role === 'ADMIN' && targetUser.status === 'ACTIVE') {
    const activeAdminCount = await User.countDocuments({ role: 'ADMIN', status: 'ACTIVE' });
    if (activeAdminCount <= 1) {
      const error = new Error('Cannot modify or delete the last active administrator.');
      error.statusCode = 400;
      throw error;
    }
  }
};

/**
 * Normalizes permissions array: retains only valid modules and actions.
 * If user is ADMIN, permissions must be empty (full bypass).
 * For non-admin users, ADMIN_ONLY_MODULES (like user_management) are strictly stripped.
 */
const normalizePermissions = (role, permissions) => {
  if (role === 'ADMIN') return [];
  if (!Array.isArray(permissions)) return [];

  return permissions
    .filter(
      (p) =>
        p &&
        MODULES.includes(p.module) &&
        !ADMIN_ONLY_MODULES.includes(p.module) &&
        Array.isArray(p.actions)
    )
    .map((p) => ({
      module: p.module,
      actions: p.actions.filter((a) => ACTIONS.includes(a))
    }))
    .filter((p) => p.actions.length > 0);
};

/**
 * List users with search, role, status filtering, and pagination.
 */
const getUsers = async ({ page = 1, limit = 20, search = '', role = '', status = '' } = {}) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(parseInt(limit, 10) || 20, 100));
  const skip = (parsedPage - 1) * parsedLimit;

  const query = {};

  if (search && typeof search === 'string' && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  if (role && ROLES.includes(role)) {
    query.role = role;
  }

  if (status === 'ACTIVE' || status === 'INACTIVE') {
    query.status = status;
  }

  const [total, users, totalUsers, totalAdmins, activeUsers, inactiveUsers] = await Promise.all([
    User.countDocuments(query),
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
    User.countDocuments({}),
    User.countDocuments({ role: 'ADMIN' }),
    User.countDocuments({ status: 'ACTIVE' }),
    User.countDocuments({ status: 'INACTIVE' })
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / parsedLimit);

  return {
    users,
    metrics: { totalUsers, totalAdmins, activeUsers, inactiveUsers },
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages,
      hasNextPage: parsedPage < totalPages,
      hasPrevPage: parsedPage > 1
    }
  };
};

/**
 * Retrieve a single user by ID.
 */
const getUserById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Create a new user with role and explicit permissions.
 */
const createUser = async (
  { firstName, lastName, email, phone, role, password, status, permissions },
  actor = null
) => {
  if (!email || !password || !role) {
    const error = new Error('email, password, and role are required');
    error.statusCode = 400;
    throw error;
  }

  if (!ROLES.includes(role)) {
    const error = new Error(`Role must be one of: ${ROLES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (typeof password !== 'string' || password.length < 6) {
    const error = new Error('Password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    const error = new Error('Valid email is required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || normalizedEmail.split('@')[0];
  const userStatus = status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const resolvedPermissions = normalizePermissions(role, permissions);

  const user = await User.create({
    firstName: firstName ? firstName.trim() : '',
    lastName: lastName ? lastName.trim() : '',
    name: fullName,
    email: normalizedEmail,
    phone: phone ? phone.trim() : '',
    password: hashedPassword,
    role,
    status: userStatus,
    isActive: userStatus === 'ACTIVE',
    permissions: resolvedPermissions
  });

  // Log activity
  logActivity({
    action: 'created',
    entityType: 'user',
    entityId: user._id,
    entityName: user.name || user.email,
    actor,
    metadata: { role: user.role, email: user.email }
  });

  return user;
};

/**
 * Update user basic profile, role, status, or permissions.
 */
const updateUser = async (id, updateData, actor = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const { firstName, lastName, phone, email, role, status, permissions } = updateData;

  // Protect against demoting or deactivating last active admin
  if (
    (role && role !== user.role && user.role === 'ADMIN') ||
    (status && status !== user.status && status === 'INACTIVE' && user.role === 'ADMIN')
  ) {
    await ensureNotLastActiveAdmin(user);
  }

  if (email !== undefined && email.trim()) {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        const error = new Error('Valid email is required');
        error.statusCode = 400;
        throw error;
      }
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing && existing._id.toString() !== user._id.toString()) {
        const error = new Error('Email is already registered');
        error.statusCode = 409;
        throw error;
      }
      user.email = normalizedEmail;
    }
  }

  if (firstName !== undefined) user.firstName = firstName.trim();
  if (lastName !== undefined) user.lastName = lastName.trim();
  if (phone !== undefined) user.phone = phone.trim();

  if (firstName !== undefined || lastName !== undefined) {
    user.name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name;
  }

  if (role && ROLES.includes(role)) {
    user.role = role;
    if (role === 'ADMIN') {
      user.permissions = [];
    }
  }

  if (status === 'ACTIVE' || status === 'INACTIVE') {
    user.status = status;
    user.isActive = status === 'ACTIVE';
    if (status === 'INACTIVE') {
      user.refreshTokenHash = null; // Revoke session
    }
  }

  if (Array.isArray(permissions) && user.role !== 'ADMIN') {
    user.permissions = normalizePermissions(user.role, permissions);
  }

  await user.save();

  logActivity({
    action: 'updated',
    entityType: 'user',
    entityId: user._id,
    entityName: user.name || user.email,
    actor,
    metadata: { role: user.role, status: user.status }
  });

  return user;
};

/**
 * Toggle or set active/inactive status.
 */
const updateUserStatus = async (id, status, actor = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (status !== 'ACTIVE' && status !== 'INACTIVE') {
    const error = new Error('status must be ACTIVE or INACTIVE');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (status === 'INACTIVE') {
    await ensureNotLastActiveAdmin(user);
    user.refreshTokenHash = null; // Session revocation on deactivation
  }

  user.status = status;
  user.isActive = status === 'ACTIVE';
  await user.save();

  logActivity({
    action: 'status_updated',
    entityType: 'user',
    entityId: user._id,
    entityName: user.name || user.email,
    actor,
    metadata: { newStatus: status }
  });

  return user;
};

/**
 * Update user role.
 */
const updateUserRole = async (id, role, actor = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!ROLES.includes(role)) {
    const error = new Error(`Role must be one of: ${ROLES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const previousRole = user.role;

  if (user.role === 'ADMIN' && role !== 'ADMIN') {
    await ensureNotLastActiveAdmin(user);
  }

  user.role = role;
  if (role === 'ADMIN') {
    user.permissions = [];
  }

  await user.save();

  logActivity({
    action: 'role_updated',
    entityType: 'user',
    entityId: user._id,
    entityName: user.name || user.email,
    actor,
    metadata: { previousRole, newRole: role }
  });

  return user;
};

/**
 * Update explicit permissions for non-admin user.
 */
const updateUserPermissions = async (id, permissions, actor = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!Array.isArray(permissions)) {
    const error = new Error('permissions must be an array');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'ADMIN') {
    const error = new Error('ADMIN role has unrestricted access. Explicit permissions are not applicable.');
    error.statusCode = 400;
    throw error;
  }

  user.permissions = normalizePermissions(user.role, permissions);
  await user.save();

  logActivity({
    action: 'permissions_updated',
    entityType: 'user',
    entityId: user._id,
    entityName: user.name || user.email,
    actor,
    metadata: { modulesCount: user.permissions.length }
  });

  return user;
};

/**
 * Reset user password and revoke active session.
 */
const resetUserPassword = async (id, newPassword, actor = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    const error = new Error('New password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(id).select('+refreshTokenHash');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.refreshTokenHash = null; // Revoke active refresh token session
  await user.save();

  logActivity({
    action: 'password_reset',
    entityType: 'user',
    entityId: user._id,
    entityName: user.name || user.email,
    actor,
    metadata: {}
  });

  return true;
};

/**
 * Delete a user record with self-delete and last active Admin guards.
 */
const deleteUser = async (id, actor = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Prevent deleting own account
  if (actor && actor._id && user._id.toString() === actor._id.toString()) {
    const error = new Error('You cannot delete your own account.');
    error.statusCode = 400;
    throw error;
  }

  await ensureNotLastActiveAdmin(user);

  const deletedName = user.name || user.email;
  const deletedId = user._id;
  const deletedRole = user.role;
  const deletedEmail = user.email;

  await User.findByIdAndDelete(id);

  logActivity({
    action: 'deleted',
    entityType: 'user',
    entityId: deletedId,
    entityName: deletedName,
    actor,
    metadata: { role: deletedRole, email: deletedEmail }
  });

  return true;
};

module.exports = {
  ensureNotLastActiveAdmin,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  updateUserRole,
  updateUserPermissions,
  resetUserPassword,
  deleteUser
};
