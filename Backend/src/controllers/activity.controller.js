const activityService = require('../services/activity.service');

const getRecentActivities = async (req, res, next) => {
  try {
    const { limit, entityType } = req.query;

    const activities = await activityService.getRecentActivities({
      limit,
      entityType
    });

    res.status(200).json({
      success: true,
      data: {
        activities
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecentActivities
};
