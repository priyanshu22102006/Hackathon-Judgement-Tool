const axios = require("axios");
const Team = require("../models/Team");
const Commit = require("../models/Commit");
const { verifyTime, verifyLocation } = require("./commitVerifier");

const GITHUB_API = "https://api.github.com";

// How stale (in ms) a browser-reported location can be before we ignore it.
// 30 minutes — if the participant hasn't refreshed in half an hour we can't trust it.
const LOCATION_STALENESS_MS = 30 * 60 * 1000;

// Track repos that returned 404 with a retry counter.
// After 3 consecutive 404s we skip until the next server restart.
const _repoFailCount = new Map();
const MAX_FAIL_COUNT = 3;

/**
 * Fetch commits from the GitHub API for a given team's repo
 * and store/update them in the database.
 *
 * This is the webhook-free alternative — works without ngrok.
 * Calls: GET /repos/{owner}/{repo}/commits
 */
async function syncRepoCommits(team, hackathon) {
  const repoFullName = team.repoFullName;

  // Skip repos that have failed too many times consecutively
  const failCount = _repoFailCount.get(repoFullName) || 0;
  if (failCount >= MAX_FAIL_COUNT) {
    return { total: 0, new: 0, updated: 0, skipped: true };
  }

  console.log(`[poller] Syncing commits for ${repoFullName}…`);

  try {
    // Fetch ALL commits from GitHub API with pagination
    const headers = { Accept: "application/vnd.github+json" };
    // If a GitHub token is configured, use it to avoid rate limits
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    let ghCommits = [];
    let page = 1;
    let useHeaders = { ...headers };
    while (true) {
      let data;
      try {
        const resp = await axios.get(
          `${GITHUB_API}/repos/${repoFullName}/commits`,
          {
            headers: useHeaders,
            params: {
              per_page: 100,
              page,
            },
          }
        );
        data = resp.data;
      } catch (reqErr) {
        // If 401 with a token, retry once without auth (works for public repos)
        if (reqErr.response?.status === 401 && useHeaders.Authorization) {
          console.warn(`[poller] Token returned 401 for ${repoFullName}, retrying without auth…`);
          delete useHeaders.Authorization;
          const resp = await axios.get(
            `${GITHUB_API}/repos/${repoFullName}/commits`,
            {
              headers: useHeaders,
              params: { per_page: 100, page },
            }
          );
          data = resp.data;
        } else {
          throw reqErr;
        }
      }
      ghCommits = ghCommits.concat(data);
      // Stop when we get fewer than a full page (no more pages)
      if (data.length < 100) break;
      page++;
    }

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
        // Try to use the team's last known browser-reported location
        const loc = team.lastKnownLocation;
        const isFresh =
          loc?.reportedAt &&
          Date.now() - new Date(loc.reportedAt).getTime() < LOCATION_STALENESS_MS;

        if (isFresh && loc.latitude != null && loc.longitude != null) {
          const locationStatus = verifyLocation(
            { latitude: loc.latitude, longitude: loc.longitude },
            hackathon.venue
          );
          commitData.location = {
            latitude: loc.latitude,
            longitude: loc.longitude,
            city: null,
            region: null,
            country: null,
          };
          commitData.locationStatus = locationStatus;
        } else {
          commitData.locationStatus = "unknown";
          commitData.location = {};
        }
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

    // Reset fail counter on success
    _repoFailCount.delete(repoFullName);

    console.log(
      `[poller] ${repoFullName}: ${ghCommits.length} fetched, ${newCount} new, ${updatedCount} updated`
    );

    return { total: ghCommits.length, new: newCount, updated: updatedCount };
  } catch (err) {
    if (err.response?.status === 409) {
      // 409 Conflict = repo exists but is empty (no commits yet)
      console.warn(`[poller] Repo ${repoFullName} is empty (no commits yet). Nothing to sync.`);
      return { total: 0, new: 0, updated: 0, empty: true };
    } else if (err.response?.status === 403) {
      console.warn(`[poller] Rate limited for ${repoFullName}. Add GITHUB_TOKEN to .env`);
    } else if (err.response?.status === 404) {
      const newFail = (_repoFailCount.get(repoFullName) || 0) + 1;
      _repoFailCount.set(repoFullName, newFail);
      console.warn(`[poller] Repo not found: ${repoFullName} (attempt ${newFail}/${MAX_FAIL_COUNT})`);
    } else {
      console.error(`[poller] Error syncing ${repoFullName}:`, err.message);
    }
    return { total: 0, new: 0, updated: 0, error: err.message };
  }
}

