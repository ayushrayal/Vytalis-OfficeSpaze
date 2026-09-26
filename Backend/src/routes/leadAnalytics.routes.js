const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin, requirePermission } = require('../middleware/permission.middleware');
const leadAnalyticsController = require('../controllers/leadAnalytics.controller');

// Read endpoints: authenticated + requirePermission('crm_analytics', 'view')
router.get('/overview', authMiddleware, requirePermission('crm_analytics', 'view'), leadAnalyticsController.getOverviewAnalytics);
router.get('/trends', authMiddleware, requirePermission('crm_analytics', 'view'), leadAnalyticsController.getTrendAnalytics);
router.get('/conversions', authMiddleware, requirePermission('crm_analytics', 'view'), leadAnalyticsController.getConversionAnalytics);
router.get('/follow-ups', authMiddleware, requirePermission('crm_analytics', 'view'), leadAnalyticsController.getFollowUpAnalytics);

// Assignee performance leaderboard: strictly ADMIN-only
router.get('/assignees', authMiddleware, requireAdmin, leadAnalyticsController.getAssigneeAnalytics);

module.exports = router;
