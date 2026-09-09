const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, 'Setting key is required'],
      unique: true,
      trim: true
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Setting value is required']
    },
    description: {
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

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
