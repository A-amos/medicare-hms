// backend/controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor  = require('../models/Doctor');

// ─────────────────────────────────────────
// GET /api/appointments
// ─────────────────────────────────────────
exports.getAllAppointments = async (req, res, next) => {
  try {
    const { status = '', search = '', page = 1, limit = 50 } = req.query;

    let query = {};
    if (status) query.status = status;

    let appointments = await Appointment.find(query)
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(Number(limit));

    // Client-side search on populated fields (name)
    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      appointments = appointments.filter(
        (a) =>
          (a.patient && regex.test(a.patient.name)) ||
          (a.doctor  && regex.test(a.doctor.name))
      );
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// GET /api/appointments/:id
// ─────────────────────────────────────────
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// POST /api/appointments
// ─────────────────────────────────────────
exports.createAppointment = async (req, res, next) => {
  try {
    const { patient, doctor, appointmentDate, appointmentTime, status, notes } = req.body;

    // Validate patient and doctor exist
    const [patientDoc, doctorDoc] = await Promise.all([
      Patient.findById(patient),
      Doctor.findById(doctor),
    ]);

    if (!patientDoc || !patientDoc.isActive) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }
    if (!doctorDoc || !doctorDoc.isActive) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    const appointment = await Appointment.create({
      patient,
      doctor,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: status || 'Pending',
      notes,
    });

    // Re-fetch to populate
    const populated = await Appointment.findById(appointment._id);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// PUT /api/appointments/:id
// ─────────────────────────────────────────
exports.updateAppointment = async (req, res, next) => {
  try {
    if (req.body.appointmentDate) {
      req.body.appointmentDate = new Date(req.body.appointmentDate);
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// DELETE /api/appointments/:id
// ─────────────────────────────────────────
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// GET /api/appointments/stats
// Dashboard summary data
// ─────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const Patient = require('../models/Patient');
    const Doctor  = require('../models/Doctor');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingCount,
      completedCount,
      cancelledCount,
      todayCount,
      availableDoctors,
      recent,
    ] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isActive: true }),
      Appointment.countDocuments({}),
      Appointment.countDocuments({ status: 'Pending' }),
      Appointment.countDocuments({ status: 'Completed' }),
      Appointment.countDocuments({ status: 'Cancelled' }),
      Appointment.countDocuments({ appointmentDate: { $gte: today, $lt: tomorrow } }),
      Doctor.countDocuments({ isActive: true, availability: 'Available' }),
      Appointment.find({}).sort({ createdAt: -1 }).limit(7),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        pendingCount,
        completedCount,
        cancelledCount,
        todayCount,
        availableDoctors,
        recentAppointments: recent,
      },
    });
  } catch (error) {
    next(error);
  }
};
