const mongoose = require('mongoose');
const CoworkSpace = require('../models/CoworkSpace');
const imagekitProvider = require('../providers/imagekit.provider');

const COWORK_SPACE_FOLDER = '/VytalisOfficeSpaze/Cowork-Space/agreements';

const createCoworkSpace = async (data, file) => {
  let uploadedAgreement = null;

  if (file) {
    uploadedAgreement = await imagekitProvider.uploadAgreement(
      file.buffer,
      file.originalname,
      COWORK_SPACE_FOLDER
    );
    data.agreement = uploadedAgreement;
  }

  try {
    const coworkSpace = await CoworkSpace.create(data);
    return coworkSpace;
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

const getCoworkSpaces = async () => {
  const coworkSpaces = await CoworkSpace.find().sort({ addedDate: -1, createdAt: -1 });
  return coworkSpaces;
};

const getCoworkSpaceById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Cowork space record not found');
    error.statusCode = 404;
    throw error;
  }

  const coworkSpace = await CoworkSpace.findById(id);
  if (!coworkSpace) {
    const error = new Error('Cowork space record not found');
    error.statusCode = 404;
    throw error;
  }

  return coworkSpace;
};

const updateCoworkSpace = async (id, updateData, file) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Cowork space record not found');
    error.statusCode = 404;
    throw error;
  }

  const existingRecord = await CoworkSpace.findById(id);
  if (!existingRecord) {
    const error = new Error('Cowork space record not found');
    error.statusCode = 404;
    throw error;
  }

  let newAgreement = null;
  if (file) {
    newAgreement = await imagekitProvider.uploadAgreement(
      file.buffer,
      file.originalname,
      COWORK_SPACE_FOLDER
    );
    updateData.agreement = newAgreement;
  }

  try {
    const updatedRecord = await CoworkSpace.findByIdAndUpdate(id, updateData, {
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

const deleteCoworkSpace = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Cowork space record not found');
    error.statusCode = 404;
    throw error;
  }

  const coworkSpace = await CoworkSpace.findByIdAndDelete(id);
  if (!coworkSpace) {
    const error = new Error('Cowork space record not found');
    error.statusCode = 404;
    throw error;
  }

  if (coworkSpace.agreement && coworkSpace.agreement.fileId) {
    try {
      await imagekitProvider.deleteAgreement(coworkSpace.agreement.fileId);
    } catch (cleanupError) {
      console.error('Failed to clean up ImageKit agreement after deletion:', cleanupError.message);
    }
  }

  return true;
};

module.exports = {
  createCoworkSpace,
  getCoworkSpaces,
  getCoworkSpaceById,
  updateCoworkSpace,
  deleteCoworkSpace
};
