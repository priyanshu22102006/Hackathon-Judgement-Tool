const axios = require("axios");
const Team = require("../models/Team");
const Commit = require("../models/Commit");
const { verifyTime, verifyLocation } = require("./commitVerifier");

const GITHUB_API = "https://api.github.com";

// Cache repos that returned 404 so we don't spam the API
const _skippedRepos = new Set();

/**
 * Fetch commits from the GitHub API for a given team's repo
 * and store/update them in the database.
 *
 * This is the webhook-free alternative — works without ngrok.
 * Calls: GET /repos/{owner}/{repo}/commits
 */
async function syncRepoCommits(team, hackathon) {
  const repoFullName = team.repoFullName;

  // Skip repos that previously returned 404 (e.g. seed data)
  if (_skippedRepos.has(repoFullName)) return { total: 0, new: 0, updated: 0, skipped: true };

  console.log(`[poller] Syncing commits for ${repoFullName}…`);

  try {
    // Fetch recent commits from GitHub API (up to 100 per page)
    const headers = { Accept: "application/vnd.github+json" };
    // If a GitHub token is configured, use it to avoid rate limits
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const { data: ghCommits } = await axios.get(
      `${GITHUB_API}/repos/${repoFullName}/commits`,
      {
        headers,
        params: {
          per_page: 100,
          since: hackathon.startTime.toISOString(),
        },
      }
    );

    let newCount = 0;
    let updatedCount = 0;

    for (const gc of ghCommits) {
      const sha = gc.sha;
      const message = gc.commit?.message || "";
      const author =
        gc.author?.login || gc.commit?.author?.name || "unknown";
      const authorEmail = gc.commit?.author?.email || "";
      const timestamp = new Date(gc.commit?.author?.date || gc.commit?.committer?.date);
      const url = gc.html_url || "";

      // Skip individual commit detail fetches to conserve API rate limits.
      // File info will be empty for polled commits (webhook path fills this in).
      let filesChanged = [];

      // Time verification
      const timeValid = verifyTime(timestamp, hackathon.startTime, hackathon.endTime);

      // Location: from API polling we don't have IP, so mark unknown
      // (webhook path fills this in when available)
      const existing = await Commit.findOne({ team: team._id, commitHash: sha });

      const commitData = {
        team: team._id,
        hackathon: hackathon._id,
        commitHash: sha,
        message,
        author,
        authorEmail,
        timestamp,
        url,
        branch: "main", // API default branch
        filesChanged,
        timeValid,
      };

      // Only overwrite location fields if we don't already have them from webhook
      if (!existing) {
        commitData.locationStatus = "unknown";
        commitData.location = {};
        commitData.ip = null;
        newCount++;
      } else {
        updatedCount++;
      }

      await Commit.findOneAndUpdate(
        { team: team._id, commitHash: sha },
        { $set: commitData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log(
      `[poller] ${repoFullName}: ${ghCommits.length} fetched, ${newCount} new, ${updatedCount} updated`
    );

    return { total: ghCommits.length, new: newCount, updated: updatedCount };
  } catch (err) {
    if (err.response?.status === 403) {
      console.warn(`[poller] Rate limited for ${repoFullName}. Add GITHUB_TOKEN to .env`);
    } else if (err.response?.status === 404) {
      console.warn(`[poller] Repo not found: ${repoFullName} — skipping in future polls`);
      _skippedRepos.add(repoFullName);
    } else {
      console.error(`[poller] Error syncing ${repoFullName}:`, err.message);
    }
    return { total: 0, new: 0, updated: 0, error: err.message };
  }
}

/**
 * Sync all teams for a given hackathon.
 */
async function syncAllTeams(hackathonId) {
  const teams = await Team.find({ hackathon: hackathonId }).populate("hackathon");
  const results = {};

  for (const team of teams) {
    results[team.repoFullName] = await syncRepoCommits(team, team.hackathon);
  }

  return results;
}

/**
 * Start a background polling loop that syncs all active hackathons
 * every `intervalMs` milliseconds.
 */
function startPollingLoop(intervalMs = 30000) {
  const Hackathon = require("../models/Hackathon");

  console.log(`[poller] Background sync started (every ${intervalMs / 1000}s)`);

  const poll = async () => {
    try {
      const activeHackathons = await Hackathon.find({
        status: { $in: ["active", "upcoming"] },
      });

      for (const h of activeHackathons) {
        await syncAllTeams(h._id);
      }
    } catch (err) {
      console.error("[poller] Background sync error:", err.message);
    }
  };

  // Run immediately, then on interval
  poll();
  return setInterval(poll, intervalMs);
}

module.exports = { syncRepoCommits, syncAllTeams, startPollingLoop };
