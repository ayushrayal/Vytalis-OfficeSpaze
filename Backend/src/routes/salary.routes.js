const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salary.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Protect all Salary endpoints with auth middleware
router.use(authMiddleware);

router.post('/', salaryController.createSalary);
router.get('/', salaryController.getSalaries);
router.get('/:id', salaryController.getSalary);
router.put('/:id', salaryController.updateSalary);
router.delete('/:id', salaryController.deleteSalary);

module.exports = router;
