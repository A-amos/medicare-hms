// backend/routes/doctors.js
const express = require('express');
const router  = express.Router();
const {
  getAllDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getAllDoctors).post(createDoctor);
router.route('/:id').get(getDoctor).put(updateDoctor).delete(deleteDoctor);

module.exports = router;
