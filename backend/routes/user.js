const express = require('express');
const router = express.Router();
const User = require('../models/User');      
const Profile = require('../models/Profile'); 
const auth = require('../middleware/auth');   

//profile route
router.get('/profile', auth, async(req, res) => {
  try { 
    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      const user = await User.findById(req.user.id).select('-password');
      
      if (!user) { 
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({   
        fullName: user.fullName, 
        email: user.email,
        phone: '', 
        isNewProfile: true 
      });
    }

    res.json(profile);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


//save or update the profile
router.post('/profile', auth, async (req, res) => {
  try {
    const profileFields = {
      user: req.user.id,
      ...req.body 
    };

    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },       
      { $set: profileFields },    
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    
    res.json(profile);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route    POST api/user/select-doctor
// @desc     Select a doctor
// @access   Private
router.post('/select-doctor', auth, async (req, res) => {
  try {
    const { doctor } = req.body; // Expects the full doctor object
    
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });

    // Save the doctor to the profile
    profile.selectedDoctor = doctor;
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/user/remove-doctor
// @desc     Remove current doctor with a reason
// @access   Private
router.post('/remove-doctor', auth, async (req, res) => {
  try {
    const { reason } = req.body;

    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });

    if (profile.selectedDoctor) {
      // Archive the removal reason
      profile.doctorHistory.unshift({
        doctorId: profile.selectedDoctor.id,
        doctorName: profile.selectedDoctor.name,
        reasonForRemoval: reason
      });

      // Clear the current doctor
      profile.selectedDoctor = undefined; // or set to null
    }

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;