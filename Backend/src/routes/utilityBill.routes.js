const express = require('express');
const router = express.Router();
const utilityBillController = require('../controllers/utilityBill.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadReceiptMiddleware = require('../middleware/uploadReceipt.middleware');

// Protect all Utility Bill endpoints with auth middleware
router.use(authMiddleware);

router.post('/', uploadReceiptMiddleware, utilityBillController.createUtilityBill);
router.get('/', utilityBillController.getUtilityBills);

// Define /due route BEFORE /:id so Express does not treat "due" as an ID
router.get('/due', utilityBillController.getDueBills);

router.get('/:id', utilityBillController.getUtilityBill);
router.put('/:id', uploadReceiptMiddleware, utilityBillController.updateUtilityBill);
router.delete('/:id', utilityBillController.deleteUtilityBill);

module.exports = router;
