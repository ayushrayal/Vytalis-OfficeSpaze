const mongoose = require('mongoose');
const UtilityBill = require('../models/UtilityBill');
const imagekitProvider = require('../providers/imagekit.provider');

const UTILITY_BILL_FOLDER = '/VytalisOfficeSpaze/Utility-Bills/receipts';

const getNextMonthFirstDayIST = (currentDate = new Date()) => {
  const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'numeric', day: 'numeric' };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(currentDate);
  const month = parseInt(parts.find((p) => p.type === 'month').value, 10);
  const year = parseInt(parts.find((p) => p.type === 'year').value, 10);

  let nextMonth = month + 1;
  let nextYear = year;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  const nextMonthStr = String(nextMonth).padStart(2, '0');
  return new Date(`${nextYear}-${nextMonthStr}-01T00:00:00.000+05:30`);
};

const createUtilityBill = async (data, file) => {
  let uploadedReceipt = null;

  // System-calculated reminder date (1st of next month in IST)
  data.reminderDate = getNextMonthFirstDayIST(new Date());

  if (file) {
    uploadedReceipt = await imagekitProvider.uploadAgreement(
      file.buffer,
      file.originalname,
      UTILITY_BILL_FOLDER
    );
    data.receipt = uploadedReceipt;
  }

  try {
    const bill = await UtilityBill.create(data);

    if (!bill.parentBillId) {
      bill.parentBillId = bill._id;
      await bill.save();
    }

    return bill;
  } catch (error) {
    // Rollback ImageKit file if MongoDB creation failed
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

const getUtilityBills = async () => {
  const utilityBills = await UtilityBill.find().sort({ reminderDate: -1, createdAt: -1 });
  return utilityBills;
};

const getDueUtilityBills = async () => {
  // Return bills where status is "Due" and series is not paused
  const dueBills = await UtilityBill.find({
    status: 'Due',
    isPaused: { $ne: true }
  }).sort({ reminderDate: 1 });

  return {
    count: dueBills.length,
    utilityBills: dueBills
  };
};

const getUtilityBillById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Utility bill not found');
    error.statusCode = 404;
    throw error;
  }

  const utilityBill = await UtilityBill.findById(id);
  if (!utilityBill) {
    const error = new Error('Utility bill not found');
    error.statusCode = 404;
    throw error;
  }

  return utilityBill;
};

const updateUtilityBill = async (id, updateData, file) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Utility bill not found');
    error.statusCode = 404;
    throw error;
  }

  const existingBill = await UtilityBill.findById(id);
  if (!existingBill) {
    const error = new Error('Utility bill not found');
    error.statusCode = 404;
    throw error;
  }

  // If isPaused is toggled, update the root parent series so future cycles respect pause state
  if (updateData.isPaused !== undefined) {
    const rootParentId = existingBill.parentBillId || existingBill._id;
    await UtilityBill.updateMany(
      { $or: [{ _id: rootParentId }, { parentBillId: rootParentId }] },
      { isPaused: updateData.isPaused }
    );
  }

  let newReceipt = null;
  if (file) {
    newReceipt = await imagekitProvider.uploadAgreement(
      file.buffer,
      file.originalname,
      UTILITY_BILL_FOLDER
    );
    updateData.receipt = newReceipt;
  }

  try {
    const updatedBill = await UtilityBill.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    // If update succeeded and a new receipt was uploaded, clean up the old file safely
    if (newReceipt && existingBill.receipt && existingBill.receipt.fileId) {
      try {
        await imagekitProvider.deleteAgreement(existingBill.receipt.fileId);
      } catch (cleanupError) {
        console.error('Failed to clean up old ImageKit receipt after update:', cleanupError.message);
      }
    }

    return updatedBill;
  } catch (error) {
    // Rollback new ImageKit file if MongoDB update failed
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

const deleteUtilityBill = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Utility bill not found');
    error.statusCode = 404;
    throw error;
  }

  const utilityBill = await UtilityBill.findByIdAndDelete(id);
  if (!utilityBill) {
    const error = new Error('Utility bill not found');
    error.statusCode = 404;
    throw error;
  }

  if (utilityBill.receipt && utilityBill.receipt.fileId) {
    try {
      await imagekitProvider.deleteAgreement(utilityBill.receipt.fileId);
    } catch (cleanupError) {
      console.error('Failed to clean up ImageKit receipt after deletion:', cleanupError.message);
    }
  }

  return true;
};

module.exports = {
  getNextMonthFirstDayIST,
  createUtilityBill,
  getUtilityBills,
  getDueUtilityBills,
  getUtilityBillById,
  updateUtilityBill,
  deleteUtilityBill
};
