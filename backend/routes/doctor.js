const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const Doctor = require('../models/DoctorProfile'); 
const User = require('../models/User');

// @route   GET api/doctor/me
// @desc    Get current doctor's profile
// @access  Private (Health Professionals Only)
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Doctor.findOne({ user: req.user.id }).populate('user', ['name', 'email']);
    
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this doctor' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/doctor
// @desc    Create or update doctor profile
// @access  Private
router.post('/', auth, async (req, res) => {
  const {
    name, specialty, image, about, experience, languages, education,
    clinicName, clinicAddress, clinicTimings, fee,
    phone, regNumber 
  } = req.body;

  // Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  profileFields.personalInfo = {};
  profileFields.clinicInfo = {};

  // Map frontend fields to DB structure
  if (name) profileFields.personalInfo.name = name;
  if (specialty) profileFields.personalInfo.specialty = specialty;
  if (image) profileFields.personalInfo.image = image;
  if (about) profileFields.personalInfo.about = about;
  if (experience) profileFields.personalInfo.experience = experience;
  if (education) profileFields.personalInfo.education = education;
  if (phone) profileFields.personalInfo.phone = phone;       
  if (regNumber) profileFields.personalInfo.regNumber = regNumber; 

  // Handle languages
  if (languages) {
    profileFields.personalInfo.languages = Array.isArray(languages) 
      ? languages 
      : languages.split(',').map(lang => lang.trim());
  }

  if (clinicName) profileFields.clinicInfo.name = clinicName;
  if (clinicAddress) profileFields.clinicInfo.address = clinicAddress;
  if (clinicTimings) profileFields.clinicInfo.timings = clinicTimings;
  if (fee) profileFields.clinicInfo.fee = fee;

  try {
    let profile = await Doctor.findOne({ user: req.user.id });

    if (profile) {
      profile = await Doctor.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // Create new profile
    profile = new Doctor(profileFields);
    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;