const express = require('express');
const router = express.Router();
const dedicatedSpaceController = require('../controllers/dedicatedSpace.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const uploadDedicatedSpaceAgreementMiddleware = require('../middleware/uploadDedicatedSpaceAgreement.middleware');

router.use(authMiddleware);

router.post('/', requirePermission('dedicated_spaces', 'create'), uploadDedicatedSpaceAgreementMiddleware, dedicatedSpaceController.createDedicatedSpace);
router.get('/', requirePermission('dedicated_spaces', 'view'), dedicatedSpaceController.getDedicatedSpaces);
router.get('/:id', requirePermission('dedicated_spaces', 'view'), dedicatedSpaceController.getDedicatedSpace);
router.put('/:id', requirePermission('dedicated_spaces', 'update'), uploadDedicatedSpaceAgreementMiddleware, dedicatedSpaceController.updateDedicatedSpace);
router.delete('/:id', requirePermission('dedicated_spaces', 'delete'), dedicatedSpaceController.deleteDedicatedSpace);

module.exports = router;
