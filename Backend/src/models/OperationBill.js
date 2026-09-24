const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: null
    },
    fileId: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      default: null
    },
    mimeType: {
      type: String,
      default: null
    },
    size: {
      type: Number,
      default: null
    }
  },
  { _id: false }
);

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
      type: receiptSchema,
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
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;

        // Response sanitization: never expose permanent document URLs or storage paths
        if (ret.receipt) {
          ret.receipt = {
            fileName: ret.receipt.fileName,
            available: true
          };
        } else {
          ret.receipt = null;
        }

        return ret;
      }
    }
  }
);

const OperationBill = mongoose.model('OperationBill', operationBillSchema);

module.exports = OperationBill;
