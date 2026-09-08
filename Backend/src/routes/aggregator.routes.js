const express = require('express');
const router = express.Router();
const aggregatorController = require('../controllers/aggregator.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Protect all Aggregator endpoints with auth middleware
router.use(authMiddleware);

router.post('/', aggregatorController.createAggregator);
router.get('/', aggregatorController.getAggregators);
router.get('/:id', aggregatorController.getAggregator);
router.put('/:id', aggregatorController.updateAggregator);
router.delete('/:id', aggregatorController.deleteAggregator);

module.exports = router;
