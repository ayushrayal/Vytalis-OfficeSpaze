require('dotenv').config();
const dns = require('dns');

if (process.env.USE_CUSTOM_DNS === 'true' || (process.env.NODE_ENV !== 'production' && process.env.USE_CUSTOM_DNS !== 'false')) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (e) {
    // Ignore DNS set errors if unsupported
  }
}
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