/**
 * Deep-sync: fetch per-commit file details (filenames, additions, deletions)
 * from the GitHub API for every commit that is missing this data.
 *
 * This is more expensive (1 API call per commit) so it is triggered
 * explicitly by the judge via "Run Deep Analysis".
 */
async function deepSyncRepoCommits(team, hackathon) {
  const repoFullName = team.repoFullName;
  console.log(`[deep-sync] Fetching file details for ${repoFullName}…`);

  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const commits = await Commit.find({ team: team._id });
  let enriched = 0;

  for (const commit of commits) {
    // Skip commits that already have file details AND line stats
    if (
      commit.filesChanged &&
      commit.filesChanged.length > 0 &&
      commit.additions != null
    ) {
      continue;
    }

    try {
      let commitData;
      try {
        const resp = await axios.get(
          `${GITHUB_API}/repos/${repoFullName}/commits/${commit.commitHash}`,
          { headers }
        );
        commitData = resp.data;
      } catch (reqErr) {
        if (reqErr.response?.status === 401 && headers.Authorization) {
          console.warn(`[deep-sync] Token 401, retrying without auth…`);
          delete headers.Authorization;
          const resp = await axios.get(
            `${GITHUB_API}/repos/${repoFullName}/commits/${commit.commitHash}`,
            { headers }
          );
          commitData = resp.data;
        } else {
          throw reqErr;
        }
      }

      const filesChanged = (commitData.files || []).map((f) => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions || 0,
        deletions: f.deletions || 0,
      }));

      await Commit.findByIdAndUpdate(commit._id, {
        filesChanged,
        additions: commitData.stats?.additions || 0,
        deletions: commitData.stats?.deletions || 0,
      });

      enriched++;

      // Small delay to be kind to GitHub rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (err) {
      if (err.response?.status === 403) {
        console.warn(`[deep-sync] Rate limited. Stopping.`);
        break;
      }
      console.warn(
        `[deep-sync] Failed to fetch ${commit.commitHash}: ${err.message}`
      );
    }
  }

  console.log(
    `[deep-sync] ${repoFullName}: enriched ${enriched}/${commits.length} commits`
  );
  return { total: commits.length, enriched };
}

/**
 * Deep-sync all teams for a given hackathon.
 */
async function deepSyncAllTeams(hackathonId) {
  const teams = await Team.find({ hackathon: hackathonId }).populate(
    "hackathon"
  );
  const results = {};
  for (const team of teams) {
    results[team.repoFullName] = await deepSyncRepoCommits(
      team,
      team.hackathon
    );
  }
  return results;
}

/**
 * Clear the repo fail cache. Called when teams are re-seeded or updated.
 */
function clearRepoFailCache() {
  _repoFailCount.clear();
}

/**
 * Sync all teams for a given hackathon.
 */
async function syncAllTeams(hackathonId) {
  const teams = await Team.find({ hackathon: hackathonId }).populate("hackathon");
  const results = {};

  // Reset fail cache for repos currently in the DB so re-seeded repos get a fresh start
  for (const team of teams) {
    _repoFailCount.delete(team.repoFullName);
  }

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

module.exports = { syncRepoCommits, syncAllTeams, startPollingLoop, clearRepoFailCache, deepSyncRepoCommits, deepSyncAllTeams };
