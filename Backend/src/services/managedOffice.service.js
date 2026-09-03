const mongoose = require('mongoose');
const ManagedOffice = require('../models/ManagedOffice');
const imagekitProvider = require('../providers/imagekit.provider');

const MANAGED_OFFICE_FOLDER = '/VytalisOfficeSpaze/Managed-Office/agreements';

const createManagedOffice = async (data, file) => {
  let uploadedAgreement = null;

  if (file) {
    uploadedAgreement = await imagekitProvider.uploadAgreement(
      file.buffer,
      file.originalname,
      MANAGED_OFFICE_FOLDER
    );
    data.agreement = uploadedAgreement;
  }

  try {
    const managedOffice = await ManagedOffice.create(data);
    return managedOffice;
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

const getManagedOffices = async () => {
  const managedOffices = await ManagedOffice.find().sort({ createdAt: -1 });
  return managedOffices;
};

const getManagedOfficeById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Managed office not found');
    error.statusCode = 404;
    throw error;
  }

  const managedOffice = await ManagedOffice.findById(id);
  if (!managedOffice) {
    const error = new Error('Managed office not found');
    error.statusCode = 404;
    throw error;
  }

  return managedOffice;
};

const updateManagedOffice = async (id, updateData, file) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Managed office not found');
    error.statusCode = 404;
    throw error;
  }

  const existingOffice = await ManagedOffice.findById(id);
  if (!existingOffice) {
    const error = new Error('Managed office not found');
    error.statusCode = 404;
    throw error;
  }

  let newAgreement = null;
  if (file) {
    newAgreement = await imagekitProvider.uploadAgreement(
      file.buffer,
      file.originalname,
      MANAGED_OFFICE_FOLDER
    );
    updateData.agreement = newAgreement;
  }

  try {
    const updatedOffice = await ManagedOffice.findByIdAndUpdate(id, updateData, {
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

const deleteManagedOffice = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Managed office not found');
    error.statusCode = 404;
    throw error;
  }

  const managedOffice = await ManagedOffice.findByIdAndDelete(id);
  if (!managedOffice) {
    const error = new Error('Managed office not found');
    error.statusCode = 404;
    throw error;
  }

  if (managedOffice.agreement && managedOffice.agreement.fileId) {
    try {
      await imagekitProvider.deleteAgreement(managedOffice.agreement.fileId);
    } catch (cleanupError) {
      console.error('Failed to clean up ImageKit file after deletion:', cleanupError.message);
    }
  }

  return true;
};

module.exports = {
  createManagedOffice,
  getManagedOffices,
  getManagedOfficeById,
  updateManagedOffice,
  deleteManagedOffice
};
