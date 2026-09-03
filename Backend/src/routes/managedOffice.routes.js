const express = require('express');
const router = express.Router();
const managedOfficeController = require('../controllers/managedOffice.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadAgreementMiddleware = require('../middleware/upload.middleware');

// Protect all Managed Office endpoints with auth middleware
router.use(authMiddleware);

router.post('/', uploadAgreementMiddleware, managedOfficeController.createManagedOffice);
router.get('/', managedOfficeController.getManagedOffices);
router.get('/:id', managedOfficeController.getManagedOffice);
router.put('/:id', uploadAgreementMiddleware, managedOfficeController.updateManagedOffice);
router.delete('/:id', managedOfficeController.deleteManagedOffice);

module.exports = router;
