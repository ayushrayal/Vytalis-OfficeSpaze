const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { requireAdmin, requirePermission } = require('../middleware/permission.middleware');
const leadController = require('../controllers/lead.controller');

// Read endpoints: authenticated + requirePermission('meta_leads', 'view')
router.get('/', authMiddleware, requirePermission('meta_leads', 'view'), leadController.getLeads);
router.get('/sync/status', authMiddleware, requirePermission('meta_leads', 'view'), leadController.getSyncStatus);
router.get('/stats', authMiddleware, requirePermission('meta_leads', 'view'), leadController.getLeadStats);

// Assignee directory: strictly ADMIN-only
router.get('/assignees', authMiddleware, requireAdmin, leadController.getAssignableUsers);

// Conversion targets lookup (must be mounted before /:id routes)
router.get('/conversion-targets', authMiddleware, requirePermission('meta_leads', 'update'), leadController.getConversionTargets);

// Bulk operations (must be mounted before /:id routes)
router.post('/bulk/assignment', authMiddleware, requireAdmin, leadController.bulkAssignLeads);
router.post('/bulk/status', authMiddleware, requirePermission('meta_leads', 'update'), leadController.bulkUpdateLeadStatus);
router.post('/bulk/archive', authMiddleware, requirePermission('meta_leads', 'delete'), leadController.bulkArchiveLeads);
router.post('/bulk/restore', authMiddleware, requirePermission('meta_leads', 'delete'), leadController.bulkRestoreLeads);
router.delete('/bulk/permanent', authMiddleware, requireAdmin, leadController.bulkPermanentDeleteLeads);

// Individual lead endpoints
router.get('/:id', authMiddleware, requirePermission('meta_leads', 'view'), leadController.getLeadById);
router.get('/:id/activity', authMiddleware, requirePermission('meta_leads', 'view'), leadController.getLeadActivity);

// CRM mutations
// Lead assignment: strictly ADMIN-only
router.patch('/:id/assignment', authMiddleware, requireAdmin, leadController.assignLead);
router.patch('/:id/status', authMiddleware, requirePermission('meta_leads', 'update'), leadController.updateLeadStatus);
router.patch('/:id/notes', authMiddleware, requirePermission('meta_leads', 'update'), leadController.updateLeadNotes);
router.patch('/:id/follow-up', authMiddleware, requirePermission('meta_leads', 'update'), leadController.updateLeadFollowUp);
router.post('/:id/convert', authMiddleware, requirePermission('meta_leads', 'update'), leadController.convertLead);

// Ingestion & diagnostic endpoints: strictly ADMIN only
router.post('/sync', authMiddleware, requireAdmin, leadController.syncLeads);
router.post('/test-windsor', authMiddleware, requireAdmin, leadController.testWindsor);

module.exports = router;
