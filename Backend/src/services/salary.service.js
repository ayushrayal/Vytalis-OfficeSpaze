const mongoose = require('mongoose');
const Salary = require('../models/Salary');

const createSalary = async (data) => {
  const salary = await Salary.create(data);
  return salary;
};

const getSalaries = async () => {
  const salaries = await Salary.find().sort({ createdAt: -1 });
  return {
    count: salaries.length,
    salaries
  };
};

const getSalaryById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Salary record not found');
    error.statusCode = 404;
    throw error;
  }

  const salary = await Salary.findById(id);
  if (!salary) {
    const error = new Error('Salary record not found');
    error.statusCode = 404;
    throw error;
  }

  return salary;
};

const updateSalary = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Salary record not found');
    error.statusCode = 404;
    throw error;
  }

  const existingSalary = await Salary.findById(id);
  if (!existingSalary) {
    const error = new Error('Salary record not found');
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = ['employeeName', 'employeeSalary', 'role', 'status', 'email', 'phone'];
  const cleanUpdate = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      cleanUpdate[field] = updateData[field];
    }
  }

  const updatedSalary = await Salary.findByIdAndUpdate(id, cleanUpdate, {
    new: true,
    runValidators: true
  });

  return updatedSalary;
};

const deleteSalary = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Salary record not found');
    error.statusCode = 404;
    throw error;
  }

  const salary = await Salary.findByIdAndDelete(id);
  if (!salary) {
    const error = new Error('Salary record not found');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

module.exports = {
  createSalary,
  getSalaries,
  getSalaryById,
  updateSalary,
  deleteSalary
};
