const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const { streamDashboardEvents, getDashboardStreamStatus } = require('../controllers/dashboard.controller');

// Both /stream and /activity/stream endpoints point to the SSE handler
router.use(authMiddleware, requirePermission('dashboard', 'view'));

router.get('/stream', streamDashboardEvents);
router.get('/activity/stream', streamDashboardEvents);
router.get('/status', getDashboardStreamStatus);

module.exports = router;
