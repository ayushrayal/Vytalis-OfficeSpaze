const salaryService = require('../services/salary.service');
const { broadcastDashboardUpdate } = require('../utils/dashboardBroadcaster.util');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createSalary = async (req, res, next) => {
  try {
    const { employeeName, employeeSalary, role, status, email, phone } = req.body;

    if (!employeeName || typeof employeeName !== 'string' || !employeeName.trim()) {
      return res.status(400).json({ success: false, message: 'Employee name is required' });
    }

    if (employeeSalary === undefined || employeeSalary === null || String(employeeSalary).trim() === '') {
      return res.status(400).json({ success: false, message: 'Employee salary is required' });
    }

    const salaryAmount = Number(String(employeeSalary).trim());
    if (isNaN(salaryAmount) || salaryAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee salary must be a positive number greater than 0'
      });
    }

    if (!role || typeof role !== 'string' || !role.trim()) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    if (!status || (status !== 'Due' && status !== 'Paid')) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "Due" or "Paid"'
      });
    }

    if (!email || typeof email !== 'string' || !email.trim() || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Valid email address is required' });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const salaryData = {
      employeeName: employeeName.trim(),
      employeeSalary: salaryAmount,
      role: role.trim(),
      status,
      email: email.trim().toLowerCase(),
      phone: phone.trim()
    };

    const salary = await salaryService.createSalary(salaryData);

    broadcastDashboardUpdate({
      type: 'SALARY_CREATED',
      entity: 'salary',
      entityId: salary._id,
      action: 'created'
    });

    res.status(201).json({
      success: true,
      message: 'Salary created successfully',
      data: {
        salary
      }
    });
  } catch (error) {
    next(error);
  }
};

const getSalaries = async (req, res, next) => {
  try {
    const data = await salaryService.getSalaries();

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getSalary = async (req, res, next) => {
  try {
    const salary = await salaryService.getSalaryById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        salary
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateSalary = async (req, res, next) => {
  try {
    const { employeeName, employeeSalary, role, status, email, phone } = req.body;
    const updateData = {};

    if (employeeName !== undefined) {
      if (typeof employeeName !== 'string' || !employeeName.trim()) {
        return res.status(400).json({ success: false, message: 'Employee name cannot be empty' });
      }
      updateData.employeeName = employeeName.trim();
    }

    if (employeeSalary !== undefined) {
      const salaryAmount = Number(String(employeeSalary).trim());
      if (isNaN(salaryAmount) || salaryAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Employee salary must be a positive number greater than 0'
        });
      }
      updateData.employeeSalary = salaryAmount;
    }

    if (role !== undefined) {
      if (typeof role !== 'string' || !role.trim()) {
        return res.status(400).json({ success: false, message: 'Role cannot be empty' });
      }
      updateData.role = role.trim();
    }

    if (status !== undefined) {
      if (status !== 'Due' && status !== 'Paid') {
        return res.status(400).json({
          success: false,
          message: 'Status must be either "Due" or "Paid"'
        });
      }
      updateData.status = status;
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !email.trim() || !emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Valid email address is required' });
      }
      updateData.email = email.trim().toLowerCase();
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string' || !phone.trim()) {
        return res.status(400).json({ success: false, message: 'Phone number cannot be empty' });
      }
      updateData.phone = phone.trim();
    }

    const salary = await salaryService.updateSalary(req.params.id, updateData);

    broadcastDashboardUpdate({
      type: 'SALARY_UPDATED',
      entity: 'salary',
      entityId: salary._id,
      action: 'updated'
    });

    res.status(200).json({
      success: true,
      message: 'Salary updated successfully',
      data: {
        salary
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteSalary = async (req, res, next) => {
  try {
    await salaryService.deleteSalary(req.params.id);

    broadcastDashboardUpdate({
      type: 'SALARY_DELETED',
      entity: 'salary',
      entityId: req.params.id,
      action: 'deleted'
    });

    res.status(200).json({
      success: true,
      message: 'Salary deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSalary,
  getSalaries,
  getSalary,
  updateSalary,
  deleteSalary
};
