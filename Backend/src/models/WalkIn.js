const mongoose = require('mongoose');

const WALKIN_STATUSES = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'QUALIFIED', 'CONVERTED', 'LOST'];

const walkInSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    date: {
      type: Date,
      required: [true, 'Walk-in date is required']
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: WALKIN_STATUSES,
        message: 'Invalid walk-in status: {VALUE}'
      },
      default: 'NEW',
      index: true
    },
    nextFollowUpAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        ret.status = ret.status || 'NEW';
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

const WalkIn = mongoose.model('WalkIn', walkInSchema);

module.exports = WalkIn;
module.exports.WALKIN_STATUSES = WALKIN_STATUSES;

