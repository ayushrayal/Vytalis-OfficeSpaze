const express = require('express');
const router = express.Router();
const utilityBillController = require('../controllers/utilityBill.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const uploadReceiptMiddleware = require('../middleware/uploadReceipt.middleware');

// Protect all Utility Bill endpoints with auth middleware
router.use(authMiddleware);

router.post('/', requirePermission('utility_bills', 'create'), uploadReceiptMiddleware, utilityBillController.createUtilityBill);
router.get('/', requirePermission('utility_bills', 'view'), utilityBillController.getUtilityBills);

// Define /due route BEFORE /:id so Express does not treat "due" as an ID
router.get('/due', requirePermission('utility_bills', 'view'), utilityBillController.getDueBills);

router.get('/:id', requirePermission('utility_bills', 'view'), utilityBillController.getUtilityBill);
router.put('/:id', requirePermission('utility_bills', 'update'), uploadReceiptMiddleware, utilityBillController.updateUtilityBill);
router.delete('/:id', requirePermission('utility_bills', 'delete'), utilityBillController.deleteUtilityBill);

module.exports = router;
