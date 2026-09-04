const express = require('express');
const router = express.Router();
const coworkSpaceController = require('../controllers/coworkSpace.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadCoworkSpaceAgreementMiddleware = require('../middleware/uploadCoworkSpaceAgreement.middleware');

router.use(authMiddleware);

router.post('/', uploadCoworkSpaceAgreementMiddleware, coworkSpaceController.createCoworkSpace);
router.get('/', coworkSpaceController.getCoworkSpaces);
router.get('/:id', coworkSpaceController.getCoworkSpace);
router.put('/:id', uploadCoworkSpaceAgreementMiddleware, coworkSpaceController.updateCoworkSpace);
router.delete('/:id', coworkSpaceController.deleteCoworkSpace);

module.exports = router;
