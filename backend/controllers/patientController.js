// backend/controllers/patientController.js
const Patient = require('../models/Patient');

// ─────────────────────────────────────────
// GET /api/patients
// Query params: search, page, limit
// ─────────────────────────────────────────
exports.getAllPatients = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 50 } = req.query;

    let query = { isActive: true };

    // Search by name, phone, or illness
    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { phone: regex },
        { illness: regex },
        { email: regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [patients, total] = await Promise.all([
      Patient.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Patient.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: patients.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// GET /api/patients/:id
// ─────────────────────────────────────────
exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient || !patient.isActive) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// POST /api/patients
// ─────────────────────────────────────────
exports.createPatient = async (req, res, next) => {
  try {
    const patient = await Patient.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// PUT /api/patients/:id
// ─────────────────────────────────────────
exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully.',
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// DELETE /api/patients/:id  (soft delete)
// ─────────────────────────────────────────
exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// GET /api/patients/stats
// ─────────────────────────────────────────
exports.getPatientStats = async (req, res, next) => {
  try {
    const [total, byGender] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Patient.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({ success: true, data: { total, byGender } });
  } catch (error) {
    next(error);
  }
};
