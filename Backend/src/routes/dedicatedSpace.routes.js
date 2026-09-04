const express = require('express');
const router = express.Router();
const dedicatedSpaceController = require('../controllers/dedicatedSpace.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadDedicatedSpaceAgreementMiddleware = require('../middleware/uploadDedicatedSpaceAgreement.middleware');

router.use(authMiddleware);

router.post('/', uploadDedicatedSpaceAgreementMiddleware, dedicatedSpaceController.createDedicatedSpace);
router.get('/', dedicatedSpaceController.getDedicatedSpaces);
router.get('/:id', dedicatedSpaceController.getDedicatedSpace);
router.put('/:id', uploadDedicatedSpaceAgreementMiddleware, dedicatedSpaceController.updateDedicatedSpace);
router.delete('/:id', dedicatedSpaceController.deleteDedicatedSpace);

module.exports = router;
