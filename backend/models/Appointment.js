const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'doctor', // Refers to the Doctor Profile
    required: true
  },
  patientName: { type: String, required: true },
  patientPhone: { type: String, required: true },
  date: { type: String, required: true }, // Store as YYYY-MM-DD
  time: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending, Confirmed, Cancelled
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('appointment', AppointmentSchema);