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

module.exports = router;