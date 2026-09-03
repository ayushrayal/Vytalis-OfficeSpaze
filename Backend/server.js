const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { initUtilityBillScheduler } = require('./src/services/utilityBill.scheduler');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB before starting the HTTP server
    await connectDB();

    // Initialize daily background scheduler for utility bills
    initUtilityBillScheduler();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
