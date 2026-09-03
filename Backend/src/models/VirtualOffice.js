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

const virtualOfficeSchema = new mongoose.Schema(
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

const VirtualOffice = mongoose.model('VirtualOffice', virtualOfficeSchema);

module.exports = VirtualOffice;
