const express = require('express');
const router = express.Router();
const virtualOfficeController = require('../controllers/virtualOffice.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const uploadAgreementMiddleware = require('../middleware/upload.middleware');

// Protect all Virtual Office endpoints with auth middleware
router.use(authMiddleware);

router.post('/', requirePermission('virtual_offices', 'create'), uploadAgreementMiddleware, virtualOfficeController.createVirtualOffice);
router.get('/', requirePermission('virtual_offices', 'view'), virtualOfficeController.getVirtualOffices);
router.get('/:id/agreement/access', requirePermission('virtual_offices', 'view'), virtualOfficeController.getAgreementAccess);
router.get('/:id', requirePermission('virtual_offices', 'view'), virtualOfficeController.getVirtualOffice);
router.put('/:id', requirePermission('virtual_offices', 'update'), uploadAgreementMiddleware, virtualOfficeController.updateVirtualOffice);
router.delete('/:id', requirePermission('virtual_offices', 'delete'), virtualOfficeController.deleteVirtualOffice);

module.exports = router;
