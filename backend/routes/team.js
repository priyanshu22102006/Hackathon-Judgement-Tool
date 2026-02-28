const express = require("express");
const router = express.Router();
const Team = require("../models/Team");

// POST /api/teams – register a team (links repo to hackathon)
router.post("/", async (req, res) => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/teams?hackathon=<id>
router.get("/", async (req, res) => {
  const filter = {};
  if (req.query.hackathon) filter.hackathon = req.query.hackathon;
  const teams = await Team.find(filter).populate("hackathon");
  res.json(teams);
});

// GET /api/teams/:id
router.get("/:id", async (req, res) => {
  const t = await Team.findById(req.params.id).populate("hackathon");
  if (!t) return res.status(404).json({ error: "Not found" });
  res.json(t);
});

module.exports = router;
