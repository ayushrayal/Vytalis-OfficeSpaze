const mongoose = require('mongoose');

const escalationSchema = new mongoose.Schema(
  {
    escalationType: {
      type: String,
      required: [true, 'Escalation type is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    escalatedBy: {
      type: String,
      required: [true, 'Escalated by is required'],
      trim: true
    },
    priority: {
      type: String,
      enum: {
        values: ['High', 'Medium', 'Low'],
        message: 'Priority must be High, Medium, or Low'
      },
      required: [true, 'Priority is required'],
      default: 'Medium'
    },
    resolveTime: {
      type: Number,
      required: [true, 'Resolve time in hours is required'],
      min: [0.01, 'Resolve time must be greater than 0']
    },
    resolveDueAt: {
      type: Date,
      required: [true, 'Resolution due timestamp is required']
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['OPEN', 'RESOLVED'],
      default: 'OPEN'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id ? ret._id.toString() : ret._id;
        delete ret._id;
        delete ret.__v;

        // Authoritative dynamic calculation of status
        if (ret.resolvedAt) {
          ret.status = 'RESOLVED';
        } else if (new Date() >= new Date(ret.resolveDueAt)) {
          ret.status = 'OVERDUE';
        } else {
          ret.status = 'OPEN';
        }

        return ret;
      }
    }
  }
);

// Index for fast query execution
escalationSchema.index({ resolvedAt: 1, resolveDueAt: 1 });
escalationSchema.index({ priority: 1 });
escalationSchema.index({ createdAt: -1 });

const Escalation = mongoose.model('Escalation', escalationSchema);

module.exports = Escalation;
