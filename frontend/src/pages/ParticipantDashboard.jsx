import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import CommitTimeline from "../components/CommitTimeline";
import IntegrityMeter from "../components/IntegrityMeter";
import FlagsList from "../components/FlagsList";
import LiveIndicator from "../components/LiveIndicator";

const POLL_INTERVAL = 10_000; // 10 seconds

export default function ParticipantDashboard() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [summary, setSummary] = useState(null);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  // Load all teams on mount
  useEffect(() => {
    axios.get("/api/teams").then((res) => {
      setTeams(res.data);
      if (res.data.length > 0) setSelectedTeam(res.data[0]._id);
    });
  }, []);

  // Fetch data function (reusable for polling)
  const fetchData = useCallback(
    (showLoading = false) => {
      if (!selectedTeam) return;
      if (showLoading) setLoading(true);

      Promise.all([
        axios.get(`/api/participant/commits?team=${selectedTeam}`),
        axios.get(`/api/participant/summary?team=${selectedTeam}`),
      ])
        .then(([commitsRes, summaryRes]) => {
          setCommits(commitsRes.data);
          setSummary(summaryRes.data);
          setLastUpdate(new Date());
        })
        .finally(() => setLoading(false));
    },
    [selectedTeam]
  );

  // Initial fetch + polling
  useEffect(() => {
    fetchData(true);

    // Start polling
    intervalRef.current = setInterval(() => fetchData(false), POLL_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  return (
    <>
      {/* ── Header bar ──────────────────────────── */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label htmlFor="team-select" style={{ fontWeight: 600 }}>
            Your Team:
          </label>
          <select
            id="team-select"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
          >
            {teams.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} — {t.repoFullName}
              </option>
            ))}
          </select>
        </div>
        <LiveIndicator lastUpdate={lastUpdate} />
      </div>

      {/* ── Integrity Overview ──────────────────── */}
      {summary?.integrity && (
        <div className="card integrity-overview">
          <IntegrityMeter integrity={summary.integrity} />
          <FlagsList flags={summary.integrity.flags} />
        </div>
      )}

      {/* ── Summary stats ──────────────────────── */}
      {summary && (
        <div className="card-grid">
          <div className="card stat-card">
            <div className="stat-value">{summary.totalCommits}</div>
            <div className="stat-label">Total Commits</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value" style={{ color: "#52c41a" }}>
              {summary.timeBreakdown.valid}
            </div>
            <div className="stat-label">Valid Time</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value" style={{ color: "#f85149" }}>
              {summary.timeBreakdown.invalid}
            </div>
            <div className="stat-label">Outside Window</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value" style={{ color: "#52c41a" }}>
              {summary.locationBreakdown.onSite}
            </div>
            <div className="stat-label">On-site</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value" style={{ color: "#f85149" }}>
              {summary.locationBreakdown.outside}
            </div>
            <div className="stat-label">Outside Geo-fence</div>
          </div>
        </div>
      )}

      {/* ── Hackathon window banner ────────────── */}
      {summary?.hackathonWindow && (
        <div
          className="card"
          style={{
            marginBottom: 16,
            fontSize: "0.85rem",
            color: "#8b949e",
          }}
        >
          <strong>Hackathon Window:</strong>{" "}
          {new Date(summary.hackathonWindow.start).toLocaleString()} →{" "}
          {new Date(summary.hackathonWindow.end).toLocaleString()}
        </div>
      )}

      {/* ── Commit feed ────────────────────────── */}
      <div className="card">
        <h2 className="section-title">
          Commit History{" "}
          <span style={{ fontSize: "0.75rem", color: "#484f58", fontWeight: 400 }}>
            (auto-refreshes every 10s)
          </span>
        </h2>
        {loading ? <p>Loading…</p> : <CommitTimeline commits={commits} />}
      </div>
    </>
  );
}
