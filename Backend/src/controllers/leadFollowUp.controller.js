const leadFollowUpService = require('../services/leadFollowUp.service');

const scheduleFollowUp = async (req, res, next) => {
  try {
    const followUp = await leadFollowUpService.scheduleFollowUp(
      req.params.id,
      req.body,
      req.user
    );
    res.status(201).json({
      success: true,
      data: followUp
    });
  } catch (err) {
    next(err);
  }
};

const rescheduleFollowUp = async (req, res, next) => {
  try {
    const followUp = await leadFollowUpService.rescheduleFollowUp(
      req.params.id,
      req.params.followUpId,
      req.body,
      req.user
    );
    res.status(200).json({
      success: true,
      data: followUp
    });
  } catch (err) {
    next(err);
  }
};

const completeFollowUp = async (req, res, next) => {
  try {
    const followUp = await leadFollowUpService.completeFollowUp(
      req.params.id,
      req.params.followUpId,
      req.user
    );
    res.status(200).json({
      success: true,
      data: followUp
    });
  } catch (err) {
    next(err);
  }
};

const cancelFollowUp = async (req, res, next) => {
  try {
    const followUp = await leadFollowUpService.cancelFollowUp(
      req.params.id,
      req.params.followUpId,
      req.user
    );
    res.status(200).json({
      success: true,
      data: followUp
    });
  } catch (err) {
    next(err);
  }
};

const getLeadFollowUps = async (req, res, next) => {
  try {
    const result = await leadFollowUpService.getLeadFollowUps(
      req.params.id,
      req.query,
      req.user
    );
    res.status(200).json({
      success: true,
      data: result.followUps,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

const getFollowUpsList = async (req, res, next) => {
  try {
    const result = await leadFollowUpService.getFollowUpsList(
      req.query,
      req.user
    );
    res.status(200).json({
      success: true,
      data: result.followUps,
      pagination: result.pagination
    });
  } catch (err) {
    next(err);
  }
};

const getFollowUpMetrics = async (req, res, next) => {
  try {
    const metrics = await leadFollowUpService.getFollowUpMetrics(req.user);
    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (err) {
    next(err);
  }
};

const processMissedFollowUps = async (req, res, next) => {
  try {
    const result = await leadFollowUpService.markMissedFollowUps({
      actorId: req.user?._id
    });
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  scheduleFollowUp,
  rescheduleFollowUp,
  completeFollowUp,
  cancelFollowUp,
  getLeadFollowUps,
  getFollowUpsList,
  getFollowUpMetrics,
  processMissedFollowUps
};
