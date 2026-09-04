const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const walkInRoutes = require('./routes/walkin.routes');
const virtualOfficeRoutes = require('./routes/virtualOffice.routes');
const managedOfficeRoutes = require('./routes/managedOffice.routes');
const utilityBillRoutes = require('./routes/utilityBill.routes');
const salaryRoutes = require('./routes/salary.routes');
const operationBillRoutes = require('./routes/operationBill.routes');
const coworkSpaceRoutes = require('./routes/coworkSpace.routes');
const dedicatedSpaceRoutes = require('./routes/dedicatedSpace.routes');
const invoiceTemplateRoutes = require('./routes/invoiceTemplate.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// Core Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Vytalis Office Spaze Intelligence API is running'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/walkins', walkInRoutes);
app.use('/api/virtual-offices', virtualOfficeRoutes);
app.use('/api/managed-offices', managedOfficeRoutes);
app.use('/api/utility-bills', utilityBillRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/operation-bills', operationBillRoutes);
app.use('/api/cowork-spaces', coworkSpaceRoutes);
app.use('/api/dedicated-spaces', dedicatedSpaceRoutes);
app.use('/api/invoice-templates', invoiceTemplateRoutes);

// 404 Handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server`
  });
});

// Global Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
