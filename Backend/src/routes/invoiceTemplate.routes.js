const express = require('express');
const router = express.Router();
const invoiceTemplateController = require('../controllers/invoiceTemplate.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

router.use(authMiddleware);

router.post('/', requirePermission('invoice_templates', 'create'), invoiceTemplateController.createInvoiceTemplate);
router.get('/', requirePermission('invoice_templates', 'view'), invoiceTemplateController.getInvoiceTemplates);
router.get('/:id', requirePermission('invoice_templates', 'view'), invoiceTemplateController.getInvoiceTemplate);
router.get('/:id/pdf', requirePermission('invoice_templates', 'view'), invoiceTemplateController.downloadInvoicePDF);
router.put('/:id', requirePermission('invoice_templates', 'update'), invoiceTemplateController.updateInvoiceTemplate);
router.delete('/:id', requirePermission('invoice_templates', 'delete'), invoiceTemplateController.deleteInvoiceTemplate);

module.exports = router;
