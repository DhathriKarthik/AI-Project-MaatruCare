const express = require("express");
const Journal = require("../models/Journal");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const MOOD_API_URL = "http://127.0.0.1:8001/analyze-mood";

// node-fetch dynamic import
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

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
        console.log("Mood API raw body:", bodyText);

        let data;
        try {
          data = JSON.parse(bodyText);
        } catch {
          data = bodyText;
        }
        console.log("Mood stored for journal (parsed):", data);
      })
      .catch((err) => {
        console.error("Mood API error (network):", err);
      });

    res.status(201).json(journal);
  } catch (err) {
    console.error("POST /journals error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
