/**
 * integrityScorer.js
 *
 * Computes a comprehensive integrity report for a team based on all their commits.
 *
 * Score breakdown (0-100):
 *   - Time score          (25 pts): % of commits within the hackathon window
 *   - Location score      (15 pts): % of commits from on-site location
 *   - Frequency Curve     (20 pts): natural commit rhythm vs suspicious spikes
 *   - Metric Padding      (20 pts): detection of bloated/generated files
 *   - Code Dump           (20 pts): pre-built project / single massive commit detection
 *
 * Verdict:      PURE (≥ 80)  |  MIXED (40-79)  |  SUSPICIOUS (< 40)
 * Repo Status:  GENUINE | NEEDS_REVIEW | SUSPICIOUS | LIKELY_FRAUDULENT
 */

// ── Known bloat / generated file patterns ────────────────────────────
const BLOAT_PATTERNS = [
  /^node_modules\//i,
  /^\.?venv\//i,
  /^env\//i,
  /^__pycache__\//i,
  /^\.pytest_cache\//i,
  /^dist\//i,
  /^build\//i,
  /^\.next\//i,
  /^out\//i,
  /^\.nuxt\//i,
  /^vendor\//i,
  /^\.gradle\//i,
  /^\.idea\//i,
  /^\.vs\//i,
  /^target\//i,
  /^coverage\//i,
  /^\.cache\//i,
  /\.pyc$/i,
  /\.pyo$/i,
  /\.class$/i,
  /\.o$/i,
  /\.exe$/i,
  /\.dll$/i,
  /\.so$/i,
  /\.dylib$/i,
  /\.min\.js$/i,
  /\.min\.css$/i,
  /\.bundle\.js$/i,
  /\.chunk\.js$/i,
];

// Build / production artifact patterns
const BUILD_ARTIFACT_PATTERNS = [
  /^dist\//i,
  /^build\//i,
  /^\.next\//i,
  /^out\//i,
  /^\.nuxt\//i,
  /^target\//i,
  /\.min\.js$/i,
  /\.min\.css$/i,
  /\.bundle\.js$/i,
  /\.chunk\.js$/i,
  /\.map$/i,
  /\.wasm$/i,
];

// Commit messages that suggest a code dump
const DUMP_MESSAGE_PATTERNS = [
  /^initial commit$/i,
  /^first commit$/i,
  /^init$/i,
  /^initial$/i,
  /^upload/i,
  /^add(ed)? (all|everything|project|code|files)/i,
  /^migrat/i,
  /^import/i,
  /^copy/i,
  /^transfer/i,
];

function isBloatFile(filename) {
  return BLOAT_PATTERNS.some((p) => p.test(filename));
}
function isBuildArtifact(filename) {
  return BUILD_ARTIFACT_PATTERNS.some((p) => p.test(filename));
}
function isDumpMessage(msg) {
  return DUMP_MESSAGE_PATTERNS.some((p) => p.test(msg?.trim()));
}

// ──────────────────────────────────────────────────────────────────────

