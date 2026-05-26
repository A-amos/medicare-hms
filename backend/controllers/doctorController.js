// backend/controllers/doctorController.js
const Doctor = require('../models/Doctor');

// ─────────────────────────────────────────
// GET /api/doctors
// ─────────────────────────────────────────
exports.getAllDoctors = async (req, res, next) => {
  try {
    const { search = '', availability = '', page = 1, limit = 50 } = req.query;

    let query = { isActive: true };

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { specialty: regex }, { phone: regex }];
    }

    if (availability) {
      query.availability = availability;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [doctors, total] = await Promise.all([
      Doctor.find(query).sort({ name: 1 }).skip(skip).limit(Number(limit)),
      Doctor.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// GET /api/doctors/:id
// ─────────────────────────────────────────
exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor || !doctor.isActive) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.status(200).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// POST /api/doctors
// ─────────────────────────────────────────
exports.createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully.',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// PUT /api/doctors/:id
// ─────────────────────────────────────────
exports.updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully.',
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// DELETE /api/doctors/:id  (soft delete)
// ─────────────────────────────────────────
exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
