const mongoose = require('mongoose');
const VirtualOffice = require('../models/VirtualOffice');
const imagekitProvider = require('../providers/imagekit.provider');

const createVirtualOffice = async (data, file) => {
  let uploadedAgreement = null;

  if (file) {
    uploadedAgreement = await imagekitProvider.uploadAgreement(file.buffer, file.originalname);
    data.agreement = uploadedAgreement;
  }

  try {
    const virtualOffice = await VirtualOffice.create(data);
    return virtualOffice;
  } catch (error) {
    // Rollback ImageKit file if MongoDB creation failed
    if (uploadedAgreement && uploadedAgreement.fileId) {
      try {
        await imagekitProvider.deleteAgreement(uploadedAgreement.fileId);
      } catch (cleanupError) {
        console.error('Failed to rollback ImageKit file on creation error:', cleanupError.message);
      }
    }
    throw error;
  }
};

const getVirtualOffices = async () => {
  const virtualOffices = await VirtualOffice.find().sort({ createdAt: -1 });
  return virtualOffices;
};

const getVirtualOfficeById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Virtual office not found');
    error.statusCode = 404;
    throw error;
  }

  const virtualOffice = await VirtualOffice.findById(id);
  if (!virtualOffice) {
    const error = new Error('Virtual office not found');
    error.statusCode = 404;
    throw error;
  }

  return virtualOffice;
};

const updateVirtualOffice = async (id, updateData, file) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Virtual office not found');
    error.statusCode = 404;
    throw error;
  }

  const existingOffice = await VirtualOffice.findById(id);
  if (!existingOffice) {
    const error = new Error('Virtual office not found');
    error.statusCode = 404;
    throw error;
  }

  let newAgreement = null;
  if (file) {
    newAgreement = await imagekitProvider.uploadAgreement(file.buffer, file.originalname);
    updateData.agreement = newAgreement;
  }

  try {
    const updatedOffice = await VirtualOffice.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    // If update succeeded and a new agreement was uploaded, clean up the old file safely
    if (newAgreement && existingOffice.agreement && existingOffice.agreement.fileId) {
      try {
        await imagekitProvider.deleteAgreement(existingOffice.agreement.fileId);
      } catch (cleanupError) {
        console.error('Failed to clean up old ImageKit file after update:', cleanupError.message);
      }
    }

    return updatedOffice;
  } catch (error) {
    // Rollback new ImageKit file if MongoDB update failed
    if (newAgreement && newAgreement.fileId) {
      try {
        await imagekitProvider.deleteAgreement(newAgreement.fileId);
      } catch (cleanupError) {
        console.error('Failed to rollback new ImageKit file on update error:', cleanupError.message);
      }
    }
    throw error;
  }
};

const deleteVirtualOffice = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Virtual office not found');
    error.statusCode = 404;
    throw error;
  }

  const virtualOffice = await VirtualOffice.findByIdAndDelete(id);
  if (!virtualOffice) {
    const error = new Error('Virtual office not found');
    error.statusCode = 404;
    throw error;
  }

  if (virtualOffice.agreement && virtualOffice.agreement.fileId) {
    try {
      await imagekitProvider.deleteAgreement(virtualOffice.agreement.fileId);
    } catch (cleanupError) {
      console.error('Failed to clean up ImageKit file after deletion:', cleanupError.message);
    }
  }

  return true;
};

module.exports = {
  createVirtualOffice,
  getVirtualOffices,
  getVirtualOfficeById,
  updateVirtualOffice,
  deleteVirtualOffice
};
