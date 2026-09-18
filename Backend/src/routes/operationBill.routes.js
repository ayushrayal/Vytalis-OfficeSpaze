const express = require('express');
const router = express.Router();
const operationBillController = require('../controllers/operationBill.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const uploadOperationBillReceiptMiddleware = require('../middleware/uploadOperationBillReceipt.middleware');

router.use(authMiddleware);

router.post('/', requirePermission('operation_bills', 'create'), uploadOperationBillReceiptMiddleware, operationBillController.createOperationBill);
router.get('/', requirePermission('operation_bills', 'view'), operationBillController.getOperationBills);
router.get('/:id', requirePermission('operation_bills', 'view'), operationBillController.getOperationBill);
router.put('/:id', requirePermission('operation_bills', 'update'), uploadOperationBillReceiptMiddleware, operationBillController.updateOperationBill);
router.delete('/:id', requirePermission('operation_bills', 'delete'), operationBillController.deleteOperationBill);

module.exports = router;
