const express = require("express");
const router = express.Router();
const Commit = require("../models/Commit");
const Team = require("../models/Team");
const { computeIntegrity } = require("../services/integrityScorer");
const { verifyLocation } = require("../services/commitVerifier");

/**
 * POST /api/participant/location
 *
 * Participants call this periodically from their browser to report
 * their current GPS position. The location is stored on the Team document
 * and used to verify commits that arrive via the GitHub API poller
 * (which doesn't carry an IP address).
 *
 * Body: { team, latitude, longitude, accuracy? }
 */
router.post("/location", async (req, res) => {
  const { team: teamId, latitude, longitude, accuracy } = req.body;

  if (!teamId) return res.status(400).json({ error: "team is required" });
  if (latitude == null || longitude == null)
    return res.status(400).json({ error: "latitude and longitude are required" });

  const team = await Team.findById(teamId).populate("hackathon");
  if (!team) return res.status(404).json({ error: "Team not found" });

  // Update the team's last known location
  team.lastKnownLocation = {
    latitude,
    longitude,
    accuracy: accuracy || null,
    reportedAt: new Date(),
  };
  await team.save();

  // Determine location status relative to the venue
  let locationStatus = "unknown";
  if (team.hackathon?.venue) {
    locationStatus = verifyLocation(
      { latitude, longitude },
      team.hackathon.venue
    );
  }

  // Retroactively update any commits for this team that still have
  // locationStatus "unknown" (e.g. from the poller which had no IP).
  const result = await Commit.updateMany(
    { team: team._id, locationStatus: "unknown" },
    {
      $set: {
        location: { latitude, longitude, city: null, region: null, country: null },
        locationStatus,
      },
    }
  );

  console.log(
    `[location] Team ${team.name}: reported (${latitude}, ${longitude}) → ${locationStatus}. Updated ${result.modifiedCount} commit(s).`
  );

  res.json({ locationStatus, updatedCommits: result.modifiedCount });
});

/**
 * GET /api/participant/commits?team=<teamId>
 *
 * Returns all commits for the participant's team,
 * sorted newest-first.  This powers the Participant Dashboard.
 */
router.get("/commits", async (req, res) => {
  const { team } = req.query;
  if (!team) return res.status(400).json({ error: "team query param required" });

  const commits = await Commit.find({ team })
    .sort({ timestamp: -1 })
    .populate("hackathon", "name startTime endTime venue");

  res.json(commits);
});

/**
 * GET /api/participant/summary?team=<teamId>
 *
 * Quick stats + integrity report for the participant dashboard.
 */
router.get("/summary", async (req, res) => {
  const { team: teamId } = req.query;
  if (!teamId)
    return res.status(400).json({ error: "team query param required" });

  const team = await Team.findById(teamId).populate("hackathon");
  if (!team) return res.status(404).json({ error: "Team not found" });

  const commits = await Commit.find({ team: teamId });

  const totalCommits = commits.length;
  const validTime = commits.filter((c) => c.timeValid === true).length;
  const invalidTime = commits.filter((c) => c.timeValid === false).length;
  const onSite = commits.filter((c) => c.locationStatus === "on-site").length;
  const outside = commits.filter((c) => c.locationStatus === "outside").length;
  const unknown = commits.filter((c) => c.locationStatus === "unknown").length;

  // Compute integrity score
  const integrity = team.hackathon
    ? computeIntegrity(commits, team.hackathon)
    : null;

  res.json({
    team: team.name,
    repo: team.repoFullName,
    hackathon: team.hackathon?.name,
    hackathonWindow: team.hackathon
      ? { start: team.hackathon.startTime, end: team.hackathon.endTime }
      : null,
    totalCommits,
    timeBreakdown: { valid: validTime, invalid: invalidTime },
    locationBreakdown: { onSite, outside, unknown },
    integrity,
  });
});

module.exports = router;
