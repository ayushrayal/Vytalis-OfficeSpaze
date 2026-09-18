const express = require('express');
const router = express.Router();
const coworkSpaceController = require('../controllers/coworkSpace.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');
const uploadCoworkSpaceAgreementMiddleware = require('../middleware/uploadCoworkSpaceAgreement.middleware');

router.use(authMiddleware);

router.post('/', requirePermission('cowork_spaces', 'create'), uploadCoworkSpaceAgreementMiddleware, coworkSpaceController.createCoworkSpace);
router.get('/', requirePermission('cowork_spaces', 'view'), coworkSpaceController.getCoworkSpaces);
router.get('/:id', requirePermission('cowork_spaces', 'view'), coworkSpaceController.getCoworkSpace);
router.put('/:id', requirePermission('cowork_spaces', 'update'), uploadCoworkSpaceAgreementMiddleware, coworkSpaceController.updateCoworkSpace);
router.delete('/:id', requirePermission('cowork_spaces', 'delete'), coworkSpaceController.deleteCoworkSpace);

module.exports = router;
