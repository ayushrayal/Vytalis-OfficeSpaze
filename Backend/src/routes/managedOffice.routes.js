const express = require('express');
const router = express.Router();
const managedOfficeController = require('../controllers/managedOffice.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const uploadAgreementMiddleware = require('../middleware/upload.middleware');

// Protect all Managed Office endpoints with auth middleware
router.use(authMiddleware);

router.post('/', requirePermission('managed_offices', 'create'), uploadAgreementMiddleware, managedOfficeController.createManagedOffice);
router.get('/', requirePermission('managed_offices', 'view'), managedOfficeController.getManagedOffices);
router.get('/:id', requirePermission('managed_offices', 'view'), managedOfficeController.getManagedOffice);
router.put('/:id', requirePermission('managed_offices', 'update'), uploadAgreementMiddleware, managedOfficeController.updateManagedOffice);
router.delete('/:id', requirePermission('managed_offices', 'delete'), managedOfficeController.deleteManagedOffice);

module.exports = router;
