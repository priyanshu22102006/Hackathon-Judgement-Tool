const express = require("express");
const router = express.Router();
const Commit = require("../models/Commit");
const Team = require("../models/Team");
const { computeIntegrity } = require("../services/integrityScorer");

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
