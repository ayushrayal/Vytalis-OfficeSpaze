const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true
    },
    hsnSac: {
      type: String,
      trim: true,
      default: ''
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.0001, 'Quantity must be greater than 0']
    },
    rate: {
      type: Number,
      required: [true, 'Rate is required'],
      min: [0, 'Rate cannot be negative']
    },
    taxPercent: {
      type: Number,
      default: 0,
      min: [0, 'Tax percent cannot be negative']
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    },
    lineAmount: {
      type: Number,
      default: 0,
      min: [0, 'Line amount cannot be negative']
    }
  },
  { _id: false }
);

const paymentOptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: {
        values: ['Bank Transfer', 'UPI', 'Wallet', 'Other'],
        message: 'Payment option name must be one of "Bank Transfer", "UPI", "Wallet", or "Other"'
      }
    },
    enabled: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const bankDetailsSchema = new mongoose.Schema(
  {
    accountName: { type: String, trim: true, default: '' },
    accountType: { type: String, trim: true, default: '' },
    accountNumber: { type: String, trim: true, default: '' },
    ifscCode: { type: String, trim: true, default: '' },
    bankName: { type: String, trim: true, default: '' },
    branch: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const invoiceTemplateSchema = new mongoose.Schema(
  {
    // Company Details
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true
    },
    businessAddress: {
      type: String,
      required: [true, 'Business address is required'],
      trim: true
    },
    gstin: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true
    },
    website: {
      type: String,
      trim: true,
      default: ''
    },

    // Invoice Details
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      trim: true
    },
    invoiceDate: {
      type: Date,
      required: [true, 'Invoice date is required']
    },
    terms: {
      type: String,
      trim: true,
      default: ''
    },
    dueDate: {
      type: Date,
      default: null
    },
    placeOfSupply: {
      type: String,
      trim: true,
      default: ''
    },

    // Bill To / Client Details
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true
    },
    billingAddress: {
      type: String,
      required: [true, 'Billing address is required'],
      trim: true
    },
    clientGstin: {
      type: String,
      trim: true,
      default: ''
    },

    // Line Items
    items: {
      type: [lineItemSchema],
      required: [true, 'At least one line item is required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one line item is required'
      }
    },

    // Totals & Calculations
    subTotal: {
      type: Number,
      default: 0
    },
    taxTotal: {
      type: Number,
      default: 0
    },
    amountWithheld: {
      type: Number,
      default: 0,
      min: [0, 'Amount withheld cannot be negative']
    },
    total: {
      type: Number,
      default: 0
    },
    balanceDue: {
      type: Number,
      default: 0
    },
    totalInWords: {
      type: String,
      trim: true,
      default: ''
    },

    // Other Sections
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    paymentOptions: {
      type: [paymentOptionSchema],
      default: []
    },
    bankDetails: {
      type: bankDetailsSchema,
      default: () => ({})
    },
    footerMessage: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const InvoiceTemplate = mongoose.model('InvoiceTemplate', invoiceTemplateSchema);

module.exports = InvoiceTemplate;
