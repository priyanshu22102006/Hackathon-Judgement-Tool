const BLOAT_PATTERNS = [
  /^node_modules\//i, /^\.?venv\//i, /^env\//i, /^__pycache__\//i,
  /^dist\//i, /^build\//i, /^\.next\//i, /^out\//i, /^vendor\//i,
  /^target\//i, /^coverage\//i, /\.pyc$/i, /\.min\.js$/i,
  /\.bundle\.js$/i, /\.chunk\.js$/i,
];

function hasBloat(files) {
  if (!files?.length) return false;
  return files.some((f) => BLOAT_PATTERNS.some((p) => p.test(f.filename || "")));
}

export default function CommitTimeline({ commits = [] }) {
  if (!commits.length)
    return <p style={{ color: "#484f58" }}>No commits yet.</p>;

  return (
    <div className="commit-timeline">
      {commits.map((c) => {
        const sha = c.sha || c.commitHash || c._id;
        const author = c.author || c.authorName || "unknown";
        const branch = c.branch || "main";
        const fileCount = c.filesChanged?.length || 0;
        const additions = c.additions || 0;
        const deletions = c.deletions || 0;
        const isBloaty = hasBloat(c.filesChanged);
        const isDump = fileCount > 30;

        return (
          <div key={sha} style={itemStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <code style={shaStyle}>{String(sha).slice(0, 7)}</code>
              <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{c.message}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: "0.78rem", color: "#8b949e", display: "flex", gap: 6, alignItems: "center" }}>
                <span>{author}</span>
                <span>&middot;</span>
                <span>{new Date(c.timestamp).toLocaleString()}</span>
                <span>&middot;</span>
                <span>{branch}</span>
                {fileCount > 0 && (
                  <>
                    <span>&middot;</span>
                    <span style={{ color: isDump ? "#f85149" : "#8b949e" }}>
                      {fileCount} file{fileCount !== 1 ? "s" : ""}
                    </span>
                  </>
                )}
                {(additions > 0 || deletions > 0) && (
                  <>
                    <span style={{ color: "#52c41a", fontWeight: 600 }}>+{additions}</span>
                    <span style={{ color: "#f85149", fontWeight: 600 }}>-{deletions}</span>
                  </>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ ...badgeBase, ...(c.timeValid ? badgeGreen : badgeRed) }}>
                  {c.timeValid ? "VALID TIME" : "INVALID TIME"}
                </span>
                <span style={{
                  ...badgeBase,
                  ...(c.locationStatus === "on-site" ? badgeGreen
                    : c.locationStatus === "outside" ? badgeRed
                    : badgeGray),
                }}>
                  {c.locationStatus === "on-site" ? "ON-SITE"
                    : c.locationStatus === "outside" ? "OUTSIDE"
                    : "UNKNOWN"}
                </span>
                {isDump && (
                  <span style={{ ...badgeBase, ...badgeRed }}>CODE DUMP</span>
                )}
                {isBloaty && !isDump && (
                  <span style={{ ...badgeBase, ...badgeOrange }}>BLOAT</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const itemStyle = { padding: "10px 0", borderBottom: "1px solid #21262d" };
const shaStyle = { background: "#21262d", padding: "2px 6px", borderRadius: 4, fontSize: "0.78rem", color: "#58a6ff" };
const badgeBase = { display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 700, letterSpacing: 0.3, textTransform: "uppercase" };
const badgeGreen = { background: "rgba(82,196,26,0.15)", color: "#52c41a" };
const badgeRed = { background: "rgba(248,81,73,0.15)", color: "#f85149" };
const badgeOrange = { background: "rgba(240,136,62,0.15)", color: "#f0883e" };
const badgeGray = { background: "rgba(139,148,158,0.15)", color: "#8b949e" };
