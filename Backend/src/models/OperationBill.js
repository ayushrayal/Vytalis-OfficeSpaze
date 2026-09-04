const mongoose = require('mongoose');

const operationBillSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    expenseType: {
      type: String,
      required: [true, 'Expense type is required'],
      trim: true
    },
    receipt: {
      type: {
        url: { type: String, required: true },
        fileId: { type: String, required: true },
        fileName: { type: String, required: true }
      },
      default: null
    },
    uploadedBy: {
      type: String,
      required: [true, 'Uploaded by is required'],
      trim: true
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Due', 'Paid'],
        message: 'Status must be either "Due" or "Paid"'
      }
    }
  },
  {
    timestamps: true
  }
);

const OperationBill = mongoose.model('OperationBill', operationBillSchema);

module.exports = OperationBill;
