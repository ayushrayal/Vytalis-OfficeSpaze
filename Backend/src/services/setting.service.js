const Setting = require('../models/Setting');

const DEFAULT_ALERT_WINDOW_HOURS = 2;

const getAlertWindowHours = async () => {
  const setting = await Setting.findOne({ key: 'escalationAlertWindowHours' });
  if (!setting || setting.value === undefined || setting.value === null) {
    return DEFAULT_ALERT_WINDOW_HOURS;
  }
  const numericValue = Number(setting.value);
  return !isNaN(numericValue) && numericValue > 0 ? numericValue : DEFAULT_ALERT_WINDOW_HOURS;
};

const setAlertWindowHours = async (hours) => {
  const numericHours = Number(hours);
  if (isNaN(numericHours) || numericHours <= 0) {
    const error = new Error('Alert window must be a positive number greater than 0');
    error.statusCode = 400;
    throw error;
  }

  if (numericHours > 168) {
    const error = new Error('Alert window cannot exceed 168 hours (7 days)');
    error.statusCode = 400;
    throw error;
  }

  const updatedSetting = await Setting.findOneAndUpdate(
    { key: 'escalationAlertWindowHours' },
    {
      key: 'escalationAlertWindowHours',
      value: numericHours,
      description: 'Hours remaining threshold to surface escalations on the dashboard'
    },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  return Number(updatedSetting.value);
};

module.exports = {
  DEFAULT_ALERT_WINDOW_HOURS,
  getAlertWindowHours,
  setAlertWindowHours
};
