const mongoose = require('mongoose');

const LEAD_STATUS = ['NEW', 'CONTACTED', 'FOLLOW_UP', 'QUALIFIED', 'CONVERTED', 'LOST'];

const formResponseSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    metaLeadId: {
      type: String,
      required: [true, 'Meta Lead ID is required'],
      unique: true,
      index: true,
      trim: true
    },
    fullName: {
      type: String,
      trim: true,
      default: null
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: null
    },
    createdTime: {
      type: Date,
      default: null
    },

    // Meta Source Information
    source: {
      type: String,
      default: 'facebook_leads',
      trim: true
    },
    accountId: {
      type: String,
      trim: true,
      default: null
    },
    accountName: {
      type: String,
      trim: true,
      default: null
    },

    // Form Details & Custom Answers
    formId: {
      type: String,
      trim: true,
      default: null
    },
    formName: {
      type: String,
      trim: true,
      default: null
    },
    formResponses: {
      type: [formResponseSchema],
      default: []
    },

    // Campaign Details
    campaignId: {
      type: String,
      trim: true,
      default: null
    },
    campaignName: {
      type: String,
      trim: true,
      default: null
    },

    // Ad Set Details
    adSetId: {
      type: String,
      trim: true,
      default: null
    },
    adSetName: {
      type: String,
      trim: true,
      default: null
    },

    // Ad Details
    adId: {
      type: String,
      trim: true,
      default: null
    },
    adName: {
      type: String,
      trim: true,
      default: null
    },

    // Ingestion Tracking
    dataFetchedAt: {
      type: Date,
      default: null
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now
    },

    // CRM Foundation
    status: {
      type: String,
      enum: {
        values: LEAD_STATUS,
        message: 'Status must be one of: ' + LEAD_STATUS.join(', ')
      },
      default: 'NEW',
      index: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    assignedAt: {
      type: Date,
      default: null
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    nextFollowUpAt: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Compound indexes for fast CRM searches & filtering
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ fullName: 'text', email: 'text', phoneNumber: 'text' });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = {
  Lead,
  LEAD_STATUS
};
