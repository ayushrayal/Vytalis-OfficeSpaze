const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin, requirePermission } = require('../middleware/permission.middleware');
const leadController = require('../controllers/lead.controller');

// Read endpoints: authenticated + requirePermission('meta_leads', 'view')
router.get('/', authMiddleware, requirePermission('meta_leads', 'view'), leadController.getLeads);
router.get('/sync/status', authMiddleware, requirePermission('meta_leads', 'view'), leadController.getSyncStatus);
router.get('/:id', authMiddleware, requirePermission('meta_leads', 'view'), leadController.getLeadById);

// Ingestion & diagnostic endpoints: strictly ADMIN only
router.post('/sync', authMiddleware, requireAdmin, leadController.syncLeads);
router.post('/test-windsor', authMiddleware, requireAdmin, leadController.testWindsor);

module.exports = router;
