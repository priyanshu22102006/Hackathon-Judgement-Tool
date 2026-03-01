/**
 * gitignoreAnalyzer.js
 *
 * Fetches and analyzes the .gitignore file from a GitHub repo.
 * Detects:
 *   1. Committed files that match .gitignore patterns (should have been ignored)
 *   2. Suspicious .gitignore patterns that hide source/main code files
 *   3. Dependencies/imports referencing gitignored or missing files
 *
 * Used during deep sync and integrity scoring.
 */

const axios = require("axios");

const GITHUB_API = "https://api.github.com";

// ── Source code extensions (if these appear in .gitignore, it's suspicious) ──
const SOURCE_EXTENSIONS = [
  ".js", ".jsx", ".ts", ".tsx", ".py", ".java", ".c", ".cpp", ".h",
  ".cs", ".go", ".rs", ".rb", ".php", ".swift", ".kt", ".scala",
  ".vue", ".svelte", ".html", ".css", ".scss", ".sass", ".less",
];

// Patterns in .gitignore that suggest hiding source code (very suspicious)
const SUSPICIOUS_IGNORE_PATTERNS = [
  /^\*\.js$/i, /^\*\.jsx$/i, /^\*\.ts$/i, /^\*\.tsx$/i,
  /^\*\.py$/i, /^\*\.java$/i, /^\*\.c$/i, /^\*\.cpp$/i,
  /^\*\.go$/i, /^\*\.rs$/i, /^\*\.rb$/i, /^\*\.php$/i,
  /^\*\.vue$/i, /^\*\.svelte$/i,
  /^src\//i, /^app\//i, /^lib\//i, /^components\//i,
  /^pages\//i, /^routes\//i, /^services\//i, /^utils\//i,
  /^frontend\//i, /^backend\//i,
  /^\*\.html$/i, /^\*\.css$/i,
];

// ── Normal/expected gitignore patterns (not suspicious) ─────────────
const NORMAL_IGNORE_PATTERNS = [
  /^node_modules/i, /^\.env/i, /^dist\//i, /^build\//i,
  /^\.next\//i, /^\.nuxt\//i, /^out\//i, /^coverage\//i,
  /^\.cache/i, /^__pycache__/i, /^\.pytest_cache/i,
  /^venv\//i, /^\.venv\//i, /^env\//i, /^\.idea\//i,
  /^\.vscode\//i, /^\.vs\//i, /^target\//i, /^vendor\//i,
  /^\.gradle\//i, /^\.DS_Store/i, /^Thumbs\.db/i,
  /^\*\.pyc$/i, /^\*\.pyo$/i, /^\*\.class$/i, /^\*\.o$/i,
  /^\*\.exe$/i, /^\*\.dll$/i, /^\*\.so$/i, /^\*\.log$/i,
  /^package-lock\.json$/i, /^yarn\.lock$/i, /^pnpm-lock/i,
  /^\*\.min\./i, /^\*\.map$/i, /^\*\.bundle\./i,
];

/**
 * Fetch .gitignore content from a GitHub repo.
 * Returns null if the file doesn't exist.
 */
async function fetchGitignore(repoFullName) {
  const headers = { Accept: "application/vnd.github.raw" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const resp = await axios.get(
      `${GITHUB_API}/repos/${repoFullName}/contents/.gitignore`,
      { headers }
    );
    // GitHub returns base64-encoded content when using default accept header
    if (typeof resp.data === "string") return resp.data;
    if (resp.data?.content) {
      return Buffer.from(resp.data.content, "base64").toString("utf-8");
    }
    return null;
  } catch (err) {
    if (err.response?.status === 404) return null;
    console.warn(`[gitignore] Failed to fetch .gitignore for ${repoFullName}:`, err.message);
    return null;
  }
}

/**
 * Fetch the full file tree of a repo (default branch).
 * Returns an array of file paths, or empty array on failure.
 */
async function fetchRepoTree(repoFullName) {
  const headers = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const resp = await axios.get(
      `${GITHUB_API}/repos/${repoFullName}/git/trees/HEAD?recursive=1`,
      { headers }
    );
    return (resp.data?.tree || [])
      .filter((t) => t.type === "blob")
      .map((t) => t.path);
  } catch (err) {
    console.warn(`[gitignore] Failed to fetch repo tree for ${repoFullName}:`, err.message);
    return [];
  }
}

/**
 * Parse .gitignore content into an array of pattern objects.
 */
function parseGitignore(content) {
  if (!content) return [];
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((raw) => {
      const negated = raw.startsWith("!");
      const pattern = negated ? raw.slice(1) : raw;
      return { raw, pattern, negated };
    });
}

/**
 * Check if a filepath matches a single gitignore pattern.
 */
