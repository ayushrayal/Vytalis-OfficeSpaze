const express = require('express');
const router = express.Router();
const operationBillController = require('../controllers/operationBill.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadOperationBillReceiptMiddleware = require('../middleware/uploadOperationBillReceipt.middleware');

router.use(authMiddleware);

router.post('/', uploadOperationBillReceiptMiddleware, operationBillController.createOperationBill);
router.get('/', operationBillController.getOperationBills);
router.get('/:id', operationBillController.getOperationBill);
router.put('/:id', uploadOperationBillReceiptMiddleware, operationBillController.updateOperationBill);
router.delete('/:id', operationBillController.deleteOperationBill);

module.exports = router;
