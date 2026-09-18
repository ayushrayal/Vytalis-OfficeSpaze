const mongoose = require('mongoose');
const { ROLES, MODULES, ACTIONS, USER_STATUS } = require('../constants/permissions.constant');

// Per-module permission sub-document
const permissionSchema = new mongoose.Schema(
  {
    module: { type: String, required: true, enum: MODULES },
    actions: [{ type: String, enum: ACTIONS }]
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },
    phone: { type: String, trim: true, default: '' },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    role: {
      type: String,
      enum: ROLES,
      required: [true, 'Role is required']
    },
    status: {
      type: String,
      enum: USER_STATUS,
      default: 'ACTIVE',
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    permissions: {
      type: [permissionSchema],
      default: []
    },
    refreshTokenHash: {
      type: String,
      default: null,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.refreshTokenHash;
        delete ret.__v;
        // Derive firstName / lastName from name for legacy records that lack them
        if (!ret.firstName && ret.name) {
          const parts = ret.name.trim().split(' ');
          ret.firstName = parts[0] || '';
          ret.lastName = parts.slice(1).join(' ') || '';
        }
        if (!ret.lastName && ret.name && ret.firstName) {
          const parts = ret.name.trim().split(' ');
          ret.lastName = parts.slice(1).join(' ') || '';
        }
        return ret;
      }
    }
  }
);

// Pre-save: keep isActive in sync with status
userSchema.pre('save', function () {
  this.isActive = this.status === 'ACTIVE';
});

// Pre-update hooks for findOneAndUpdate / updateOne / updateMany
function syncIsActiveOnUpdate() {
  const update = this.getUpdate ? this.getUpdate() : null;
  if (update) {
    if (update.status !== undefined) {
      update.isActive = update.status === 'ACTIVE';
    } else if (update.$set && update.$set.status !== undefined) {
      update.$set.isActive = update.$set.status === 'ACTIVE';
    }
  }
}

userSchema.pre('findOneAndUpdate', syncIsActiveOnUpdate);
userSchema.pre('updateOne', syncIsActiveOnUpdate);
userSchema.pre('updateMany', syncIsActiveOnUpdate);

const User = mongoose.model('User', userSchema);

module.exports = User;
