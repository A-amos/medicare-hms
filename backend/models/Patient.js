// backend/models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [150, 'Age cannot exceed 150'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: 'Gender must be Male, Female, or Other',
      },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    address: {
      type: String,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', ''],
    },
    illness: {
      type: String,
      required: [true, 'Illness/diagnosis is required'],
      trim: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: populate appointments count
patientSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'patient',
  count: true,
});

// Index for search
patientSchema.index({ name: 'text', phone: 'text', illness: 'text' });
patientSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Patient', patientSchema);
