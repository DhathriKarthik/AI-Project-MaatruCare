const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true 
  },
  personalInfo: {
    name: { type: String, required: true },
    specialty: { type: String, required: true }, 
    image: { type: String }, 
    about: { type: String }, 
    experience: { type: String }, 
    languages: { type: [String] }, 
    education: { type: String },
    phone: { type: String },
    regno : { type: Number,default: 0}
  },
  clinicInfo: {
    name: { type: String }, 
    address: { type: String },
    timings: { type: String }, 
    fee: { type: Number } 
  },
  stats: {
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    patientsServed: { type: Number, default: 0 }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  availability: [
    {
      day: { type: String },
      active: { type: Boolean, default: true },
      start: { type: String },
      end: { type: String }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('doctor', DoctorSchema);