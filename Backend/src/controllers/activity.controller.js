const activityService = require('../services/activity.service');

const getRecentActivities = async (req, res, next) => {
  try {
    const { page, limit, entityType } = req.query;

    const result = await activityService.getRecentActivities({
      page,
      limit,
      entityType
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecentActivities
};
