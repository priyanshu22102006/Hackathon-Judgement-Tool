const express = require("express");
const router = express.Router();

const verifyGithubSignature = require("../middleware/webhookAuth");
const Team = require("../models/Team");
const Hackathon = require("../models/Hackathon");
const Commit = require("../models/Commit");
const { verifyTime, verifyLocation } = require("../services/commitVerifier");
const { lookupIp } = require("../services/geoIpService");

/**
 * POST /api/webhook/github
 *
 * Receives push events from GitHub.
 * 1. Identifies the team by repo full name.
 * 2. Extracts every commit from the payload.
 * 3. Resolves pusher IP → location.
 * 4. Verifies time & location against hackathon rules.
 * 5. Stores the enriched commit in MongoDB.
 */
router.post("/github", verifyGithubSignature, async (req, res) => {
  try {
    const event = req.headers["x-github-event"];
    console.log(`[webhook] Received event: ${event}`);

    // Respond to GitHub's ping event (sent when webhook is created/tested)
    if (event === "ping") {
      console.log(`[webhook] ✅ Ping received — zen: "${req.body?.zen}"`);
      return res.status(200).json({ message: "pong", zen: req.body?.zen });
    }

    // We only care about push events
    if (event !== "push") {
      return res.status(200).json({ message: `Ignored event: ${event}` });
    }

    const payload = req.body;
    const repoFullName = payload.repository?.full_name;
    console.log(`[webhook] Repo: ${repoFullName}, Commits: ${payload.commits?.length || 0}`);

    if (!repoFullName) {
      return res.status(400).json({ error: "Missing repository info" });
    }

    // Find the team that owns this repo
    const team = await Team.findOne({ repoFullName }).populate("hackathon");
    if (!team) {
      console.log(`[webhook] ❌ No team found for repo: ${repoFullName}`);
      return res
        .status(404)
        .json({ error: `No team registered for repo ${repoFullName}` });
    }
    console.log(`[webhook] ✅ Matched team: ${team.name} (${team._id})`);

    const hackathon = team.hackathon;
    if (!hackathon) {
      return res.status(404).json({ error: "Hackathon not found for team" });
    }

    // ── Resolve IP ────────────────────────────────────────
    // GitHub sends the pusher's IP in x-forwarded-for or we fall back to
    // the connection remote address.
    const rawIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress;
    const geoData = lookupIp(rawIp);

    // ── Process each commit in the push ───────────────────
    const commits = payload.commits || [];
    const branch =
      payload.ref?.replace("refs/heads/", "") || "unknown";

    const savedCommits = [];

    for (const c of commits) {
      const commitTimestamp = new Date(c.timestamp);
      const timeValid = verifyTime(
        commitTimestamp,
        hackathon.startTime,
        hackathon.endTime
      );

      const locationStatus = verifyLocation(geoData, hackathon.venue);

      // Build file-change list
      const filesChanged = [
        ...(c.added || []).map((f) => ({ filename: f, status: "added" })),
        ...(c.modified || []).map((f) => ({ filename: f, status: "modified" })),
        ...(c.removed || []).map((f) => ({ filename: f, status: "removed" })),
      ];

      // Upsert to avoid duplicates on re-delivery
      const commit = await Commit.findOneAndUpdate(
        { team: team._id, commitHash: c.id },
        {
          team: team._id,
          hackathon: hackathon._id,
          commitHash: c.id,
          message: c.message,
          author: c.author?.username || c.author?.name || "unknown",
          authorEmail: c.author?.email || "",
          timestamp: commitTimestamp,
          url: c.url,
          branch,
          filesChanged,
          timeValid,
          ip: rawIp,
          location: geoData || {},
          locationStatus,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      savedCommits.push(commit);
    }

    return res.status(200).json({
      message: `Processed ${savedCommits.length} commit(s)`,
      commits: savedCommits,
    });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
