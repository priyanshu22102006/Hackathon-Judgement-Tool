const express = require("express");
const router = express.Router();
const Team = require("../models/Team");
const { syncRepoCommits, syncAllTeams, deepSyncAllTeams } = require("../services/githubPoller");

/**
 * POST /api/sync/team/:teamId
 * Manually trigger a sync for a single team's repo.
 */
router.post("/team/:teamId", async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId).populate("hackathon");
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (!team.hackathon) return res.status(400).json({ error: "No hackathon linked" });

    const result = await syncRepoCommits(team, team.hackathon);
    res.json({ message: "Sync complete", repo: team.repoFullName, ...result });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/sync/hackathon/:hackathonId
 * Sync all teams for a hackathon.
 */
router.post("/hackathon/:hackathonId", async (req, res) => {
  try {
    const results = await syncAllTeams(req.params.hackathonId);
    res.json({ message: "Sync complete", results });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/sync/hackathon/:hackathonId/deep
 * Deep sync: fetch per-commit file details (filenames, additions, deletions)
 * for all teams. More expensive but needed for padding / dump analysis.
 */
router.post("/hackathon/:hackathonId/deep", async (req, res) => {
  try {
    const results = await deepSyncAllTeams(req.params.hackathonId);
    res.json({ message: "Deep sync complete", results });
  } catch (err) {
    console.error("Deep sync error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
