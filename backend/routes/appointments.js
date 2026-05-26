// backend/routes/appointments.js
const express = require('express');
const router  = express.Router();
const {
  getAllAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getStats,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getStats);
router.route('/').get(getAllAppointments).post(createAppointment);
router.route('/:id').get(getAppointment).put(updateAppointment).delete(deleteAppointment);

module.exports = router;
