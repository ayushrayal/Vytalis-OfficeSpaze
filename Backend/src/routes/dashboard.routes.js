const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { streamDashboardEvents, getDashboardStreamStatus } = require('../controllers/dashboard.controller');

// Both /stream and /activity/stream endpoints point to the SSE handler
router.get('/stream', authMiddleware, streamDashboardEvents);
router.get('/activity/stream', authMiddleware, streamDashboardEvents);
router.get('/status', authMiddleware, getDashboardStreamStatus);

module.exports = router;
