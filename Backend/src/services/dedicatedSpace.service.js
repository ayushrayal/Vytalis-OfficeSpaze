const mongoose = require('mongoose');
const DedicatedSpace = require('../models/DedicatedSpace');
const imagekitProvider = require('../providers/imagekit.provider');

const DEDICATED_SPACE_FOLDER = '/VytalisOfficeSpaze/Dedicated-Space/agreements';

const createDedicatedSpace = async (data, file) => {
  let uploadedAgreement = null;

  if (file) {
    uploadedAgreement = await imagekitProvider.uploadAgreement(
      file.buffer,
      file.originalname,
      DEDICATED_SPACE_FOLDER
    );
    data.agreement = uploadedAgreement;
  }

  try {
    const dedicatedSpace = await DedicatedSpace.create(data);
    return dedicatedSpace;
  } catch (error) {
    if (uploadedAgreement && uploadedAgreement.fileId) {
      try {
        await imagekitProvider.deleteAgreement(uploadedAgreement.fileId);
      } catch (cleanupError) {
        console.error('Failed to rollback ImageKit agreement on creation error:', cleanupError.message);
      }
    }
    throw error;
  }
};

const getDedicatedSpaces = async () => {
  const dedicatedSpaces = await DedicatedSpace.find().sort({ addedDate: -1, createdAt: -1 });
  return dedicatedSpaces;
};

const getDedicatedSpaceById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Dedicated space record not found');
    error.statusCode = 404;
    throw error;
  }

  const dedicatedSpace = await DedicatedSpace.findById(id);
  if (!dedicatedSpace) {
    const error = new Error('Dedicated space record not found');
    error.statusCode = 404;
    throw error;
  }

  return dedicatedSpace;
};

const updateDedicatedSpace = async (id, updateData, file) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Dedicated space record not found');
    error.statusCode = 404;
    throw error;
  }

  const existingRecord = await DedicatedSpace.findById(id);
  if (!existingRecord) {
    const error = new Error('Dedicated space record not found');
    error.statusCode = 404;
    throw error;
  }

  let newAgreement = null;
  if (file) {
    newAgreement = await imagekitProvider.uploadAgreement(
      file.buffer,
      file.originalname,
      DEDICATED_SPACE_FOLDER
    );
    updateData.agreement = newAgreement;
  }

  try {
    const updatedRecord = await DedicatedSpace.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (newAgreement && existingRecord.agreement && existingRecord.agreement.fileId) {
      try {
        await imagekitProvider.deleteAgreement(existingRecord.agreement.fileId);
      } catch (cleanupError) {
        console.error('Failed to clean up old ImageKit agreement after update:', cleanupError.message);
      }
    }

    return updatedRecord;
  } catch (error) {
    if (newAgreement && newAgreement.fileId) {
      try {
        await imagekitProvider.deleteAgreement(newAgreement.fileId);
      } catch (cleanupError) {
        console.error('Failed to rollback new ImageKit agreement on update error:', cleanupError.message);
      }
    }
    throw error;
  }
};

const deleteDedicatedSpace = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Dedicated space record not found');
    error.statusCode = 404;
    throw error;
  }

  const dedicatedSpace = await DedicatedSpace.findByIdAndDelete(id);
  if (!dedicatedSpace) {
    const error = new Error('Dedicated space record not found');
    error.statusCode = 404;
    throw error;
  }

  if (dedicatedSpace.agreement && dedicatedSpace.agreement.fileId) {
    try {
      await imagekitProvider.deleteAgreement(dedicatedSpace.agreement.fileId);
    } catch (cleanupError) {
      console.error('Failed to clean up ImageKit agreement after deletion:', cleanupError.message);
    }
  }

  return true;
};

module.exports = {
  createDedicatedSpace,
  getDedicatedSpaces,
  getDedicatedSpaceById,
  updateDedicatedSpace,
  deleteDedicatedSpace
};
