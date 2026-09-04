const express = require('express');
const router = express.Router();
const invoiceTemplateController = require('../controllers/invoiceTemplate.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', invoiceTemplateController.createInvoiceTemplate);
router.get('/', invoiceTemplateController.getInvoiceTemplates);
router.get('/:id', invoiceTemplateController.getInvoiceTemplate);
router.get('/:id/pdf', invoiceTemplateController.downloadInvoicePDF);
router.put('/:id', invoiceTemplateController.updateInvoiceTemplate);
router.delete('/:id', invoiceTemplateController.deleteInvoiceTemplate);

module.exports = router;
