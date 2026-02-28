const express = require("express");
const router = express.Router();
const Commit = require("../models/Commit");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");
const { computeIntegrity } = require("../services/integrityScorer");

/**
 * GET /api/judge/hackathon/:hackathonId/overview
 *
 * Aggregated overview for a given hackathon – used by the Judge Dashboard.
 * Returns per-team stats and all commits.
 */
router.get("/hackathon/:hackathonId/overview", async (req, res) => {
  try {
    const { hackathonId } = req.params;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) return res.status(404).json({ error: "Hackathon not found" });

    const teams = await Team.find({ hackathon: hackathonId });

    const teamSummaries = await Promise.all(
      teams.map(async (team) => {
        const commits = await Commit.find({ team: team._id }).sort({
          timestamp: -1,
        });

        const totalCommits = commits.length;
        const validTime = commits.filter((c) => c.timeValid === true).length;
        const invalidTime = commits.filter((c) => c.timeValid === false).length;
        const onSite = commits.filter(
          (c) => c.locationStatus === "on-site"
        ).length;
        const outside = commits.filter(
          (c) => c.locationStatus === "outside"
        ).length;

        // Compute integrity report
        const integrity = computeIntegrity(commits, hackathon);

        // Flag: any suspicious activity?
        const flagged = integrity.verdict !== "PURE";

        return {
          teamId: team._id,
          teamName: team.name,
          repo: team.repoFullName,
          members: team.members,
          totalCommits,
          validTime,
          invalidTime,
          onSite,
          outside,
          flagged,
          integrity,
          commits,
        };
      })
    );

    res.json({
      hackathon: {
        id: hackathon._id,
        name: hackathon.name,
        startTime: hackathon.startTime,
        endTime: hackathon.endTime,
        venue: hackathon.venue,
      },
      teams: teamSummaries,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/judge/team/:teamId/commits
 *
 * All commits for a specific team – judge drill-down.
 */
router.get("/team/:teamId/commits", async (req, res) => {
  const commits = await Commit.find({ team: req.params.teamId })
    .sort({ timestamp: -1 })
    .populate("hackathon", "name startTime endTime venue");

  res.json(commits);
});

module.exports = router;
