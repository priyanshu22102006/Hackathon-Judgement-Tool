/**
 * RepoStatusPanel — Overall repository health / integrity summary.
 *
 * Shows: overall repo status, analysis summary,
 * metric padding details, code dump details, and detailed breakdowns.
 */
export default function RepoStatusPanel({ integrity }) {
  if (!integrity) return null;

  const {
    repoStatus,
    repoStatusColor,
    analysisSummary,
    metricPadding,
    codeDump,
    frequencyCurve,
    totalCommits,
  } = integrity;

  return (
    <div style={{ marginBottom: 16 }}>
      {/* ── Overall Status Banner ─────────────────── */}
      <div
        style={{
          background: `${repoStatusColor}10`,
          border: `1px solid ${repoStatusColor}40`,
          borderRadius: 10,
          padding: "14px 18px",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: "1.3rem" }}>
            {repoStatus === "GENUINE"
              ? "✅"
              : repoStatus === "NEEDS_REVIEW"
              ? "⚠️"
              : repoStatus === "SUSPICIOUS"
              ? "🚨"
              : repoStatus === "LIKELY_FRAUDULENT"
              ? "🛑"
              : "❓"}
          </span>
          <div>
            <div
              style={{
                fontWeight: 800,
                fontSize: "1.1rem",
                color: repoStatusColor,
                letterSpacing: 0.5,
              }}
            >
              {(repoStatus || "UNKNOWN").replace(/_/g, " ")}
            </div>
            <div style={{ fontSize: "0.82rem", color: "#8b949e", marginTop: 2 }}>
              Overall Repository Status
            </div>
          </div>
        </div>
        <div style={{ fontSize: "0.85rem", color: "#c9d1d9", lineHeight: 1.5 }}>
          {analysisSummary}
        </div>
      </div>

      {/* ── Analysis Cards Grid ───────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
        }}
      >
        {/* Metric Padding Card */}
        {metricPadding && (
          <AnalysisCard
            icon="📦"
            title="Metric Padding"
            score={metricPadding.score}
            maxScore={20}
            color="#f0883e"
            items={[
              {
                label: "Bloat files",
                value: `${metricPadding.bloatFiles} / ${metricPadding.totalFilesAcrossCommits}`,
                warn: metricPadding.bloatRatio > 20,
              },
              {
                label: "Bloat ratio",
                value: `${metricPadding.bloatRatio}%`,
                warn: metricPadding.bloatRatio > 20,
                danger: metricPadding.bloatRatio > 50,
              },
              ...(metricPadding.totalAdditions > 0
                ? [
                    {
                      label: "Lines added",
                      value: metricPadding.totalAdditions.toLocaleString(),
                    },
                    {
                      label: "Lines deleted",
                      value: metricPadding.totalDeletions.toLocaleString(),
                    },
                  ]
                : []),
              {
                label: ".gitignore",
                value: metricPadding.gitignoreMissing
                  ? "MISSING"
                  : metricPadding.gitignoreAddedLate
                  ? "Added late"
                  : "Present",
                warn: metricPadding.gitignoreAddedLate,
                danger: metricPadding.gitignoreMissing,
              },
              ...(metricPadding.suspiciousBloatCommits.length > 0
                ? [
                    {
                      label: "Bloat commits",
                      value: `${metricPadding.suspiciousBloatCommits.length} flagged`,
                      danger: true,
                    },
                  ]
                : []),
            ]}
            details={metricPadding.details}
          />
        )}

        {/* Code Dump Card */}
        {codeDump && (
          <AnalysisCard
            icon="🗃"
            title="Code Dump Detection"
            score={codeDump.score}
            maxScore={20}
            color="#f85149"
            items={[
              {
                label: "First commit files",
                value: codeDump.firstCommitFiles,
                warn: codeDump.firstCommitFiles > 15,
                danger: codeDump.firstCommitIsDump,
              },
              {
                label: "Pre-built dump",
                value: codeDump.firstCommitIsDump ? "YES" : "No",
                danger: codeDump.firstCommitIsDump,
              },
              {
                label: "Dump commits",
                value: codeDump.totalSuspiciousDumps,
                danger: codeDump.totalSuspiciousDumps > 0,
              },
              {
                label: "Build artifacts",
                value: codeDump.buildArtifactsFound,
                warn: codeDump.buildArtifactsFound > 0,
                danger: codeDump.buildArtifactsFound > 5,
              },
              {
                label: "Late .gitignore",
                value: codeDump.lateGitignore ? "Yes" : "No",
                warn: codeDump.lateGitignore,
              },
            ]}
            details={codeDump.details}
          />
        )}

        {/* Frequency Stats Card */}
        {frequencyCurve && (
          <AnalysisCard
            icon="📈"
            title="Commit Rhythm"
            score={frequencyCurve.score}
            maxScore={20}
            color="#a371f7"
            items={[
              {
                label: "Avg commits/hr",
                value: frequencyCurve.avgCommitsPerHour,
              },
              {
                label: "Burstiness",
                value: `${frequencyCurve.burstiness}×`,
                warn: frequencyCurve.burstiness > 3,
                danger: frequencyCurve.burstiness > 5,
              },
              {
                label: "Concentration",
                value: `${frequencyCurve.concentration}%`,
                warn: frequencyCurve.concentration > 60,
                danger: frequencyCurve.concentration > 80,
              },
              {
                label: "Flat→Spike",
                value: frequencyCurve.hasFlatThenSpike ? "DETECTED" : "No",
                danger: frequencyCurve.hasFlatThenSpike,
              },
              {
                label: "Active hours",
                value: `${frequencyCurve.buckets?.filter((b) => b.count > 0).length}/${frequencyCurve.totalHours}`,
              },
            ]}
            details={frequencyCurve.details}
          />
        )}
      </div>

      {/* ── Dump Commits Detail Table ──────────────── */}
      {codeDump?.dumpCommits?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.82rem",
              color: "#f85149",
              marginBottom: 6,
            }}
          >
            🗃 Flagged Dump Commits
          </div>
          <div
            style={{
              background: "#0d1117",
              border: "1px solid rgba(248,81,73,0.25)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {codeDump.dumpCommits.map((d, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 12px",
                  borderBottom:
                    i < codeDump.dumpCommits.length - 1
                      ? "1px solid #21262d"
                      : "none",
                  fontSize: "0.8rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 3,
                  }}
                >
                  <code
                    style={{
                      background: "#21262d",
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                      color: "#f85149",
                    }}
                  >
                    {String(d.commitHash).slice(0, 7)}
                  </code>
                  <span style={{ color: "#c9d1d9", fontWeight: 600 }}>
                    {d.message}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "rgba(248,81,73,0.15)",
                      color: "#f85149",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    {d.filesChanged} files
                  </span>
                </div>
                <div style={{ color: "#8b949e", fontSize: "0.75rem" }}>
                  {d.issue}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bloat Commits Detail ────────────────────── */}
      {metricPadding?.suspiciousBloatCommits?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.82rem",
              color: "#f0883e",
              marginBottom: 6,
            }}
          >
            📦 Bloat Commits (10+ generated files)
          </div>
          <div
            style={{
              background: "#0d1117",
              border: "1px solid rgba(240,136,62,0.25)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {metricPadding.suspiciousBloatCommits.map((b, i) => (
              <div
                key={i}
                style={{
                  padding: "8px 12px",
                  borderBottom:
                    i < metricPadding.suspiciousBloatCommits.length - 1
                      ? "1px solid #21262d"
                      : "none",
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <code
                  style={{
                    background: "#21262d",
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontSize: "0.75rem",
                    color: "#f0883e",
                  }}
                >
                  {String(b.commitHash).slice(0, 7)}
                </code>
                <span style={{ color: "#c9d1d9" }}>{b.message}</span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.72rem",
                    color: "#f0883e",
                    fontWeight: 600,
                  }}
                >
                  {b.bloatFiles}/{b.totalFiles} bloat
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Analysis Card sub-component ──────────────────────────── */
function AnalysisCard({ icon, title, score, maxScore, color, items, details }) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <div
      style={{
        background: "#161b22",
        border: "1px solid #21262d",
        borderRadius: 10,
        padding: 14,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span>{icon}</span>
          <span
            style={{ fontWeight: 700, fontSize: "0.85rem", color: "#c9d1d9" }}
          >
            {title}
          </span>
        </div>
        <div
          style={{
            fontWeight: 700,
            fontSize: "0.9rem",
            color: pct >= 70 ? "#52c41a" : pct >= 40 ? "#d29922" : "#f85149",
          }}
        >
          {score}
          <span
            style={{ fontSize: "0.7rem", color: "#484f58", fontWeight: 400 }}
          >
            /{maxScore}
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: "#21262d",
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 2,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Key-value items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.78rem",
            }}
          >
            <span style={{ color: "#8b949e" }}>{item.label}</span>
            <span
              style={{
                fontWeight: 600,
                color: item.danger
                  ? "#f85149"
                  : item.warn
                  ? "#d29922"
                  : "#c9d1d9",
              }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Detail issues */}
      {details && details.length > 0 && (
        <div style={{ marginTop: 10, borderTop: "1px solid #21262d", paddingTop: 8 }}>
          {details.map((d, i) => (
            <div
              key={i}
              style={{
                fontSize: "0.72rem",
                color: "#f0a8a0",
                padding: "3px 0",
                borderLeft: "2px solid #f85149",
                paddingLeft: 8,
                marginBottom: 4,
              }}
            >
              {d.issue}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
