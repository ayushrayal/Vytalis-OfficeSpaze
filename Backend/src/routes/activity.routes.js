const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Protect activity endpoints with authentication
router.use(authMiddleware);

router.get('/', activityController.getRecentActivities);

module.exports = router;
