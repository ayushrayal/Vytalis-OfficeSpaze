const aggregatorService = require('../services/aggregator.service');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createAggregator = async (req, res, next) => {
  try {
    const { name, phone, email, notes } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Aggregator name is required' });
    }

    if (email && (typeof email !== 'string' || (email.trim() && !emailRegex.test(email.trim())))) {
      return res.status(400).json({ success: false, message: 'Invalid email address format' });
    }

    const aggregatorData = {
      name: name.trim(),
      phone: phone && typeof phone === 'string' ? phone.trim() : '',
      email: email && typeof email === 'string' ? email.trim().toLowerCase() : '',
      notes: notes && typeof notes === 'string' ? notes.trim() : ''
    };

    const aggregator = await aggregatorService.createAggregator(aggregatorData);

    res.status(201).json({
      success: true,
      message: 'Aggregator created successfully',
      data: {
        aggregator
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAggregators = async (req, res, next) => {
  try {
    const aggregators = await aggregatorService.getAggregators();

    res.status(200).json({
      success: true,
      data: {
        aggregators
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAggregator = async (req, res, next) => {
  try {
    const aggregator = await aggregatorService.getAggregatorById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        aggregator
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateAggregator = async (req, res, next) => {
  try {
    const { name, phone, email, notes } = req.body;
    const updateData = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Aggregator name cannot be empty' });
      }
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      updateData.phone = typeof phone === 'string' ? phone.trim() : '';
    }

    if (email !== undefined) {
      if (email && (typeof email !== 'string' || (email.trim() && !emailRegex.test(email.trim())))) {
        return res.status(400).json({ success: false, message: 'Invalid email address format' });
      }
      updateData.email = typeof email === 'string' ? email.trim().toLowerCase() : '';
    }

    if (notes !== undefined) {
      updateData.notes = typeof notes === 'string' ? notes.trim() : '';
    }

    const aggregator = await aggregatorService.updateAggregator(req.params.id, updateData);

    res.status(200).json({
      success: true,
      message: 'Aggregator updated successfully',
      data: {
        aggregator
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteAggregator = async (req, res, next) => {
  try {
    await aggregatorService.deleteAggregator(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Aggregator deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAggregator,
  getAggregators,
  getAggregator,
  updateAggregator,
  deleteAggregator
};
