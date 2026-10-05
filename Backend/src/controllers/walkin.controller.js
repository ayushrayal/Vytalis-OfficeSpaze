const walkInService = require('../services/walkin.service');
const walkInFollowUpService = require('../services/walkinFollowUp.service');
const { broadcastDashboardUpdate } = require('../utils/dashboardBroadcaster.util');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createWalkIn = async (req, res, next) => {
  try {
    const { name, phone, email, date, source, notes, status } = req.body;

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
      notes,
      status
    });

    broadcastDashboardUpdate({
      type: 'WALK_IN_CREATED',
      entity: 'walkin',
      entityId: walkIn._id,
      action: 'created'
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
    const result = await walkInService.getWalkIns(req.query);
    const walkIns = Array.isArray(result) ? result : (result.walkIns || []);
    const stats = result.stats || null;
    const sources = result.sources || [];

    res.status(200).json({
      success: true,
      data: {
        walkIns,
        stats,
        sources
      }
    });
  } catch (error) {
    next(error);
  }
};

const getGlobalFollowUps = async (req, res, next) => {
  try {
    const result = await walkInFollowUpService.getGlobalFollowUps(req.query);

    res.status(200).json({
      success: true,
      data: result
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
    const { name, phone, email, date, source, notes, status } = req.body;

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
      notes,
      status
    });

    broadcastDashboardUpdate({
      type: 'WALK_IN_UPDATED',
      entity: 'walkin',
      entityId: walkIn._id,
      action: 'updated'
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

    broadcastDashboardUpdate({
      type: 'WALK_IN_DELETED',
      entity: 'walkin',
      entityId: req.params.id,
      action: 'deleted'
    });

    res.status(200).json({
      success: true,
      message: 'Walk-in deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateWalkInStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!status || typeof status !== 'string') {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const walkIn = await walkInService.updateWalkInStatus(
      req.params.id,
      { status: status.trim(), note },
      req.user
    );

    broadcastDashboardUpdate({
      type: 'WALK_IN_UPDATED',
      entity: 'walkin',
      entityId: walkIn._id,
      action: 'status_updated'
    });

    res.status(200).json({
      success: true,
      message: 'Walk-in status updated successfully',
      data: {
        walkIn
      }
    });
  } catch (error) {
    next(error);
  }
};

const scheduleFollowUp = async (req, res, next) => {
  try {
    const { dueAt, note, notes } = req.body;

    const followUp = await walkInFollowUpService.scheduleFollowUp(
      req.params.id,
      { dueAt, note, notes },
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Follow-up scheduled successfully',
      data: {
        followUp
      }
    });
  } catch (error) {
    next(error);
  }
};

const rescheduleFollowUp = async (req, res, next) => {
  try {
    const { dueAt, note, notes } = req.body;

    const followUp = await walkInFollowUpService.rescheduleFollowUp(
      req.params.id,
      req.params.followUpId,
      { dueAt, note, notes },
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Follow-up rescheduled successfully',
      data: {
        followUp
      }
    });
  } catch (error) {
    next(error);
  }
};

const completeFollowUp = async (req, res, next) => {
  try {
    const { note, notes } = req.body;

    const followUp = await walkInFollowUpService.completeFollowUp(
      req.params.id,
      req.params.followUpId,
      { note, notes },
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Follow-up marked as completed',
      data: {
        followUp
      }
    });
  } catch (error) {
    next(error);
  }
};

const cancelFollowUp = async (req, res, next) => {
  try {
    const { note, notes } = req.body;

    const followUp = await walkInFollowUpService.cancelFollowUp(
      req.params.id,
      req.params.followUpId,
      { note, notes },
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'Follow-up cancelled successfully',
      data: {
        followUp
      }
    });
  } catch (error) {
    next(error);
  }
};

const getFollowUps = async (req, res, next) => {
  try {
    const data = await walkInFollowUpService.getWalkInFollowUps(req.params.id);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getActivity = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const data = await walkInService.getWalkInActivity(req.params.id, { page, limit });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

const addNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    const activity = await walkInService.addWalkInNote(req.params.id, { note }, req.user);

    res.status(201).json({
      success: true,
      message: 'Note added to activity timeline',
      data: {
        activity
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createWalkIn,
  getWalkIns,
  getGlobalFollowUps,
  getWalkIn,
  updateWalkIn,
  deleteWalkIn,
  updateWalkInStatus,
  scheduleFollowUp,
  rescheduleFollowUp,
  completeFollowUp,
  cancelFollowUp,
  getFollowUps,
  getActivity,
  addNote
};

