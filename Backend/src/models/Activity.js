const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: ['created', 'updated', 'deleted']
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      enum: ['virtual_office'] // Extensible to 'walkin', 'managed_office', etc.
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Entity ID is required']
    },
    entityName: {
      type: String,
      required: [true, 'Entity name is required'],
      trim: true
    },
    actor: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      name: {
        type: String,
        required: [true, 'Actor name is required'],
        trim: true,
        default: 'System'
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
      }
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

// Performance indexes for chronologically ordered timeline queries
activitySchema.index({ createdAt: -1 });
activitySchema.index({ entityType: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
