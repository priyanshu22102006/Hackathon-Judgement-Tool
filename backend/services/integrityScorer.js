/**
 * integrityScorer.js
 *
 * Computes a detailed integrity report for a team based on all their commits.
 *
 * Score breakdown (0-100):
 *   - Time score  (50 pts): % of commits within the hackathon window
 *   - Location score (30 pts): % of commits from on-site location
 *   - Pattern score (20 pts): commit pattern analysis (regularity, no giant pre-built dumps)
 *
 * Verdict:  PURE  (≥ 80)  |  MIXED  (40-79)  |  SUSPICIOUS  (< 40)
 */

function computeIntegrity(commits, hackathon) {
  const report = {
    totalCommits: commits.length,

    // ── Time analysis ────────────────────────────────────
    time: {
      valid: 0,
      invalid: 0,
      beforeStart: 0,
      afterEnd: 0,
      score: 0, // 0-50
      details: [],
    },

    // ── Location analysis ────────────────────────────────
    location: {
      onSite: 0,
      outside: 0,
      unknown: 0,
      score: 0, // 0-30
      details: [],
    },

    // ── Pattern analysis ─────────────────────────────────
    pattern: {
      avgTimeBetweenCommits: null, // minutes
      largestCommitFiles: 0,
      suspiciousLargeCommits: 0, // commits with > 20 files at once
      commitsByHour: {}, // distribution
      score: 0, // 0-20
      details: [],
    },

    // ── Overall ──────────────────────────────────────────
    totalScore: 0, // 0-100
    verdict: "UNKNOWN", // PURE | MIXED | SUSPICIOUS
    verdictColor: "#8b949e",
    flags: [], // human-readable flag messages
  };

  if (commits.length === 0) {
    report.verdict = "NO DATA";
    return report;
  }

  const hStart = new Date(hackathon.startTime).getTime();
  const hEnd = new Date(hackathon.endTime).getTime();

  // ── 1. Time analysis ────────────────────────────────────
  for (const c of commits) {
    const t = new Date(c.timestamp).getTime();
    if (t >= hStart && t <= hEnd) {
      report.time.valid++;
    } else {
      report.time.invalid++;
      if (t < hStart) {
        report.time.beforeStart++;
        report.time.details.push({
          commitHash: c.commitHash,
          message: c.message,
          issue: `Committed ${formatTimeDiff(hStart - t)} BEFORE hackathon started`,
        });
      }
      if (t > hEnd) {
        report.time.afterEnd++;
        report.time.details.push({
          commitHash: c.commitHash,
          message: c.message,
          issue: `Committed ${formatTimeDiff(t - hEnd)} AFTER hackathon ended`,
        });
      }
    }
  }

  const timeRatio = report.time.valid / commits.length;
  report.time.score = Math.round(timeRatio * 50);

  if (report.time.beforeStart > 0) {
    report.flags.push(
      `${report.time.beforeStart} commit(s) made BEFORE the hackathon started — possible pre-built code`
    );
  }
  if (report.time.afterEnd > 0) {
    report.flags.push(
      `${report.time.afterEnd} commit(s) made AFTER the hackathon ended`
    );
  }

  // ── 2. Location analysis ────────────────────────────────
  for (const c of commits) {
    if (c.locationStatus === "on-site") report.location.onSite++;
    else if (c.locationStatus === "outside") {
      report.location.outside++;
      report.location.details.push({
        commitHash: c.commitHash,
        message: c.message,
        issue: `Committed from ${c.location?.city || c.location?.country || "unknown remote location"}`,
      });
    } else {
      report.location.unknown++;
    }
  }

  // For location score, ignore unknowns — score based on known ones only
  const knownLoc = report.location.onSite + report.location.outside;
  const locRatio = knownLoc > 0 ? report.location.onSite / knownLoc : 1;
  report.location.score = Math.round(locRatio * 30);

  if (report.location.outside > 0) {
    report.flags.push(
      `${report.location.outside} commit(s) from OUTSIDE the venue geo-fence`
    );
  }

  // ── 3. Pattern analysis ─────────────────────────────────
  const sorted = [...commits].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Time gaps between consecutive commits
  const gaps = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap =
      (new Date(sorted[i].timestamp) - new Date(sorted[i - 1].timestamp)) /
      60000; // minutes
    gaps.push(gap);
  }
  report.pattern.avgTimeBetweenCommits =
    gaps.length > 0 ? Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length) : null;

  // Commit-by-hour distribution
  for (const c of commits) {
    const h = new Date(c.timestamp).getUTCHours();
    report.pattern.commitsByHour[h] = (report.pattern.commitsByHour[h] || 0) + 1;
  }

  // Large commits (many files at once = possibly dumped pre-built code)
  for (const c of commits) {
    const fileCount = c.filesChanged?.length || 0;
    if (fileCount > report.pattern.largestCommitFiles) {
      report.pattern.largestCommitFiles = fileCount;
    }
    if (fileCount > 20) {
      report.pattern.suspiciousLargeCommits++;
      report.pattern.details.push({
        commitHash: c.commitHash,
        message: c.message,
        issue: `Changed ${fileCount} files in a single commit`,
      });
    }
  }

  // Pattern score: start at 20, deduct for issues
  let patternScore = 20;
  if (report.pattern.suspiciousLargeCommits > 0) {
    patternScore -= Math.min(10, report.pattern.suspiciousLargeCommits * 5);
    report.flags.push(
      `${report.pattern.suspiciousLargeCommits} unusually large commit(s) (20+ files) — possible code dump`
    );
  }
  // If very few commits with many files, suspicious
  if (commits.length <= 2 && report.pattern.largestCommitFiles > 10) {
    patternScore -= 5;
    report.flags.push(
      `Very few commits with many files — project might be pre-built`
    );
  }
  report.pattern.score = Math.max(0, patternScore);

  // ── 4. Overall score & verdict ──────────────────────────
  report.totalScore =
    report.time.score + report.location.score + report.pattern.score;

  if (report.totalScore >= 80) {
    report.verdict = "PURE";
    report.verdictColor = "#52c41a";
  } else if (report.totalScore >= 40) {
    report.verdict = "MIXED";
    report.verdictColor = "#d29922";
  } else {
    report.verdict = "SUSPICIOUS";
    report.verdictColor = "#f85149";
  }

  return report;
}

function formatTimeDiff(ms) {
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

module.exports = { computeIntegrity };
