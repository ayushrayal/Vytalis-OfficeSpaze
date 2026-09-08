const mongoose = require('mongoose');

const aggregatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Aggregator name is required'],
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
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
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

const Aggregator = mongoose.model('Aggregator', aggregatorSchema);

module.exports = Aggregator;
