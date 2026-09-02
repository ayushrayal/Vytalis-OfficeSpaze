const express = require('express');
const router = express.Router();
const walkInController = require('../controllers/walkin.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Protect all Walk-in endpoints with auth middleware
router.use(authMiddleware);

router.post('/', walkInController.createWalkIn);
router.get('/', walkInController.getWalkIns);
router.get('/:id', walkInController.getWalkIn);
router.put('/:id', walkInController.updateWalkIn);
router.delete('/:id', walkInController.deleteWalkIn);

module.exports = router;
