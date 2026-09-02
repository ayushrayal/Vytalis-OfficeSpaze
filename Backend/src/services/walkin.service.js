const mongoose = require('mongoose');
const WalkIn = require('../models/WalkIn');

const createWalkIn = async ({ name, phone, email, date, source, notes }) => {
  const walkInData = {
    name: name.trim(),
    phone: phone.trim(),
    date: new Date(date),
    source: source.trim(),
    email: email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : null,
    notes: notes && typeof notes === 'string' && notes.trim() ? notes.trim() : null
  };

  const walkIn = await WalkIn.create(walkInData);
  return walkIn;
};

const getWalkIns = async () => {
  const walkIns = await WalkIn.find().sort({ date: -1, createdAt: -1 });
  return walkIns;
};

const getWalkInById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  const walkIn = await WalkIn.findById(id);
  if (!walkIn) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  return walkIn;
};

const updateWalkIn = async (id, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  const cleanUpdate = {};

  if (updateData.name !== undefined) {
    cleanUpdate.name = updateData.name.trim();
  }

  if (updateData.phone !== undefined) {
    cleanUpdate.phone = updateData.phone.trim();
  }

  if (updateData.date !== undefined) {
    cleanUpdate.date = new Date(updateData.date);
  }

  if (updateData.source !== undefined) {
    cleanUpdate.source = updateData.source.trim();
  }

  if (updateData.email !== undefined) {
    cleanUpdate.email =
      typeof updateData.email === 'string' && updateData.email.trim()
        ? updateData.email.trim().toLowerCase()
        : null;
  }

  if (updateData.notes !== undefined) {
    cleanUpdate.notes =
      typeof updateData.notes === 'string' && updateData.notes.trim()
        ? updateData.notes.trim()
        : null;
  }

  const walkIn = await WalkIn.findByIdAndUpdate(id, cleanUpdate, {
    new: true,
    runValidators: true
  });

  if (!walkIn) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  return walkIn;
};

const deleteWalkIn = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  const walkIn = await WalkIn.findByIdAndDelete(id);
  if (!walkIn) {
    const error = new Error('Walk-in not found');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

module.exports = {
  createWalkIn,
  getWalkIns,
  getWalkInById,
  updateWalkIn,
  deleteWalkIn
};
