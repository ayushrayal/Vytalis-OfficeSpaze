const mongoose = require('mongoose');

const WALKIN_FOLLOWUP_STATUSES = ['PENDING', 'COMPLETED', 'CANCELLED', 'MISSED'];

const walkInFollowUpSchema = new mongoose.Schema(
  {
    walkIn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WalkIn',
      required: [true, 'Walk-in reference is required']
    },
    status: {
      type: String,
      enum: {
        values: WALKIN_FOLLOWUP_STATUSES,
        message: 'Invalid follow-up status: {VALUE}'
      },
      default: 'PENDING'
    },
    dueAt: {
      type: Date,
      required: [true, 'Follow-up due date and time is required']
    },
    note: {
      type: String,
      default: '',
      trim: true,
      maxlength: [3000, 'Follow-up note cannot exceed 3000 characters']
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required']
    },
    completedAt: {
      type: Date,
      default: null
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    rescheduledAt: {
      type: Date,
      default: null
    },
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
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

// Performance indexes
walkInFollowUpSchema.index({ walkIn: 1, status: 1, dueAt: 1 });
walkInFollowUpSchema.index({ status: 1, dueAt: 1 });

// Database-level partial unique index: exactly one PENDING follow-up per walk-in
walkInFollowUpSchema.index(
  { walkIn: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'PENDING' }
  }
);

const WalkInFollowUp = mongoose.model('WalkInFollowUp', walkInFollowUpSchema);

module.exports = {
  WalkInFollowUp,
  WALKIN_FOLLOWUP_STATUSES
};