function computeIntegrity(commits, hackathon) {
  const report = {
    totalCommits: commits.length,

    // ── 1. Time analysis (25 pts) ────────────────────────
    time: {
      valid: 0,
      invalid: 0,
      beforeStart: 0,
      afterEnd: 0,
      score: 0,
      details: [],
    },

    // ── 2. Location analysis (15 pts) ────────────────────
    location: {
      onSite: 0,
      outside: 0,
      unknown: 0,
      score: 0,
      details: [],
    },

    // ── 3. Commit Frequency Curve (20 pts) ───────────────
    frequencyCurve: {
      buckets: [],
      totalHours: 0,
      burstiness: 0,
      concentration: 0,
      hasSpike: false,
      hasFlatThenSpike: false,
      avgCommitsPerHour: 0,
      peakHour: null,
      score: 0,
      details: [],
    },

    // ── 4. Metric Padding Detection (20 pts) ─────────────
    metricPadding: {
      totalFilesAcrossCommits: 0,
      bloatFiles: 0,
      bloatRatio: 0,
      totalAdditions: 0,
      totalDeletions: 0,
      suspiciousBloatCommits: [],
      gitignoreMissing: false,
      gitignoreAddedLate: false,
      lockFilesCommitted: 0,
      score: 0,
      details: [],
    },

    // ── 5. Code Dump / Pre-built Detection (20 pts) ──────
    codeDump: {
      firstCommitFiles: 0,
      firstCommitIsDump: false,
      dumpCommits: [],
      buildArtifactsFound: 0,
      lateGitignore: false,
      totalSuspiciousDumps: 0,
      score: 0,
      details: [],
    },

    // ── Overall ──────────────────────────────────────────
    totalScore: 0,
    verdict: "UNKNOWN",
    verdictColor: "#8b949e",
    repoStatus: "UNKNOWN",
    repoStatusColor: "#8b949e",
    flags: [],
    analysisSummary: "",
  };

  if (commits.length === 0) {
    report.verdict = "NO DATA";
    report.repoStatus = "NO DATA";
    report.analysisSummary = "No commits found for analysis.";
    return report;
  }

  const hStart = new Date(hackathon.startTime).getTime();
  const hEnd = new Date(hackathon.endTime).getTime();

  // ─────────────────────────────────────────────────────────────────
  // 1. TIME ANALYSIS
  // ─────────────────────────────────────────────────────────────────
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
  report.time.score = Math.round(timeRatio * 25);

  if (report.time.beforeStart > 0) {
    report.flags.push(
      `⏱ ${report.time.beforeStart} commit(s) made BEFORE the hackathon started — possible pre-built code`
    );
  }
  if (report.time.afterEnd > 0) {
    report.flags.push(
      `⏱ ${report.time.afterEnd} commit(s) made AFTER the hackathon ended`
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. LOCATION ANALYSIS
  // ─────────────────────────────────────────────────────────────────
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

  const knownLoc = report.location.onSite + report.location.outside;
  const locRatio = knownLoc > 0 ? report.location.onSite / knownLoc : 1;
  report.location.score = Math.round(locRatio * 15);

  if (report.location.outside > 0) {
    report.flags.push(
      `📍 ${report.location.outside} commit(s) from OUTSIDE the venue geo-fence`
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. COMMIT FREQUENCY CURVE
  //
  // Genuine dev happens in waves (setup → feature building → debugging).
  // Pre-built code shows a flat line followed by a massive spike.
  // ─────────────────────────────────────────────────────────────────
  const sorted = [...commits].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  const bucketSizeMs = 60 * 60 * 1000; // 1-hour buckets
  const numBuckets = Math.max(1, Math.ceil((hEnd - hStart) / bucketSizeMs));
  report.frequencyCurve.totalHours = numBuckets;

  const buckets = [];
  for (let i = 0; i < numBuckets; i++) {
    const bucketStart = hStart + i * bucketSizeMs;
    const bucketEnd = bucketStart + bucketSizeMs;
    const label = new Date(bucketStart).toISOString().slice(11, 16);
    const count = commits.filter((c) => {
      const t = new Date(c.timestamp).getTime();
      return t >= bucketStart && t < bucketEnd;
    }).length;
    buckets.push({
      hour: i,
      count,
      label,
      startTime: new Date(bucketStart).toISOString(),
    });
  }
  report.frequencyCurve.buckets = buckets;

  const totalInWindow = buckets.reduce((s, b) => s + b.count, 0);
  const avgPerBucket = totalInWindow / Math.max(1, numBuckets);
  report.frequencyCurve.avgCommitsPerHour =
    Math.round(avgPerBucket * 100) / 100;

  const maxBucket = Math.max(...buckets.map((b) => b.count));
  const peakBucketIdx = buckets.findIndex((b) => b.count === maxBucket);
  report.frequencyCurve.peakHour =
    peakBucketIdx >= 0 ? buckets[peakBucketIdx] : null;

  // Burstiness = max / avg  (1 = perfectly even, higher = more bursty)
  report.frequencyCurve.burstiness =
    avgPerBucket > 0
      ? Math.round((maxBucket / avgPerBucket) * 100) / 100
      : 0;

  // Concentration: what % of commits land in the top 10 % of time buckets?
  const topN = Math.max(1, Math.ceil(numBuckets * 0.1));
  const sortedBuckets = [...buckets].sort((a, b) => b.count - a.count);
  const topBucketCommits = sortedBuckets
    .slice(0, topN)
    .reduce((s, b) => s + b.count, 0);
  report.frequencyCurve.concentration =
    totalInWindow > 0
      ? Math.round((topBucketCommits / totalInWindow) * 100)
      : 0;

  // Flat-then-spike detection
  let maxFlatStreak = 0;
  let currentFlat = 0;
  let spikeAfterFlat = false;
  for (let i = 0; i < buckets.length; i++) {
    if (buckets[i].count === 0) {
      currentFlat++;
    } else {
      if (currentFlat > maxFlatStreak) {
        maxFlatStreak = currentFlat;
        if (
          buckets[i].count > avgPerBucket * 3 &&
          currentFlat >= numBuckets * 0.3
        ) {
          spikeAfterFlat = true;
        }
      }
      currentFlat = 0;
    }
  }

  report.frequencyCurve.hasSpike =
    maxBucket > avgPerBucket * 4 && avgPerBucket > 0;
  report.frequencyCurve.hasFlatThenSpike = spikeAfterFlat;

  // Score
  let freqScore = 20;
  if (report.frequencyCurve.burstiness > 5) {
    freqScore -= 8;
    report.frequencyCurve.details.push({
      issue: `Very bursty commit pattern (burstiness: ${report.frequencyCurve.burstiness}×) — most commits concentrated in a short period`,
    });
  } else if (report.frequencyCurve.burstiness > 3) {
    freqScore -= 4;
    report.frequencyCurve.details.push({
      issue: `Moderately bursty commit pattern (burstiness: ${report.frequencyCurve.burstiness}×)`,
    });
  }

  if (report.frequencyCurve.concentration > 80) {
    freqScore -= 6;
    report.frequencyCurve.details.push({
      issue: `${report.frequencyCurve.concentration}% of commits in the top 10% of time — possible code dump window`,
    });
  } else if (report.frequencyCurve.concentration > 60) {
    freqScore -= 3;
  }

  if (report.frequencyCurve.hasFlatThenSpike) {
    freqScore -= 6;
    report.flags.push(
      `📈 Flat-then-spike pattern detected — long inactivity followed by a burst of commits`
    );
    report.frequencyCurve.details.push({
      issue: `Flat-then-spike: ${maxFlatStreak} consecutive hours with 0 commits followed by a spike`,
    });
  }

  if (commits.length >= 3 && numBuckets >= 6) {
    const nonEmptyBuckets = buckets.filter((b) => b.count > 0).length;
    const spreadRatio = nonEmptyBuckets / numBuckets;
    if (spreadRatio < 0.15) {
      freqScore -= 4;
      report.frequencyCurve.details.push({
        issue: `Commits only span ${Math.round(spreadRatio * 100)}% of the hackathon duration — very narrow activity window`,
      });
    }
  }

  report.frequencyCurve.score = Math.max(0, freqScore);

  // ─────────────────────────────────────────────────────────────────
  // 4. METRIC PADDING DETECTION
  //
  // Detects: committing node_modules, venv, dist, build artefacts,
  // missing/late .gitignore that allows bloat through, lock files, etc.
  // ─────────────────────────────────────────────────────────────────
  let totalFilesAcrossCommits = 0;
  let bloatFileCount = 0;
  let lockFilesCommitted = 0;
  let totalAdditions = 0;
  let totalDeletions = 0;
  let gitignoreEverSeen = false;
  let gitignoreFirstSeenIdx = -1;

  for (let i = 0; i < sorted.length; i++) {
    const c = sorted[i];
    const files = c.filesChanged || [];
    totalFilesAcrossCommits += files.length;
    totalAdditions += c.additions || 0;
    totalDeletions += c.deletions || 0;

    let commitBloatCount = 0;
    for (const f of files) {
      const fn = f.filename || "";
      if (isBloatFile(fn)) {
        bloatFileCount++;
        commitBloatCount++;
      }
      if (
        /^(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|Pipfile\.lock|poetry\.lock|composer\.lock|Gemfile\.lock|Cargo\.lock)$/i.test(
          fn
        )
      ) {
        lockFilesCommitted++;
      }
      if (/^\.gitignore$/i.test(fn)) {
        if (!gitignoreEverSeen) {
          gitignoreEverSeen = true;
          gitignoreFirstSeenIdx = i;
        }
      }
    }

    if (commitBloatCount > 10) {
      report.metricPadding.suspiciousBloatCommits.push({
        commitHash: c.commitHash,
        message: c.message,
        bloatFiles: commitBloatCount,
        totalFiles: files.length,
      });
    }
  }

  report.metricPadding.totalFilesAcrossCommits = totalFilesAcrossCommits;
  report.metricPadding.bloatFiles = bloatFileCount;
  report.metricPadding.bloatRatio =
    totalFilesAcrossCommits > 0
      ? Math.round((bloatFileCount / totalFilesAcrossCommits) * 100)
      : 0;
  report.metricPadding.totalAdditions = totalAdditions;
  report.metricPadding.totalDeletions = totalDeletions;
  report.metricPadding.lockFilesCommitted = lockFilesCommitted;

  if (!gitignoreEverSeen && totalFilesAcrossCommits > 0) {
    report.metricPadding.gitignoreMissing = true;
  }
  if (gitignoreFirstSeenIdx > 0) {
    report.metricPadding.gitignoreAddedLate = true;
  }

  // Score
  let paddingScore = 20;
  if (report.metricPadding.bloatRatio > 50) {
    paddingScore -= 12;
    report.flags.push(
      `📦 ${report.metricPadding.bloatRatio}% of committed files are generated/bloat (node_modules, venv, dist, etc.) — likely metric padding`
    );
    report.metricPadding.details.push({
      issue: `${bloatFileCount}/${totalFilesAcrossCommits} files are generated/bloat (${report.metricPadding.bloatRatio}%)`,
    });
  } else if (report.metricPadding.bloatRatio > 20) {
    paddingScore -= 6;
    report.flags.push(
      `📦 ${report.metricPadding.bloatRatio}% of committed files appear to be generated/bloat`
    );
    report.metricPadding.details.push({
      issue: `${bloatFileCount}/${totalFilesAcrossCommits} files are generated/bloat (${report.metricPadding.bloatRatio}%)`,
    });
  } else if (report.metricPadding.bloatRatio > 5) {
    paddingScore -= 2;
  }

  if (report.metricPadding.suspiciousBloatCommits.length > 0) {
    paddingScore -= Math.min(
      4,
      report.metricPadding.suspiciousBloatCommits.length * 2
    );
    report.metricPadding.details.push({
      issue: `${report.metricPadding.suspiciousBloatCommits.length} commit(s) contain 10+ bloat/generated files`,
    });
  }

  if (report.metricPadding.gitignoreMissing && totalFilesAcrossCommits > 10) {
    paddingScore -= 4;
    report.flags.push(
      `📦 No .gitignore found — generated files may be inflating metrics`
    );
  }

  if (report.metricPadding.gitignoreAddedLate) {
    paddingScore -= 2;
    report.metricPadding.details.push({
      issue: `.gitignore was added in commit #${gitignoreFirstSeenIdx + 1}, not the first — early commits may contain bloat`,
    });
  }

  report.metricPadding.score = Math.max(0, paddingScore);

  // ─────────────────────────────────────────────────────────────────
  // 5. CODE DUMP / PRE-BUILT DETECTION
  //
  // Spots projects mostly built before the hackathon:
  //   • massive first commit with full project structure
  //   • .gitignore added after the fact
  //   • compiled / production-ready build files
  //   • "initial commit" messages with huge file counts
  // ─────────────────────────────────────────────────────────────────
  const firstCommit = sorted[0];
  const firstCommitFileCount = firstCommit?.filesChanged?.length || 0;
  report.codeDump.firstCommitFiles = firstCommitFileCount;

  if (firstCommitFileCount > 30) {
    report.codeDump.firstCommitIsDump = true;
    report.codeDump.dumpCommits.push({
      commitHash: firstCommit.commitHash,
      message: firstCommit.message,
      filesChanged: firstCommitFileCount,
      issue: `First commit contains ${firstCommitFileCount} files — likely a pre-built project`,
    });
  }

  let buildArtifactsFound = 0;
  for (const c of sorted) {
    const files = c.filesChanged || [];
    const fileCount = files.length;
    const buildCount = files.filter((f) =>
      isBuildArtifact(f.filename || "")
    ).length;
    buildArtifactsFound += buildCount;

    // Massive commit (50+ files)
    if (fileCount > 50) {
      const already = report.codeDump.dumpCommits.some(
        (d) => d.commitHash === c.commitHash
      );
      if (!already) {
        report.codeDump.dumpCommits.push({
          commitHash: c.commitHash,
          message: c.message,
          filesChanged: fileCount,
          issue: `Massive commit with ${fileCount} files`,
        });
      }
    }

    // Dump-style message + many files
    if (isDumpMessage(c.message) && fileCount > 15) {
      const already = report.codeDump.dumpCommits.some(
        (d) => d.commitHash === c.commitHash
      );
      if (!already) {
        report.codeDump.dumpCommits.push({
          commitHash: c.commitHash,
          message: c.message,
          filesChanged: fileCount,
          issue: `Dump-style message "${c.message}" with ${fileCount} files`,
        });
      }
    }
  }

  report.codeDump.buildArtifactsFound = buildArtifactsFound;
  report.codeDump.lateGitignore = report.metricPadding.gitignoreAddedLate;
  report.codeDump.totalSuspiciousDumps = report.codeDump.dumpCommits.length;

  // Score
  let dumpScore = 20;

  if (report.codeDump.firstCommitIsDump) {
    dumpScore -= 8;
    report.flags.push(
      `🗃 First commit contains ${firstCommitFileCount} files — possible pre-built project dump`
    );
  }

  if (report.codeDump.dumpCommits.length > 1) {
    dumpScore -= Math.min(6, (report.codeDump.dumpCommits.length - 1) * 3);
    report.flags.push(
      `🗃 ${report.codeDump.dumpCommits.length} commit(s) flagged as potential code dumps`
    );
  }

  if (buildArtifactsFound > 5) {
    dumpScore -= 4;
    report.flags.push(
      `🗃 ${buildArtifactsFound} build artifact files committed (dist/, build/, .min.js, etc.)`
    );
    report.codeDump.details.push({
      issue: `${buildArtifactsFound} build/production artifact files found in commits`,
    });
  } else if (buildArtifactsFound > 0) {
    dumpScore -= 1;
  }

  // Very few commits, many files = suspicious
  if (commits.length <= 3 && totalFilesAcrossCommits > 40) {
    dumpScore -= 4;
    report.codeDump.details.push({
      issue: `Only ${commits.length} commits but ${totalFilesAcrossCommits} total files — low commit granularity`,
    });
    report.flags.push(
      `🗃 Very few commits (${commits.length}) with many files (${totalFilesAcrossCommits}) — may be pre-built`
    );
  }

  if (report.codeDump.lateGitignore) {
    dumpScore -= 2;
    report.codeDump.details.push({
      issue: `.gitignore added after first commit — early dump may contain build/generated files`,
    });
  }

  report.codeDump.score = Math.max(0, dumpScore);

  // ─────────────────────────────────────────────────────────────────
  // 6. OVERALL SCORE, VERDICT & REPO STATUS
  // ─────────────────────────────────────────────────────────────────
  report.totalScore =
    report.time.score +
    report.location.score +
    report.frequencyCurve.score +
    report.metricPadding.score +
    report.codeDump.score;

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

  // Overall repo status considers both score AND critical flags
  const criticalFlags = report.flags.filter(
    (f) =>
      f.includes("pre-built") ||
      f.includes("code dump") ||
      f.includes("metric padding") ||
      f.includes("BEFORE the hackathon")
  ).length;

  if (report.totalScore >= 85 && criticalFlags === 0) {
    report.repoStatus = "GENUINE";
    report.repoStatusColor = "#52c41a";
  } else if (report.totalScore >= 60 && criticalFlags <= 1) {
    report.repoStatus = "NEEDS_REVIEW";
    report.repoStatusColor = "#d29922";
  } else if (report.totalScore >= 35) {
    report.repoStatus = "SUSPICIOUS";
    report.repoStatusColor = "#f85149";
  } else {
    report.repoStatus = "LIKELY_FRAUDULENT";
    report.repoStatusColor = "#da3633";
  }

  // Human-readable summary
  const summaryParts = [];
  if (report.time.beforeStart > 0)
    summaryParts.push(`${report.time.beforeStart} pre-hackathon commits`);
  if (report.frequencyCurve.hasFlatThenSpike)
    summaryParts.push("flat-then-spike pattern");
  if (report.metricPadding.bloatRatio > 20)
    summaryParts.push(`${report.metricPadding.bloatRatio}% bloat files`);
  if (report.codeDump.firstCommitIsDump)
    summaryParts.push("large initial dump");
  if (report.codeDump.buildArtifactsFound > 0)
    summaryParts.push(`${report.codeDump.buildArtifactsFound} build artifacts`);
  if (report.location.outside > 0)
    summaryParts.push(`${report.location.outside} off-site commits`);

  report.analysisSummary =
    summaryParts.length === 0
      ? "No significant integrity issues detected. Commit patterns appear natural."
      : `Issues found: ${summaryParts.join(", ")}.`;

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
