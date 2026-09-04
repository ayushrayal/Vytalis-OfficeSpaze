const mongoose = require('mongoose');

const coworkSpaceSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true
    },
    businessType: {
      type: String,
      required: [true, 'Business type is required'],
      enum: {
        values: ['Registor', 'Non Registor'],
        message: 'Business type must be either "Registor" or "Non Registor"'
      }
    },
    addedDate: {
      type: Date,
      required: [true, 'Added date is required']
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'Total seats must be at least 1']
    },
    seatPerCost: {
      type: Number,
      required: [true, 'Seat per cost is required'],
      min: [0.01, 'Seat per cost must be greater than 0']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    agreement: {
      type: {
        url: { type: String, required: true },
        fileId: { type: String, required: true },
        fileName: { type: String, required: true }
      },
      default: null
    }
  },
  {
    timestamps: true
  }
);

const CoworkSpace = mongoose.model('CoworkSpace', coworkSpaceSchema);

module.exports = CoworkSpace;
