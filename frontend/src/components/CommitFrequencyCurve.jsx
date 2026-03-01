/**
 * CommitFrequencyCurve — SVG bar chart showing commit activity per hour.
 *
 * Genuine development shows waves (setup → features → debugging).
 * Pre-built code shows a flat line then a massive spike.
 */
export default function CommitFrequencyCurve({ frequencyCurve }) {
  if (!frequencyCurve || !frequencyCurve.buckets?.length) return null;

  const { buckets, burstiness, concentration, hasFlatThenSpike, avgCommitsPerHour, peakHour } =
    frequencyCurve;

  const maxCount = Math.max(...buckets.map((b) => b.count), 1);

  // Chart dimensions
  const chartW = Math.min(buckets.length * 18 + 60, 700);
  const chartH = 140;
  const padL = 30;
  const padR = 10;
  const padT = 16;
  const padB = 32;
  const drawW = chartW - padL - padR;
  const drawH = chartH - padT - padB;
  const barW = Math.max(4, Math.min(14, drawW / buckets.length - 2));
  const gap = (drawW - barW * buckets.length) / Math.max(1, buckets.length);

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontWeight: 700,
          fontSize: "0.88rem",
          color: "#c9d1d9",
          marginBottom: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>📈</span> Commit Frequency Curve
        {hasFlatThenSpike && (
          <span
            style={{
              background: "rgba(248,81,73,0.15)",
              color: "#f85149",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: "0.7rem",
              fontWeight: 700,
            }}
          >
            FLAT→SPIKE DETECTED
          </span>
        )}
      </div>

      {/* SVG chart */}
      <div
        style={{
          background: "#0d1117",
          border: "1px solid #21262d",
          borderRadius: 10,
          padding: "12px 8px",
          overflowX: "auto",
        }}
      >
        <svg width={chartW} height={chartH} style={{ display: "block" }}>
          {/* Y-axis grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = padT + drawH - frac * drawH;
            return (
              <g key={frac}>
                <line
                  x1={padL}
                  y1={y}
                  x2={padL + drawW}
                  y2={y}
                  stroke="#21262d"
                  strokeDasharray={frac === 0 ? "none" : "3,3"}
                />
                <text
                  x={padL - 4}
                  y={y + 3}
                  textAnchor="end"
                  fill="#484f58"
                  fontSize="9"
                >
                  {Math.round(maxCount * frac)}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {buckets.map((b, i) => {
            const x = padL + i * (barW + gap) + gap / 2;
            const h = maxCount > 0 ? (b.count / maxCount) * drawH : 0;
            const y = padT + drawH - h;

            // Color: green for normal, orange for moderate, red for spike
            let fill = "#238636";
            if (avgCommitsPerHour > 0) {
              if (b.count > avgCommitsPerHour * 4) fill = "#f85149";
              else if (b.count > avgCommitsPerHour * 2) fill = "#d29922";
            }

            const showLabel =
              buckets.length <= 36 ||
              i % Math.ceil(buckets.length / 24) === 0;

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(h, 0)}
                  rx={2}
                  fill={fill}
                  opacity={0.85}
                >
                  <title>
                    Hour {b.hour}: {b.count} commit(s) — {b.label}
                  </title>
                </rect>
                {/* Count on top of bar if > 0 */}
                {b.count > 0 && (
                  <text
                    x={x + barW / 2}
                    y={y - 3}
                    textAnchor="middle"
                    fill="#8b949e"
                    fontSize="8"
                  >
                    {b.count}
                  </text>
                )}
                {/* X-axis label */}
                {showLabel && (
                  <text
                    x={x + barW / 2}
                    y={chartH - 6}
                    textAnchor="middle"
                    fill="#484f58"
                    fontSize="8"
                    transform={`rotate(-45, ${x + barW / 2}, ${chartH - 6})`}
                  >
                    {b.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          marginTop: 8,
          fontSize: "0.78rem",
          color: "#8b949e",
        }}
      >
        <StatChip label="Avg/hr" value={avgCommitsPerHour} />
        <StatChip
          label="Burstiness"
          value={`${burstiness}×`}
          warn={burstiness > 3}
          danger={burstiness > 5}
        />
        <StatChip
          label="Concentration"
          value={`${concentration}%`}
          warn={concentration > 60}
          danger={concentration > 80}
        />
        {peakHour && (
          <StatChip label="Peak" value={`H${peakHour.hour} (${peakHour.count})`} />
        )}
        <StatChip
          label="Spread"
          value={`${buckets.filter((b) => b.count > 0).length}/${buckets.length} hrs`}
        />
      </div>
    </div>
  );
}

function StatChip({ label, value, warn = false, danger = false }) {
  const color = danger ? "#f85149" : warn ? "#d29922" : "#c9d1d9";
  return (
    <div
      style={{
        padding: "4px 10px",
        background: "#161b22",
        border: "1px solid #21262d",
        borderRadius: 6,
      }}
    >
      <span style={{ color: "#484f58" }}>{label}: </span>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}
