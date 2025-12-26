const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const axios = require('axios');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// REGISTER ROUTE
// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ message: "User already exists. Please login." });
      }
      
      console.log("User exists but not verified. Resending OTP...");
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000;
      
      user.otp = otp;
      user.otpExpires = otpExpires;
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt); 
      user.fullName = fullName;
      user.role = role;
      
      await user.save();
      
      await sendEmail(email, otp); 
      return res.status(200).json({ message: "OTP sent again to existing email." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      otp,
      otpExpires,
      isVerified: false 
    });

    await user.save();
    await sendEmail(email, otp);

    res.status(201).json({ message: "OTP sent to email" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

async function sendEmail(email, otp) {
  const msg = {
    to: email,
    from: 'muskan123sameena@gmail.com', 
    subject: 'Verification Code',
    text: `Your code is ${otp}`,
    html: `<strong>${otp}</strong>`,
  };
 
  try {
    await sgMail.send(msg);
    console.log(" Email sent");
  } catch(err) {
    console.error("Email failed:", err);
  }
}

//VERIFY OTP 
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified. Please login." });
    }

    // Generate NEW OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send Email 
    const msg = {
      to: email,
      from: 'muskan123sameena@gmail.com', 
      subject: 'New Verification Code',
      text: `Your new code is: ${otp}`,
      html: `<h3>New Request</h3><p>Your verification code is: <strong>${otp}</strong></p>`,
    };
    
    await sgMail.send(msg);

    res.json({ message: "New OTP sent successfully" });
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role 
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// LOGIN ROUTE
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    if (user.role !== role) {
      return res.status(400).json({ 
        message: `Please log in as a ${user.role}. Account not found for ${role}.` 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET,           
      { expiresIn: '1d' }               
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//  FORGOT PASSWORD (Generates OTP)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const msg = {
      to: email,
      from: 'muskan123sameena@gmail.com', 
      subject: 'Reset Password OTP',
      text: `Your password reset code is: ${otp}`,
      html: `<h3>Password Reset</h3><p>Your code is: <strong>${otp}</strong></p>`,
    };

    await sgMail.send(msg);

    res.json({ message: "OTP sent to your email" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//  RESET PASSWORD (Verifies OTP & Updates Password)
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify OTP
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash New Password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { token, role } = req.body;

    //Verify token with Google
    const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { email, name, sub } = googleRes.data;
    let user = await User.findOne({ email });

    if (user) {
      const jwtToken = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );
      
      return res.json({
        token: jwtToken,
        user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
      });
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    user = new User({
      fullName: name,
      email: email,
      password: hashedPassword,
      role: role || 'mother', 
      isVerified: true,      
      authProvider: 'google'
    });

    await user.save();

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({
        token: jwtToken,
        user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error("Google Auth Backend Error:", error);
    res.status(400).json({ message: "Google Login Failed" });
  }
});

// POST /api/auth/facebook
router.post('/facebook', async (req, res) => {
  try {
    const { accessToken, userID, role } = req.body;

    console.log("1. Received FB Data:", { userID, role }); // Debug Log

    const url = `https://graph.facebook.com/v15.0/${userID}?fields=id,name,email,picture&access_token=${accessToken}`;
    
    const fbRes = await axios.get(url);
    console.log("2. Facebook Graph Response:", fbRes.data); // <--- CRITICAL LOG

    const { email, name, id } = fbRes.data;

    const userEmail = email || `${id}@facebook.com`;

    let user = await User.findOne({ email: userEmail });

    if (user) {
      console.log("3. User found. Logging in.");
      const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );
      return res.json({
        token,
        user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
      });
    }

    console.log("3. User not found. Creating new account.");
    
    const randomPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    user = new User({
      fullName: name,
      email: userEmail, 
      password: hashedPassword,
      role: role || 'mother',
      isVerified: true,
      authProvider: 'facebook'
    });

    await user.save();
    console.log("4. User Saved!");

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({
        token,
        user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error("❌ Facebook Backend Error:", error.response ? error.response.data : error.message);
    res.status(400).json({ message: "Facebook Login Failed" });
  }
});


module.exports = router;