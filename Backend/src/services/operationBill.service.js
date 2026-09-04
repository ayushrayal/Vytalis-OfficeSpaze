const mongoose = require('mongoose');
const OperationBill = require('../models/OperationBill');
const imagekitProvider = require('../providers/imagekit.provider');

const OPERATION_BILL_FOLDER = '/VytalisOfficeSpaze/Operation-Bills/receipts';

const createOperationBill = async (data, file) => {
  let uploadedReceipt = null;

  if (file) {
    uploadedReceipt = await imagekitProvider.uploadAgreement(
      file.buffer,
      file.originalname,
      OPERATION_BILL_FOLDER
    );
    data.receipt = uploadedReceipt;
  }

  try {
    const operationBill = await OperationBill.create(data);
    return operationBill;
  } catch (error) {
    if (uploadedReceipt && uploadedReceipt.fileId) {
      try {
        await imagekitProvider.deleteAgreement(uploadedReceipt.fileId);
      } catch (cleanupError) {
        console.error('Failed to rollback ImageKit receipt on creation error:', cleanupError.message);
      }
    }
    throw error;
  }
};

const getOperationBills = async () => {
  const operationBills = await OperationBill.find().sort({ date: -1, createdAt: -1 });
  return operationBills;
};

const getOperationBillById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Operation bill not found');
    error.statusCode = 404;
    throw error;
  }

  const operationBill = await OperationBill.findById(id);
  if (!operationBill) {
    const error = new Error('Operation bill not found');
    error.statusCode = 404;
    throw error;
  }

  return operationBill;
};

const updateOperationBill = async (id, updateData, file) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Operation bill not found');
    error.statusCode = 404;
    throw error;
  }

  const existingBill = await OperationBill.findById(id);
  if (!existingBill) {
    const error = new Error('Operation bill not found');
    error.statusCode = 404;
    throw error;
  }

  let newReceipt = null;
  if (file) {
    newReceipt = await imagekitProvider.uploadAgreement(
      file.buffer,
      file.originalname,
      OPERATION_BILL_FOLDER
    );
    updateData.receipt = newReceipt;
  }

  try {
    const updatedBill = await OperationBill.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (newReceipt && existingBill.receipt && existingBill.receipt.fileId) {
      try {
        await imagekitProvider.deleteAgreement(existingBill.receipt.fileId);
      } catch (cleanupError) {
        console.error('Failed to clean up old ImageKit receipt after update:', cleanupError.message);
      }
    }

    return updatedBill;
  } catch (error) {
    if (newReceipt && newReceipt.fileId) {
      try {
        await imagekitProvider.deleteAgreement(newReceipt.fileId);
      } catch (cleanupError) {
        console.error('Failed to rollback new ImageKit receipt on update error:', cleanupError.message);
      }
    }
    throw error;
  }
};

const deleteOperationBill = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Operation bill not found');
    error.statusCode = 404;
    throw error;
  }

  const operationBill = await OperationBill.findByIdAndDelete(id);
  if (!operationBill) {
    const error = new Error('Operation bill not found');
    error.statusCode = 404;
    throw error;
  }

  if (operationBill.receipt && operationBill.receipt.fileId) {
    try {
      await imagekitProvider.deleteAgreement(operationBill.receipt.fileId);
    } catch (cleanupError) {
      console.error('Failed to clean up ImageKit receipt after deletion:', cleanupError.message);
    }
  }

  return true;
};

module.exports = {
  createOperationBill,
  getOperationBills,
  getOperationBillById,
  updateOperationBill,
  deleteOperationBill
};
