const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

// Protect activity endpoints with authentication
router.use(authMiddleware);

router.get('/', requirePermission('recent_activity', 'view'), activityController.getRecentActivities);

module.exports = router;
