const express = require('express');
const router = express.Router();
const aggregatorController = require('../controllers/aggregator.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

// Protect all Aggregator endpoints with auth middleware
router.use(authMiddleware);

router.post('/', requirePermission('aggregators', 'create'), aggregatorController.createAggregator);
router.get('/', requirePermission('aggregators', 'view'), aggregatorController.getAggregators);
router.get('/:id', requirePermission('aggregators', 'view'), aggregatorController.getAggregator);
router.put('/:id', requirePermission('aggregators', 'update'), aggregatorController.updateAggregator);
router.delete('/:id', requirePermission('aggregators', 'delete'), aggregatorController.deleteAggregator);

module.exports = router;
