const express = require('express');
const router = express.Router();
const escalationController = require('../controllers/escalation.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Protect all Escalation endpoints with auth middleware
router.use(authMiddleware);

// Specific subroutes defined before /:id to prevent route collision
router.get('/attention', escalationController.getAttentionEscalations);
router.get('/settings', escalationController.getAlertWindowSettings);
router.put('/settings', escalationController.updateAlertWindowSettings);

// Master CRUD and Resolution actions
router.post('/', escalationController.createEscalation);
router.get('/', escalationController.getEscalations);
router.get('/:id', escalationController.getEscalation);
router.put('/:id', escalationController.updateEscalation);
router.patch('/:id/resolve', escalationController.resolveEscalation);
router.delete('/:id', escalationController.deleteEscalation);

module.exports = router;
