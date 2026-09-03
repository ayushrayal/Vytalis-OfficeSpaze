const mongoose = require('mongoose');

const agreementSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    fileId: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const managedOfficeSchema = new mongoose.Schema(
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
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    companyRegisteredAddress: {
      type: String,
      required: [true, 'Company registered address is required'],
      trim: true
    },
    allottedVirtualAddress: {
      type: String,
      required: [true, 'Allotted virtual address is required'],
      trim: true
    },
    allottedBy: {
      type: String,
      required: [true, 'Allotted by is required'],
      trim: true
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    agreedCommercials: {
      type: Number,
      required: [true, 'Agreed commercials is required'],
      min: [0.01, 'Agreed commercials must be greater than 0']
    },
    paymentMadeOn: {
      type: Date,
      required: [true, 'Payment made date is required']
    },
    officeNo: {
      type: String,
      required: [true, 'Office number is required'],
      trim: true
    },
    totalSeats: {
      type: Number,
      required: [true, 'Total seats is required'],
      min: [1, 'Total seats must be at least 1']
    },
    perSeatCost: {
      type: Number,
      required: [true, 'Per seat cost is required'],
      min: [0.01, 'Per seat cost must be greater than 0']
    },
    agreement: {
      type: agreementSchema,
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

const ManagedOffice = mongoose.model('ManagedOffice', managedOfficeSchema);

module.exports = ManagedOffice;
