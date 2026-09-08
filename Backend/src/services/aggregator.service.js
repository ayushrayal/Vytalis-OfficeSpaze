const mongoose = require('mongoose');
const Aggregator = require('../models/Aggregator');
const VirtualOffice = require('../models/VirtualOffice');

const createAggregator = async (data) => {
  const aggregator = await Aggregator.create(data);
  return aggregator;
};

const getAggregators = async () => {
  const aggregators = await Aggregator.find().sort({ createdAt: -1 });

  // Compute linked Virtual Office count for each aggregator efficiently
  const counts = await VirtualOffice.aggregate([
    { $match: { aggregatorId: { $ne: null } } },
    { $group: { _id: '$aggregatorId', count: { $sum: 1 } } }
  ]);

  const countMap = {};
  counts.forEach((item) => {
    countMap[item._id.toString()] = item.count;
  });

  const aggregatorsWithCounts = aggregators.map((agg) => {
    const obj = agg.toJSON();
    obj.linkedVirtualOfficesCount = countMap[agg._id.toString()] || 0;
    return obj;
  });

  return aggregatorsWithCounts;
};

const getAggregatorById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Aggregator not found');
    error.statusCode = 404;
    throw error;
  }

  const aggregator = await Aggregator.findById(id);
  if (!aggregator) {
    const error = new Error('Aggregator not found');
    error.statusCode = 404;
    throw error;
  }

  // Fetch all linked Virtual Offices for relationship view
  const linkedVirtualOffices = await VirtualOffice.find({ aggregatorId: id }).sort({ createdAt: -1 });

  const obj = aggregator.toJSON();
  obj.linkedVirtualOffices = linkedVirtualOffices;
  obj.linkedVirtualOfficesCount = linkedVirtualOffices.length;

  return obj;
};

const updateAggregator = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Aggregator not found');
    error.statusCode = 404;
    throw error;
  }

  const updatedAggregator = await Aggregator.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  if (!updatedAggregator) {
    const error = new Error('Aggregator not found');
    error.statusCode = 404;
    throw error;
  }

  return updatedAggregator;
};

const deleteAggregator = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Aggregator not found');
    error.statusCode = 404;
    throw error;
  }

  // Relationship Safety Check: Block deletion if linked to ANY Virtual Office
  const linkedCount = await VirtualOffice.countDocuments({ aggregatorId: id });
  if (linkedCount > 0) {
    const error = new Error(
      `Cannot delete aggregator because it is linked to ${linkedCount} virtual office${linkedCount > 1 ? 's' : ''}. Please reassign or remove the aggregator from those offices before deleting.`
    );
    error.statusCode = 400;
    throw error;
  }

  const aggregator = await Aggregator.findByIdAndDelete(id);
  if (!aggregator) {
    const error = new Error('Aggregator not found');
    error.statusCode = 404;
    throw error;
  }

  return true;
};

module.exports = {
  createAggregator,
  getAggregators,
  getAggregatorById,
  updateAggregator,
  deleteAggregator
};
