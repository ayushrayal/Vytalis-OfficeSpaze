const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    fileId: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
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
      default: null,
      unique: true,
      sparse: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

const UtilityBill = mongoose.model('UtilityBill', utilityBillSchema);

module.exports = UtilityBill;
