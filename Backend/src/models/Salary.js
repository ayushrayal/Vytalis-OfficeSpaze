const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true
    },
    employeeSalary: {
      type: Number,
      required: [true, 'Employee salary is required'],
      min: [0.01, 'Employee salary must be greater than 0']
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Due', 'Paid'],
        message: 'Status must be either "Due" or "Paid"'
      }
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
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

const Salary = mongoose.model('Salary', salarySchema);

module.exports = Salary;
