const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin, requirePermission } = require('../middleware/permission.middleware');
const leadAnalyticsController = require('../controllers/leadAnalytics.controller');

// Read endpoints: authenticated + requirePermission('meta_leads', 'view')
router.get('/overview', authMiddleware, requirePermission('meta_leads', 'view'), leadAnalyticsController.getOverviewAnalytics);
router.get('/trends', authMiddleware, requirePermission('meta_leads', 'view'), leadAnalyticsController.getTrendAnalytics);
router.get('/conversions', authMiddleware, requirePermission('meta_leads', 'view'), leadAnalyticsController.getConversionAnalytics);
router.get('/follow-ups', authMiddleware, requirePermission('meta_leads', 'view'), leadAnalyticsController.getFollowUpAnalytics);

// Assignee performance leaderboard: strictly ADMIN-only
router.get('/assignees', authMiddleware, requireAdmin, leadAnalyticsController.getAssigneeAnalytics);

module.exports = router;
