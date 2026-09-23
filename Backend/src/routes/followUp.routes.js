const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin, requirePermission } = require('../middleware/permission.middleware');
const leadFollowUpController = require('../controllers/leadFollowUp.controller');

// Global/scoped follow-up tasks list
router.get('/', authMiddleware, requirePermission('meta_leads', 'view'), leadFollowUpController.getFollowUpsList);

// Follow-up metrics for tabs & dashboard
router.get('/metrics', authMiddleware, requirePermission('meta_leads', 'view'), leadFollowUpController.getFollowUpMetrics);

// Admin-only maintenance trigger for processing missed follow-ups
router.post('/process-missed', authMiddleware, requireAdmin, leadFollowUpController.processMissedFollowUps);

module.exports = router;
