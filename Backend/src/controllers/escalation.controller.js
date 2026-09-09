const escalationService = require('../services/escalation.service');
const settingService = require('../services/setting.service');
const { broadcastDashboardUpdate } = require('../utils/dashboardBroadcaster.util');

const VALID_PRIORITIES = ['High', 'Medium', 'Low'];

const createEscalation = async (req, res, next) => {
  try {
    const { escalationType, description, escalatedBy, priority, resolveTime } = req.body;

    if (!escalationType || typeof escalationType !== 'string' || !escalationType.trim()) {
      return res.status(400).json({ success: false, message: 'Escalation type is required' });
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    if (!escalatedBy || typeof escalatedBy !== 'string' || !escalatedBy.trim()) {
      return res.status(400).json({ success: false, message: 'Escalated by is required' });
    }

    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Priority must be High, Medium, or Low' });
    }

    const numericResolveTime = Number(resolveTime);
    if (resolveTime === undefined || resolveTime === null || isNaN(numericResolveTime) || numericResolveTime <= 0) {
      return res.status(400).json({ success: false, message: 'Resolve time must be a positive number greater than 0' });
    }

    const escalation = await escalationService.createEscalation({
      escalationType,
      description,
      escalatedBy,
      priority: priority || 'Medium',
      resolveTime: numericResolveTime
    });

    broadcastDashboardUpdate({
      type: 'ESCALATION_CREATED',
      entity: 'escalation',
      entityId: escalation.id || escalation._id,
      action: 'created'
    });

    res.status(201).json({
      success: true,
      message: 'Escalation created successfully',
      data: {
        escalation
      }
    });
  } catch (error) {
    next(error);
  }
};

const getEscalations = async (req, res, next) => {
  try {
    const result = await escalationService.getEscalations(req.query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getAttentionEscalations = async (req, res, next) => {
  try {
    const result = await escalationService.getAttentionEscalations();

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getEscalation = async (req, res, next) => {
  try {
    const escalation = await escalationService.getEscalationById(req.params.id);

    res.status(200).json({
      success: true,
      data: {
        escalation
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateEscalation = async (req, res, next) => {
  try {
    const { escalationType, description, escalatedBy, priority, resolveTime } = req.body;
    const updateData = {};

    if (escalationType !== undefined) {
      if (typeof escalationType !== 'string' || !escalationType.trim()) {
        return res.status(400).json({ success: false, message: 'Escalation type cannot be empty' });
      }
      updateData.escalationType = escalationType.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({ success: false, message: 'Description cannot be empty' });
      }
      updateData.description = description.trim();
    }

    if (escalatedBy !== undefined) {
      if (typeof escalatedBy !== 'string' || !escalatedBy.trim()) {
        return res.status(400).json({ success: false, message: 'Escalated by cannot be empty' });
      }
      updateData.escalatedBy = escalatedBy.trim();
    }

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ success: false, message: 'Priority must be High, Medium, or Low' });
      }
      updateData.priority = priority;
    }

    if (resolveTime !== undefined) {
      const numericResolveTime = Number(resolveTime);
      if (isNaN(numericResolveTime) || numericResolveTime <= 0) {
        return res.status(400).json({ success: false, message: 'Resolve time must be a number greater than 0' });
      }
      updateData.resolveTime = numericResolveTime;
    }

    const escalation = await escalationService.updateEscalation(req.params.id, updateData);

    broadcastDashboardUpdate({
      type: 'ESCALATION_UPDATED',
      entity: 'escalation',
      entityId: escalation.id || escalation._id,
      action: 'updated'
    });

    res.status(200).json({
      success: true,
      message: 'Escalation updated successfully',
      data: {
        escalation
      }
    });
  } catch (error) {
    next(error);
  }
};

const resolveEscalation = async (req, res, next) => {
  try {
    const escalation = await escalationService.resolveEscalation(req.params.id);

    broadcastDashboardUpdate({
      type: 'ESCALATION_RESOLVED',
      entity: 'escalation',
      entityId: escalation.id || escalation._id,
      action: 'resolved'
    });

    res.status(200).json({
      success: true,
      message: 'Escalation marked as resolved successfully',
      data: {
        escalation
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteEscalation = async (req, res, next) => {
  try {
    await escalationService.deleteEscalation(req.params.id);

    broadcastDashboardUpdate({
      type: 'ESCALATION_DELETED',
      entity: 'escalation',
      entityId: req.params.id,
      action: 'deleted'
    });

    res.status(200).json({
      success: true,
      message: 'Escalation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getAlertWindowSettings = async (req, res, next) => {
  try {
    const alertWindowHours = await settingService.getAlertWindowHours();

    res.status(200).json({
      success: true,
      data: {
        alertWindowHours
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateAlertWindowSettings = async (req, res, next) => {
  try {
    const { alertWindowHours } = req.body;
    const numericHours = Number(alertWindowHours);

    if (alertWindowHours === undefined || alertWindowHours === null || isNaN(numericHours) || numericHours <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Alert window must be a positive number greater than 0'
      });
    }

    const updatedHours = await settingService.setAlertWindowHours(numericHours);

    // Notify all connected dashboard clients so their attention list recalculates
    broadcastDashboardUpdate({
      type: 'ESCALATION_UPDATED',
      entity: 'settings',
      action: 'alert_window_updated',
      alertWindowHours: updatedHours
    });

    res.status(200).json({
      success: true,
      message: 'Dashboard alert window updated successfully',
      data: {
        alertWindowHours: updatedHours
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEscalation,
  getEscalations,
  getAttentionEscalations,
  getEscalation,
  updateEscalation,
  resolveEscalation,
  deleteEscalation,
  getAlertWindowSettings,
  updateAlertWindowSettings
};
