const mongoose = require('mongoose');

const FOLLOWUP_STATUSES = ['PENDING', 'COMPLETED', 'MISSED', 'CANCELLED'];

const leadFollowUpSchema = new mongoose.Schema(
  {
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      required: [true, 'Lead reference is required']
    },
    dueAt: {
      type: Date,
      required: [true, 'Follow-up due date and time is required']
    },
    status: {
      type: String,
      enum: {
        values: FOLLOWUP_STATUSES,
        message: 'Invalid follow-up status: {VALUE}'
      },
      default: 'PENDING'
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [3000, 'Follow-up notes cannot exceed 3000 characters']
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
    }
  },
  {
    timestamps: true
  }
);

// Indexes for query performance
leadFollowUpSchema.index({ lead: 1, status: 1, dueAt: 1 });
leadFollowUpSchema.index({ status: 1, dueAt: 1 });

// Database-level partial unique index: exactly one PENDING follow-up per lead
leadFollowUpSchema.index(
  { lead: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'PENDING' }
  }
);

const LeadFollowUp = mongoose.model('LeadFollowUp', leadFollowUpSchema);

module.exports = {
  LeadFollowUp,
  FOLLOWUP_STATUSES
};
