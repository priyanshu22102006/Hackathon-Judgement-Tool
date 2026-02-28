import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import CommitTimeline from "../components/CommitTimeline";
import IntegrityMeter from "../components/IntegrityMeter";
import FlagsList from "../components/FlagsList";
import LiveIndicator from "../components/LiveIndicator";

const POLL_INTERVAL = 10_000; // 10 seconds

export default function JudgeDashboard() {
  const [hackathons, setHackathons] = useState([]);
  const [selectedHackathon, setSelectedHackathon] = useState("");
  const [overview, setOverview] = useState(null);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  // Load hackathons on mount
  useEffect(() => {
    axios.get("/api/hackathons").then((res) => {
      setHackathons(res.data);
      if (res.data.length > 0) setSelectedHackathon(res.data[0]._id);
    });
  }, []);

  // Fetch data (reusable for polling)
  const fetchData = useCallback(
    (showLoading = false) => {
      if (!selectedHackathon) return;
      if (showLoading) setLoading(true);
      axios
        .get(`/api/judge/hackathon/${selectedHackathon}/overview`)
        .then((res) => {
          setOverview(res.data);
          setLastUpdate(new Date());
        })
        .finally(() => setLoading(false));
    },
    [selectedHackathon]
  );

  // Initial fetch + polling
  useEffect(() => {
    fetchData(true);
    intervalRef.current = setInterval(() => fetchData(false), POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  const toggleExpand = (teamId) => {
    setExpandedTeam((prev) => (prev === teamId ? null : teamId));
  };

  // Aggregate stats
  const totalTeams = overview?.teams?.length || 0;
  const totalCommits =
    overview?.teams?.reduce((s, t) => s + t.totalCommits, 0) || 0;
  const flaggedTeams =
    overview?.teams?.filter((t) => t.flagged).length || 0;
  const pureTeams =
    overview?.teams?.filter((t) => t.integrity?.verdict === "PURE").length || 0;
  const suspiciousTeams =
    overview?.teams?.filter((t) => t.integrity?.verdict === "SUSPICIOUS")
      .length || 0;

  return (
    <>
      {/* ── Header ──────────────────────────────── */}
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
          <label htmlFor="hack-select" style={{ fontWeight: 600 }}>
            Hackathon:
          </label>
          <select
            id="hack-select"
            value={selectedHackathon}
            onChange={(e) => setSelectedHackathon(e.target.value)}
          >
            {hackathons.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        <LiveIndicator lastUpdate={lastUpdate} />
      </div>

      {loading && <p>Loading…</p>}

      {overview && !loading && (
        <>
          {/* ── Aggregate stats ─────────────────────── */}
          <div className="card-grid">
            <div className="card stat-card">
              <div className="stat-value">{totalTeams}</div>
              <div className="stat-label">Teams</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value">{totalCommits}</div>
              <div className="stat-label">Total Commits</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value" style={{ color: "#52c41a" }}>
                {pureTeams}
              </div>
              <div className="stat-label">Pure Teams</div>
            </div>
            <div className="card stat-card">
              <div className="stat-value" style={{ color: "#d29922" }}>
                {flaggedTeams - suspiciousTeams > 0 ? flaggedTeams - suspiciousTeams : 0}
              </div>
              <div className="stat-label">Mixed Teams</div>
            </div>
            <div className="card stat-card">
              <div
                className="stat-value"
                style={{ color: "#f85149" }}
              >
                {suspiciousTeams}
              </div>
              <div className="stat-label">Suspicious</div>
            </div>
          </div>

          {/* ── Hackathon window info ──────────────── */}
          {overview.hackathon && (
            <div
              className="card"
              style={{
                marginBottom: 24,
                fontSize: "0.85rem",
                color: "#8b949e",
              }}
            >
              <strong>Window:</strong>{" "}
              {new Date(overview.hackathon.startTime).toLocaleString()} →{" "}
              {new Date(overview.hackathon.endTime).toLocaleString()}
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <strong>Venue:</strong> {overview.hackathon.venue?.label} (
              {overview.hackathon.venue?.latitude?.toFixed(4)},{" "}
              {overview.hackathon.venue?.longitude?.toFixed(4)}) — radius{" "}
              {overview.hackathon.venue?.radiusKm} km
              &nbsp;&nbsp;|&nbsp;&nbsp;
              <span style={{ fontSize: "0.75rem" }}>
                Auto-refreshes every 10s
              </span>
            </div>
          )}

          {/* ── Team table ─────────────────────────── */}
          <div className="card">
            <h2 className="section-title">Teams</h2>
            <table className="team-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Repo</th>
                  <th>Commits</th>
                  <th>Time (V/I)</th>
                  <th>Location (On/Out)</th>
                  <th>Score</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                {overview.teams
                  .sort(
                    (a, b) =>
                      (a.integrity?.totalScore ?? 100) -
                      (b.integrity?.totalScore ?? 100)
                  )
                  .map((t) => (
                    <>
                      <tr
                        key={t.teamId}
                        className="clickable"
                        onClick={() => toggleExpand(t.teamId)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{t.teamName}</td>
                        <td>
                          <a
                            href={`https://github.com/${t.repo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t.repo}
                          </a>
                        </td>
                        <td>{t.totalCommits}</td>
                        <td>
                          <span style={{ color: "#52c41a" }}>
                            {t.validTime}
                          </span>{" "}
                          /{" "}
                          <span style={{ color: "#f85149" }}>
                            {t.invalidTime}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: "#52c41a" }}>{t.onSite}</span>{" "}
                          /{" "}
                          <span style={{ color: "#f85149" }}>{t.outside}</span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                t.integrity?.verdictColor || "#8b949e",
                            }}
                          >
                            {t.integrity?.totalScore ?? "—"}
                          </span>
                          <span style={{ color: "#484f58", fontSize: "0.75rem" }}>
                            /100
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              t.integrity?.verdict === "PURE"
                                ? "clean"
                                : t.integrity?.verdict === "SUSPICIOUS"
                                ? "flagged"
                                : "mixed-badge"
                            }`}
                          >
                            {t.integrity?.verdict || "—"}
                          </span>
                        </td>
                      </tr>
                      {expandedTeam === t.teamId && (
                        <tr key={`${t.teamId}-detail`}>
                          <td
                            colSpan={7}
                            style={{
                              padding: "16px 20px",
                              background: "#0d1117",
                            }}
                          >
                            <div className="team-detail-panel">
                              <IntegrityMeter integrity={t.integrity} />
                              <FlagsList flags={t.integrity?.flags} />
                            </div>
                            <h3
                              style={{
                                margin: "16px 0 8px",
                                fontSize: "0.9rem",
                              }}
                            >
                              All Commits
                            </h3>
                            <CommitTimeline commits={t.commits} />
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
