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

}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);