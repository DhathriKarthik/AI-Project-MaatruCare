const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true 
  },

  fullName: { type: String, required: true }, 
  dateOfBirth: Date,
  bloodGroup: String,
  phone: String,
  
  dueDate: Date,
  medicalHistory: String,
  allergies: String,

  husbandName: String,
  husbandPhone: String,
  husbandEmail: String,
  husbandOccupation: String,

  guardianName: String,
  guardianPhone: String,
  guardianRelation: String,

  selectedDoctor: {
    id: { type: String }, // ID from the external API (or your system)
    name: { type: String },
    specialty: { type: String },
    phone: { type: String },
    email: { type: String },
    image: { type: String },
    location: { type: String }
  },
  doctorHistory: [
    {
      doctorId: String,
      doctorName: String,
      reasonForRemoval: String,
      removedAt: { type: Date, default: Date.now }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);