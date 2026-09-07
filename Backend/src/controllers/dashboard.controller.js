const { addClient, getConnectedClientCount } = require('../utils/dashboardBroadcaster.util');

const streamDashboardEvents = (req, res) => {
  addClient(req, res);
};

const getDashboardStreamStatus = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      connectedClients: getConnectedClientCount()
    }
  });
};

module.exports = {
  streamDashboardEvents,
  getDashboardStreamStatus
};
