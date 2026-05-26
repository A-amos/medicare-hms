// backend/models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor is required'],
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    appointmentTime: {
      type: String,
      required: [true, 'Appointment time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Completed', 'Cancelled'],
        message: 'Status must be Pending, Completed, or Cancelled',
      },
      default: 'Pending',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate patient and doctor on every find
appointmentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'patient',
    select: 'name phone gender bloodGroup',
  }).populate({
    path: 'doctor',
    select: 'name specialty phone availability',
  });
  next();
});

appointmentSchema.index({ appointmentDate: -1 });
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