function matchesPattern(filepath, pattern) {
  // Remove trailing slash (directory indicator)
  let pat = pattern.replace(/\/$/, "");

  // Convert gitignore pattern to regex
  let regex = pat
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")  // escape special regex chars (except * and ?)
    .replace(/\\\*\\\*/g, "{{GLOBSTAR}}")    // protect **
    .replace(/\\\*/g, "{{STAR}}")            // protect *
    .replace(/\\\?/g, "{{QMARK}}")          // protect ?
    .replace(/{{STAR}}/g, "[^/]*")           // single star = anything except /
    .replace(/{{QMARK}}/g, "[^/]")          // ? = single char except /
    .replace(/{{GLOBSTAR}}/g, ".*");         // ** = anything including /

  // If pattern doesn't contain /, it matches at any directory level
  if (!pat.includes("/")) {
    regex = "(^|.*/)" + regex + "(/.*)?$";
  } else {
    regex = "^" + regex + "(/.*)?$";
  }

  try {
    return new RegExp(regex, "i").test(filepath);
  } catch {
    return false;
  }
}

/**
 * Check if a filepath matches any of the parsed gitignore patterns.
 * Respects negation patterns (!) — a negated pattern un-ignores a file.
 */
function isGitignored(filepath, patterns) {
  let ignored = false;
  for (const p of patterns) {
    if (matchesPattern(filepath, p.pattern)) {
      ignored = !p.negated;
    }
  }
  return ignored;
}

/**
 * Find suspicious patterns in .gitignore that hide source/main code.
 */
function findSuspiciousPatterns(patterns) {
  const suspicious = [];
  for (const p of patterns) {
    if (p.negated) continue;
    const raw = p.pattern.replace(/\/$/, "");

    // Check if this pattern matches source code
    const matchesSrc = SUSPICIOUS_IGNORE_PATTERNS.some((re) => re.test(raw));
    const isNormal = NORMAL_IGNORE_PATTERNS.some((re) => re.test(raw));

    if (matchesSrc && !isNormal) {
      suspicious.push({
        pattern: p.raw,
        reason: `Gitignore pattern "${p.raw}" hides source/main code files — highly suspicious`,
      });
    }

    // Check if source file extensions are being ignored
    for (const ext of SOURCE_EXTENSIONS) {
      if (raw === `*${ext}` || raw === `**/*${ext}` || raw.endsWith(`/*${ext}`)) {
        if (!suspicious.some((s) => s.pattern === p.raw)) {
          suspicious.push({
            pattern: p.raw,
            reason: `Gitignore hides all "${ext}" files — main source code may be concealed`,
          });
        }
      }
    }
  }
  return suspicious;
}

/**
 * Find committed files that match .gitignore patterns.
 * These are "violations" — files that should have been ignored but were committed.
 */
function findGitignoreViolations(committedFiles, patterns) {
  const violations = [];
  const seen = new Set();

  for (const file of committedFiles) {
    if (seen.has(file)) continue;
    seen.add(file);

    if (isGitignored(file, patterns)) {
      violations.push({
        file,
        matchedPattern: patterns.find((p) => !p.negated && matchesPattern(file, p.pattern))?.raw || "unknown",
      });
    }
  }
  return violations;
}

/**
 * Main analysis function. Analyzes .gitignore against committed files.
 *
 * @param {string|null} gitignoreContent - Raw .gitignore content
 * @param {Array} commits - Array of commit documents with filesChanged
 * @param {Array} repoTree - Optional array of file paths in the repo
 * @returns {Object} Analysis results
 */
function analyzeGitignore(gitignoreContent, commits, repoTree = []) {
  const result = {
    gitignorePresent: !!gitignoreContent,
    gitignoreContent: gitignoreContent || "",
    patterns: [],
    suspiciousPatterns: [],
    violations: [],
    totalViolatingFiles: 0,
    sourceFilesInGitignore: 0,
    violationsByCommit: [],
    repoTreeSize: repoTree.length,
    trackedFilesMatchingGitignore: [],
  };

  if (!gitignoreContent) {
    return result;
  }

  const patterns = parseGitignore(gitignoreContent);
  result.patterns = patterns.map((p) => p.raw);

  // 1. Find suspicious patterns that hide source code
  result.suspiciousPatterns = findSuspiciousPatterns(patterns);
  result.sourceFilesInGitignore = result.suspiciousPatterns.length;

  // 2. Find committed files that match gitignore patterns (violations)
  const allCommittedFiles = [];
  for (const commit of commits) {
    for (const file of commit.filesChanged || []) {
      if (file.filename) allCommittedFiles.push(file.filename);
    }
  }
  result.violations = findGitignoreViolations(allCommittedFiles, patterns);
  result.totalViolatingFiles = result.violations.length;

  // 3. Per-commit violations (for detailed reporting)
  for (const commit of commits) {
    const files = (commit.filesChanged || []).map((f) => f.filename).filter(Boolean);
    const commitViolations = files.filter((f) => isGitignored(f, patterns));
    if (commitViolations.length > 0) {
      result.violationsByCommit.push({
        commitHash: commit.commitHash,
        message: commit.message,
        author: commit.author,
        timestamp: commit.timestamp,
        violatingFiles: commitViolations,
        totalFiles: files.length,
        violationRatio: Math.round((commitViolations.length / files.length) * 100),
      });
    }
  }

  // 4. If we have the repo tree, check tracked files against gitignore
  if (repoTree.length > 0) {
    result.trackedFilesMatchingGitignore = repoTree.filter((f) =>
      isGitignored(f, patterns)
    );
  }

  return result;
}

module.exports = {
  fetchGitignore,
  fetchRepoTree,
  parseGitignore,
  analyzeGitignore,
  isGitignored,
  matchesPattern,
};
