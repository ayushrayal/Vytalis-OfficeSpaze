const express = require('express');
const router = express.Router();
const virtualOfficeController = require('../controllers/virtualOffice.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadAgreementMiddleware = require('../middleware/upload.middleware');

// Protect all Virtual Office endpoints with auth middleware
router.use(authMiddleware);

router.post('/', uploadAgreementMiddleware, virtualOfficeController.createVirtualOffice);
router.get('/', virtualOfficeController.getVirtualOffices);
router.get('/:id', virtualOfficeController.getVirtualOffice);
router.put('/:id', uploadAgreementMiddleware, virtualOfficeController.updateVirtualOffice);
router.delete('/:id', virtualOfficeController.deleteVirtualOffice);

module.exports = router;
