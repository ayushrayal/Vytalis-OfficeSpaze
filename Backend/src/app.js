const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const walkInRoutes = require('./routes/walkin.routes');
const virtualOfficeRoutes = require('./routes/virtualOffice.routes');
const managedOfficeRoutes = require('./routes/managedOffice.routes');
const utilityBillRoutes = require('./routes/utilityBill.routes');
const salaryRoutes = require('./routes/salary.routes');
const operationBillRoutes = require('./routes/operationBill.routes');
const coworkSpaceRoutes = require('./routes/coworkSpace.routes');
const dedicatedSpaceRoutes = require('./routes/dedicatedSpace.routes');
const invoiceTemplateRoutes = require('./routes/invoiceTemplate.routes');
const aggregatorRoutes = require('./routes/aggregator.routes');
const escalationRoutes = require('./routes/escalation.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const activityRoutes = require('./routes/activity.routes');
const leadRoutes = require('./routes/lead.routes');
const followUpRoutes = require('./routes/followUp.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// Trust Proxy Configuration
// Explicitly configured via TRUST_PROXY env variable (e.g. TRUST_PROXY=1 on Render).
// Defaults to false to prevent IP spoofing in local development and unconfigured environments.
// Never uses boolean true to avoid trusting arbitrary client-supplied proxy chains.
const rawTrustProxy = process.env.TRUST_PROXY;
let trustProxyConfig = false;

if (rawTrustProxy !== undefined && rawTrustProxy !== 'false' && rawTrustProxy !== '') {
  const parsedHops = Number(rawTrustProxy);
  if (!Number.isNaN(parsedHops) && parsedHops > 0) {
    trustProxyConfig = parsedHops;
  } else {
    // Safe fallback: clamp to 1 hop if someone specifies non-numeric string or 'true'
    trustProxyConfig = 1;
  }
}

app.set('trust proxy', trustProxyConfig);

// Core Middleware
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174,http://localhost:5000')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.includes('localhost:5000') ||
        normalizedOrigin.includes('127.0.0.1:5000')
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    exposedHeaders: ['Retry-After', 'RateLimit', 'RateLimit-Policy']
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static File Serving for built React frontend from backend/public
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vytalis Office Spaze Intelligence API is running'
  });
});

// IP Diagnostic Endpoint — development/staging ONLY
// Disabled in production to avoid exposing infrastructure metadata.
// Remove this endpoint entirely once P0.2 is confirmed stable in production.
if (process.env.NODE_ENV !== 'production') {
  const { getClientIp } = require('./utils/clientIp.util');
  app.get('/api/diagnostic/ip', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        resolvedClientIp: getClientIp(req),
        reqIp: req.ip,
        reqIps: req.ips,
        socketRemoteAddress: req.socket ? req.socket.remoteAddress : null,
        xForwardedFor: req.get('x-forwarded-for') || null,
        cfConnectingIp: req.get('cf-connecting-ip') || null,
        cfRay: req.get('cf-ray') || null,
        trustProxySetting: req.app.get('trust proxy')
      }
    });
  });
}

// P0.2 diagnostic logger removed — IP resolution is now handled correctly
// by getClientIp() in rateLimiter.middleware.js. Re-add targeted logging
// here only if a future production anomaly requires it.

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/walkins', walkInRoutes);
app.use('/api/virtual-offices', virtualOfficeRoutes);
app.use('/api/managed-offices', managedOfficeRoutes);
app.use('/api/utility-bills', utilityBillRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/operation-bills', operationBillRoutes);
app.use('/api/cowork-spaces', coworkSpaceRoutes);
app.use('/api/dedicated-spaces', dedicatedSpaceRoutes);
app.use('/api/invoice-templates', invoiceTemplateRoutes);
app.use('/api/aggregators', aggregatorRoutes);
app.use('/api/escalations', escalationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/follow-ups', followUpRoutes);

// 404 Handler for unknown /api routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

// SPA Fallback for client-side React Router (non-API GET requests)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// 404 Handler for all other unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

// Global Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
