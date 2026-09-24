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

const utilityBillSchema = new mongoose.Schema(
  {
    billName: {
      type: String,
      required: [true, 'Bill name is required'],
      trim: true
    },
    receipt: {
      type: receiptSchema,
      default: null
    },
    billAmount: {
      type: Number,
      required: [true, 'Bill amount is required'],
      min: [0.01, 'Bill amount must be greater than 0']
    },
    uploadedBy: {
      type: String,
      required: [true, 'Uploaded by is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['Due', 'Paid'],
      default: 'Due'
    },
    isPaused: {
      type: Boolean,
      default: false
    },
    reminderDate: {
      type: Date,
      required: [true, 'Reminder date is required']
    },
    parentBillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UtilityBill',
      default: null
    },
    cycleKey: {
      type: String,
      unique: true,
      sparse: true
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

const UtilityBill = mongoose.model('UtilityBill', utilityBillSchema);

module.exports = UtilityBill;
