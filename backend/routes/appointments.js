const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Assuming you have auth middleware
const Appointment = require('../models/Appointment');
const Doctor = require('../models/DoctorProfile');
const User = require('../models/User');

// @route   POST api/appointments/book
// @desc    Book an appointment
router.post('/book', auth, async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    // 1. Get Patient Details (from logged in user)
    const user = await User.findById(req.user.id).select('-password');
    
    // 2. Create New Appointment
    const newAppointment = new Appointment({
      doctor: doctorId,
      patientName: user.name,
      patientPhone: user.phone || 'Not Provided',
      date,
      time
    });

    const appointment = await newAppointment.save();
    res.json(appointment);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/appointments/doctor
// @desc    Get all appointments for the logged-in doctor
router.get('/doctor', auth, async (req, res) => {
  try {
    // Find the doctor profile associated with this user
    const doctorProfile = await Doctor.findOne({ user: req.user.id });
    if (!doctorProfile) return res.status(404).json({ msg: 'Doctor profile not found' });

    // Find appointments for this doctor
    const appointments = await Appointment.find({ doctor: doctorProfile._id }).sort({ date: 1 });
    res.json(appointments);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;