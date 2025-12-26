const express = require("express");
const router = express.Router();
const HappyMoment = require("../models/HappyMoment");
const authMiddleware = require("../middleware/auth");

// GET all happy moments for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const moments = await HappyMoment.find({ userId: req.userId })
      .sort({ datetime: -1 });
    res.json(moments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ADD a happy moment
router.post("/", authMiddleware, async (req, res) => {
  try {
    const moment = await HappyMoment.create({
      userId: req.userId,
      datetime: new Date(),
      text: req.body.text,
    });
    res.status(201).json(moment);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
