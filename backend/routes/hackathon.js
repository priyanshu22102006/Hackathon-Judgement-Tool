const express = require("express");
const router = express.Router();
const Hackathon = require("../models/Hackathon");

// POST /api/hackathons – create a new hackathon
router.post("/", async (req, res) => {
  try {
    const hackathon = await Hackathon.create(req.body);
    res.status(201).json(hackathon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/hackathons – list all hackathons
router.get("/", async (_req, res) => {
  const list = await Hackathon.find().sort({ startTime: -1 });
  res.json(list);
});

// GET /api/hackathons/:id
router.get("/:id", async (req, res) => {
  const h = await Hackathon.findById(req.params.id);
  if (!h) return res.status(404).json({ error: "Not found" });
  res.json(h);
});

module.exports = router;
