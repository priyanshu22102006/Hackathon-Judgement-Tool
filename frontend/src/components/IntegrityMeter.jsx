/**
 * IntegrityMeter – circular score gauge with verdict.
 */
export default function IntegrityMeter({ integrity }) {
  if (!integrity) return null;

  const { totalScore, verdict, verdictColor, time, location, pattern } =
    integrity;

  // SVG circular gauge
  const size = 140;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (totalScore / 100) * circumference;

  return (
    <div className="integrity-meter">
      <div className="integrity-gauge">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#21262d"
            strokeWidth={stroke}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={verdictColor}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
          {/* Score text */}
          <text
            x={size / 2}
            y={size / 2 - 8}
            textAnchor="middle"
            dominantBaseline="central"
            fill={verdictColor}
            fontSize="28"
            fontWeight="700"
          >
            {totalScore}
          </text>
          <text
            x={size / 2}
            y={size / 2 + 18}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#8b949e"
            fontSize="11"
          >
            / 100
          </text>
        </svg>
        <div className="verdict-label" style={{ color: verdictColor }}>
          {verdict}
        </div>
      </div>

      <div className="integrity-breakdown">
        <ScoreBar label="Time" score={time.score} max={50} color="#58a6ff" />
        <ScoreBar
          label="Location"
          score={location.score}
          max={30}
          color="#a371f7"
        />
        <ScoreBar
          label="Pattern"
          score={pattern.score}
          max={20}
          color="#d29922"
        />
      </div>
    </div>
  );
}

function ScoreBar({ label, score, max, color }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="score-bar">
      <div className="score-bar-header">
        <span className="score-bar-label">{label}</span>
        <span className="score-bar-value">
          {score}/{max}
        </span>
      </div>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{
            width: `${pct}%`,
            background: color,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}
