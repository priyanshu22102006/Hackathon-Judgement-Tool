const express = require("express");
const router = express.Router();
const Hackathon = require("../models/Hackathon");
const Commit = require("../models/Commit");
const Team = require("../models/Team");
const { verifyLocation } = require("../services/commitVerifier");

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

/**
 * PUT /api/hackathons/:id/venue
 *
 * Update the venue (geo-fence) for a hackathon and re-verify all commits
 * against the new location.
 *
 * Body: { label?, latitude, longitude, radiusKm? }
 */
router.put("/:id/venue", async (req, res) => {
  try {
    const { label, latitude, longitude, radiusKm } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: "latitude and longitude are required" });
    }

    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ error: "Hackathon not found" });

    // Update venue fields
    hackathon.venue.latitude = latitude;
    hackathon.venue.longitude = longitude;
    if (label != null) hackathon.venue.label = label;
    if (radiusKm != null) hackathon.venue.radiusKm = radiusKm;
    await hackathon.save();

    // ── Re-verify ALL commits for this hackathon against the new venue ──
    const teams = await Team.find({ hackathon: hackathon._id });
    const teamIds = teams.map((t) => t._id);

    const commits = await Commit.find({ hackathon: hackathon._id, team: { $in: teamIds } });

    let onSite = 0;
    let outside = 0;
    let unknown = 0;

    for (const commit of commits) {
      const newStatus = verifyLocation(commit.location, hackathon.venue);
      if (newStatus !== commit.locationStatus) {
        commit.locationStatus = newStatus;
        await commit.save();
      }
      if (newStatus === "on-site") onSite++;
      else if (newStatus === "outside") outside++;
      else unknown++;
    }

    console.log(
      `[venue] Updated venue for "${hackathon.name}" → (${latitude}, ${longitude}), r=${hackathon.venue.radiusKm}km. Re-verified ${commits.length} commit(s): ${onSite} on-site, ${outside} outside, ${unknown} unknown`
    );

    res.json({
      venue: hackathon.venue,
      reverified: {
        total: commits.length,
        onSite,
        outside,
        unknown,
      },
    });
  } catch (err) {
    console.error("[venue] Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
