const walkInService = require('../services/walkin.service');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createWalkIn = async (req, res, next) => {
  try {
    const { name, phone, email, date, source, notes } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    if (!date || isNaN(Date.parse(date))) {
      return res.status(400).json({ success: false, message: 'Valid walk-in date is required' });
    }

    if (!source || typeof source !== 'string' || !source.trim()) {
      return res.status(400).json({ success: false, message: 'Source is required' });
    }

    if (email && typeof email === 'string' && email.trim() && !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const walkIn = await walkInService.createWalkIn({
      name,
      phone,
      email,
      date,
      source,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Walk-in created successfully',
      data: {
        walkIn
      }
    });
  } catch (error) {
    next(error);
  }
};

const getWalkIns = async (req, res, next) => {
  try {
    const walkIns = await walkInService.getWalkIns();

    res.status(200).json({
      success: true,
      data: {
        walkIns
      }
    });
  } catch (error) {
    next(error);
  }
};

const getWalkIn = async (req, res, next) => {
  try {
    const walkIn = await walkInService.getWalkInById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        walkIn
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateWalkIn = async (req, res, next) => {
  try {
    const { name, phone, email, date, source, notes } = req.body;

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty' });
    }

    if (phone !== undefined && (typeof phone !== 'string' || !phone.trim())) {
      return res.status(400).json({ success: false, message: 'Phone number cannot be empty' });
    }

    if (date !== undefined && (isNaN(Date.parse(date)) || date === null)) {
      return res.status(400).json({ success: false, message: 'Valid walk-in date is required' });
    }

    if (source !== undefined && (typeof source !== 'string' || !source.trim())) {
      return res.status(400).json({ success: false, message: 'Source cannot be empty' });
    }

    if (email !== undefined && typeof email === 'string' && email.trim() && !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email address' });
    }

    const walkIn = await walkInService.updateWalkIn(req.params.id, {
      name,
      phone,
      email,
      date,
      source,
      notes
    });

    res.status(200).json({
      success: true,
      message: 'Walk-in updated successfully',
      data: {
        walkIn
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteWalkIn = async (req, res, next) => {
  try {
    await walkInService.deleteWalkIn(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Walk-in deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWalkIn,
  getWalkIns,
  getWalkIn,
  updateWalkIn,
  deleteWalkIn
};
