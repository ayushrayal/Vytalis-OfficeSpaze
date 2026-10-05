const express = require('express');
const router = express.Router();
const walkInController = require('../controllers/walkin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

// Protect all Walk-in endpoints with auth middleware
router.use(authMiddleware);

// Global Walk-in Follow-ups (registered before /:id)
router.get('/follow-ups', requirePermission('walkins', 'view'), walkInController.getGlobalFollowUps);

// Core Walk-in CRUD
router.post('/', requirePermission('walkins', 'create'), walkInController.createWalkIn);
router.get('/', requirePermission('walkins', 'view'), walkInController.getWalkIns);
router.get('/:id', requirePermission('walkins', 'view'), walkInController.getWalkIn);
router.put('/:id', requirePermission('walkins', 'update'), walkInController.updateWalkIn);
router.delete('/:id', requirePermission('walkins', 'delete'), walkInController.deleteWalkIn);


// CRM Status & Notes
router.patch('/:id/status', requirePermission('walkins', 'update'), walkInController.updateWalkInStatus);
router.post('/:id/notes', requirePermission('walkins', 'update'), walkInController.addNote);

// CRM Follow-ups
router.post('/:id/follow-ups', requirePermission('walkins', 'update'), walkInController.scheduleFollowUp);
router.get('/:id/follow-ups', requirePermission('walkins', 'view'), walkInController.getFollowUps);
router.patch('/:id/follow-ups/:followUpId/complete', requirePermission('walkins', 'update'), walkInController.completeFollowUp);
router.patch('/:id/follow-ups/:followUpId/cancel', requirePermission('walkins', 'update'), walkInController.cancelFollowUp);
router.patch('/:id/follow-ups/:followUpId/reschedule', requirePermission('walkins', 'update'), walkInController.rescheduleFollowUp);

// CRM Activity Timeline
router.get('/:id/activity', requirePermission('walkins', 'view'), walkInController.getActivity);

module.exports = router;
