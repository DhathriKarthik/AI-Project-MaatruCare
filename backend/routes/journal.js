const express = require("express");
const Journal = require("../models/Journal");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const MOOD_API_URL = "http://127.0.0.1:8002/analyze-mood";

// Native fetch is available in Node.js 18+

// Get all journals for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("GET /journals for:", {
      userId: req.userId,
      email: req.user?.email,
    });

    const journals = await Journal.find({ userId: req.userId }).sort({
      entryDateTime: -1,
    });

    console.log("GET /journals -> count:", journals.length);
    res.json(journals);
  } catch (err) {
    console.error("GET /journals error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add journal
router.post("/", authMiddleware, async (req, res) => {
  try {
    console.log("POST /journals body:", req.body);
    console.log("POST /journals userId:", req.userId);

    const journal = await Journal.create({
      userId: req.userId,
      entryDateTime: new Date(),
      content: req.body.content,
    });

    console.log("Journal created:", {
      journalId: journal._id,
      userId: journal.userId,
      content: journal.content,
    });

    // Fire mood API (non-blocking)
    fetch(MOOD_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: req.body.content,
        userId: req.userId,
        journalId: journal._id,
      }),
    })
      .then(async (r) => {
        const bodyText = await r.text();
        console.log("Mood API status:", r.status);
        
        let data;
        try {
          data = JSON.parse(bodyText);
        } catch {
          data = bodyText;
        }
        console.log("Mood stored:", data);

        // 🚨 HIGH RISK → DOCTOR WHATSAPP
        if (data.risk_level === 'High Risk') {
          console.log('🚨 HIGH RISK DETECTED - checking profile...');
          
          const Profile = require('../models/Profile');
          const profile = await Profile.findOne({ user: req.userId }).select('fullName selectedDoctor');
          
          console.log('Profile found:', !!profile, 'Doctor:', profile?.selectedDoctor);
          
          if (profile?.selectedDoctor?.phone) {
            console.log('✅ Sending to:', profile.selectedDoctor.phone);
            const { sendDoctorAlert } = require('../services/whatsapp');
            await sendDoctorAlert(profile.selectedDoctor.phone, profile.fullName, data.risk_level);
            console.log(`🚨 DOCTOR ALERT SENT → ${profile.selectedDoctor.phone}`);
          } else {
            console.log('❌ No doctor phone in profile');
          }
        }
      })
      .catch((err) => {
        console.error("Mood API error (network):", err);
      });

    // Respond immediately
    res.status(201).json(journal);
  } catch (err) {
    console.error("POST /journals error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
