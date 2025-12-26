const express = require("express");
const Journal = require("../models/Journal");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const MOOD_API_URL = "http://127.0.0.1:8000/analyze-mood";

// Get all journals for logged-in user
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log("GET /journals for:", req.userId, req.user);
    const journals = await Journal.find({ userId: req.userId })
      .sort({ entryDateTime: -1 });
    res.json(journals);
  } catch (err) {
    console.error("GET /journals error:", err); 
    res.status(500).json({ message: "Server error" });
  }
});

// Add journal
router.post("/", authMiddleware, async (req, res) => {
  try {
    const journal = await Journal.create({
      userId: req.userId,
      entryDateTime: new Date(),
      content: req.body.content
    });
    fetch(MOOD_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: req.body.content,
        userId: req.userId,       // email for mood DB
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        console.log("Mood stored for journal:", data);
      })
      .catch((err) => {
        console.error("Mood API error:", err);
      });

    res.status(201).json(journal);
  } catch (err) {
    console.error("POST /journals error:", err); 
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
