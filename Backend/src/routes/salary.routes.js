const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salary.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { requirePermission } = require('../middleware/permission.middleware');

// Protect all Salary endpoints with auth middleware
router.use(authMiddleware);

router.post('/', requirePermission('salaries', 'create'), salaryController.createSalary);
router.get('/', requirePermission('salaries', 'view'), salaryController.getSalaries);
router.get('/:id', requirePermission('salaries', 'view'), salaryController.getSalary);
router.put('/:id', requirePermission('salaries', 'update'), salaryController.updateSalary);
router.delete('/:id', requirePermission('salaries', 'delete'), salaryController.deleteSalary);

module.exports = router;
