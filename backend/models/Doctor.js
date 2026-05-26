// backend/models/Doctor.js
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      trim: true,
      enum: [
        'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics',
        'Pediatrics', 'Dermatology', 'Gynecology', 'Urology',
        'Ophthalmology', 'ENT', 'Psychiatry', 'Oncology',
        'Radiology', 'Anesthesiology', 'Pathology', 'Surgery', 'Other'
      ],
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
    availability: {
      type: String,
      enum: ['Available', 'Unavailable', 'On Leave'],
      default: 'Available',
    },
    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      default: 0,
    },
    qualifications: {
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

// Text index for search
doctorSchema.index({ name: 'text', specialty: 'text' });
doctorSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Doctor', doctorSchema);
