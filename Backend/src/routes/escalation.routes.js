const express = require('express');
const router = express.Router();
const escalationController = require('../controllers/escalation.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

// Protect all Escalation endpoints with auth middleware
router.use(authMiddleware);

// Specific subroutes defined before /:id to prevent route collision
router.get('/attention', requirePermission('escalations', 'view'), escalationController.getAttentionEscalations);
router.get('/settings', requirePermission('escalations', 'view'), escalationController.getAlertWindowSettings);
router.put('/settings', requirePermission('escalations', 'update'), escalationController.updateAlertWindowSettings);

// Master CRUD and Resolution actions
router.post('/', requirePermission('escalations', 'create'), escalationController.createEscalation);
router.get('/', requirePermission('escalations', 'view'), escalationController.getEscalations);
router.get('/:id', requirePermission('escalations', 'view'), escalationController.getEscalation);
router.put('/:id', requirePermission('escalations', 'update'), escalationController.updateEscalation);
router.patch('/:id/resolve', requirePermission('escalations', 'update'), escalationController.resolveEscalation);
router.delete('/:id', requirePermission('escalations', 'delete'), escalationController.deleteEscalation);

module.exports = router;
