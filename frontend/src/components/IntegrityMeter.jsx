export default function IntegrityMeter({ integrity }) {
  if (!integrity) return null;

  const {
    totalScore = 0,
    verdict = "\u2014",
    verdictColor = "#8b949e",
    repoStatus,
    repoStatusColor,
    time,
    location,
    frequencyCurve,
    metricPadding,
    codeDump,
    // legacy fallback
    pattern,
  } = integrity;

  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (totalScore / 100) * circumference;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 28, flexWrap: "wrap" }}>
      {/* ── Circular score gauge ────────────────── */}
      <div style={{ textAlign: "center" }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="#21262d" strokeWidth={strokeWidth} />
          <circle
            cx="65" cy="65" r={radius} fill="none"
            stroke={verdictColor} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round" transform="rotate(-90 65 65)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
          <text x="65" y="58" textAnchor="middle" dominantBaseline="central"
            fill="#f0f6fc" fontSize="28" fontWeight="700">{totalScore}</text>
          <text x="65" y="80" textAnchor="middle" dominantBaseline="central"
            fill="#8b949e" fontSize="12">/ 100</text>
        </svg>
        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: verdictColor, marginTop: 4, letterSpacing: 1 }}>
          {verdict}
        </div>
        {repoStatus && (
          <div style={{
            marginTop: 6,
            padding: "3px 10px",
            borderRadius: 12,
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: 0.5,
            background: `${repoStatusColor}18`,
            color: repoStatusColor,
            display: "inline-block",
          }}>
            {repoStatus.replace(/_/g, " ")}
          </div>
        )}
      </div>

      {/* ── Score breakdown bars ────────────────── */}
      <div style={{ minWidth: 220, flex: "0 0 auto" }}>
        {time && <ScoreBar label="Time Window" score={time.score} max={25} color="#58a6ff" />}
        {location && <ScoreBar label="Location" score={location.score} max={15} color="#58a6ff" />}
        {frequencyCurve && <ScoreBar label="Frequency Curve" score={frequencyCurve.score} max={20} color="#a371f7" />}
        {metricPadding && <ScoreBar label="Metric Padding" score={metricPadding.score} max={20} color="#f0883e" />}
        {codeDump && <ScoreBar label="Code Dump" score={codeDump.score} max={20} color="#f85149" />}
        {/* Legacy fallback for old data */}
        {!frequencyCurve && pattern && <ScoreBar label="Pattern" score={pattern.score} max={20} color="#52c41a" />}
      </div>
    </div>
  );
}

function ScoreBar({ label, score, max, color }) {
  const pct = max > 0 ? (score / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#8b949e", marginBottom: 3 }}>
        <span>{label}</span>
        <span><strong style={{ color: "#c9d1d9" }}>{score}</strong>/{max}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "#21262d", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: color, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}
