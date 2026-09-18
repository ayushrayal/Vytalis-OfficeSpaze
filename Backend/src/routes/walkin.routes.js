const express = require('express');
const router = express.Router();
const walkInController = require('../controllers/walkin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

// Protect all Walk-in endpoints with auth middleware
router.use(authMiddleware);

router.post('/', requirePermission('walkins', 'create'), walkInController.createWalkIn);
router.get('/', requirePermission('walkins', 'view'), walkInController.getWalkIns);
router.get('/:id', requirePermission('walkins', 'view'), walkInController.getWalkIn);
router.put('/:id', requirePermission('walkins', 'update'), walkInController.updateWalkIn);
router.delete('/:id', requirePermission('walkins', 'delete'), walkInController.deleteWalkIn);

module.exports = router;
