// backend/routes/patients.js
const express = require('express');
const router  = express.Router();
const {
  getAllPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientStats,
} = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/stats', getPatientStats);
router.route('/').get(getAllPatients).post(createPatient);
router.route('/:id').get(getPatient).put(updatePatient).delete(deletePatient);

module.exports = router;
