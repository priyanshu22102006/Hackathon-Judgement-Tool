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
  const [syncing, setSyncing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef(null);

  // Venue editor state
  const [venueEditing, setVenueEditing] = useState(false);
  const [venueLabel, setVenueLabel] = useState("");
  const [venueLat, setVenueLat] = useState("");
  const [venueLng, setVenueLng] = useState("");
  const [venueRadius, setVenueRadius] = useState("");
  const [venueSaving, setVenueSaving] = useState(false);
  const [venueResult, setVenueResult] = useState(null);

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

  // On hackathon load/change: sync with GitHub first, then fetch display data.
  // Background polling (every 10s) only reads the DB — no extra API calls.
  useEffect(() => {
    if (!selectedHackathon) return;
    setSyncing(true);
    axios
      .post(`/api/sync/hackathon/${selectedHackathon}`)
      .catch((err) => console.warn("[sync]", err.message))
      .finally(() => {
        setSyncing(false);
        fetchData(true);
      });
    intervalRef.current = setInterval(() => fetchData(false), POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]); // fetchData already changes when selectedHackathon changes

  const toggleExpand = (teamId) => {
    setExpandedTeam((prev) => (prev === teamId ? null : teamId));
  };

  // Sync venue form fields when overview data changes
  useEffect(() => {
    if (overview?.hackathon?.venue) {
      const v = overview.hackathon.venue;
      setVenueLabel(v.label || "");
      setVenueLat(v.latitude ?? "");
      setVenueLng(v.longitude ?? "");
      setVenueRadius(v.radiusKm ?? 5);
    }
  }, [overview?.hackathon?.venue]);

  // Save venue and re-verify all commits
  const handleVenueSave = async () => {
    if (!venueLat || !venueLng) return;
    setVenueSaving(true);
    setVenueResult(null);
    try {
      const { data } = await axios.put(
        `/api/hackathons/${selectedHackathon}/venue`,
        {
          label: venueLabel,
          latitude: parseFloat(venueLat),
          longitude: parseFloat(venueLng),
          radiusKm: parseFloat(venueRadius) || 5,
        }
      );
      setVenueResult(data.reverified);
      setVenueEditing(false);
      // Refresh dashboard data so updated location statuses are visible
      fetchData(false);
    } catch (err) {
      console.error("Venue save error:", err);
      setVenueResult({ error: err.response?.data?.error || err.message });
    } finally {
      setVenueSaving(false);
    }
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

      {syncing && <p style={{ color: "#58a6ff" }}>Syncing with GitHub…</p>}
      {loading && !syncing && <p>Loading…</p>}

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

          {/* ── Hackathon window + Venue settings ──── */}
          {overview.hackathon && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#8b949e",
                  marginBottom: venueEditing ? 12 : 0,
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
                &nbsp;&nbsp;
                <button
                  onClick={() => setVenueEditing(!venueEditing)}
                  style={{
                    background: "none",
                    border: "1px solid #30363d",
                    color: "#58a6ff",
                    borderRadius: 6,
                    padding: "2px 10px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                >
                  {venueEditing ? "Cancel" : "Edit Venue"}
                </button>
                &nbsp;&nbsp;
                <span style={{ fontSize: "0.75rem" }}>
                  Auto-refreshes every 10s
                </span>
              </div>

              {/* ── Venue Editor ──────────────────────── */}
              {venueEditing && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 10,
                    alignItems: "flex-end",
                    padding: "12px 0 0",
                    borderTop: "1px solid #21262d",
                  }}
                >
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#8b949e", marginBottom: 2 }}>
                      Label
                    </label>
                    <input
                      type="text"
                      value={venueLabel}
                      onChange={(e) => setVenueLabel(e.target.value)}
                      placeholder="Venue name"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#8b949e", marginBottom: 2 }}>
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={venueLat}
                      onChange={(e) => setVenueLat(e.target.value)}
                      placeholder="22.5726"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#8b949e", marginBottom: 2 }}>
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={venueLng}
                      onChange={(e) => setVenueLng(e.target.value)}
                      placeholder="88.3639"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#8b949e", marginBottom: 2 }}>
                      Radius (km)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={venueRadius}
                      onChange={(e) => setVenueRadius(e.target.value)}
                      placeholder="5"
                      style={{ ...inputStyle, width: 70 }}
                    />
                  </div>
                  <button
                    onClick={handleVenueSave}
                    disabled={venueSaving || !venueLat || !venueLng}
                    style={{
                      background: "#238636",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 16px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      opacity: venueSaving ? 0.6 : 1,
                    }}
                  >
                    {venueSaving ? "Saving…" : "Save & Re-verify"}
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setVenueLat(pos.coords.latitude);
                            setVenueLng(pos.coords.longitude);
                          },
                          () => alert("Could not get your location")
                        );
                      } else {
                        alert("Geolocation not supported");
                      }
                    }}
                    style={{
                      background: "none",
                      border: "1px solid #30363d",
                      color: "#58a6ff",
                      borderRadius: 6,
                      padding: "6px 12px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                  >
                    📍 Use My Location
                  </button>
                </div>
              )}

              {/* Re-verify result toast */}
              {venueResult && !venueResult.error && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "rgba(82,196,26,0.1)",
                    color: "#52c41a",
                    fontSize: "0.82rem",
                  }}
                >
                  Venue updated — re-verified {venueResult.total} commit(s):{" "}
                  <strong>{venueResult.onSite}</strong> on-site,{" "}
                  <strong>{venueResult.outside}</strong> outside,{" "}
                  <strong>{venueResult.unknown}</strong> unknown
                </div>
              )}
              {venueResult?.error && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: "rgba(248,81,73,0.1)",
                    color: "#f85149",
                    fontSize: "0.82rem",
                  }}
                >
                  Error: {venueResult.error}
                </div>
              )}
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

const inputStyle = {
  background: "#0d1117",
  border: "1px solid #30363d",
  borderRadius: 6,
  color: "#c9d1d9",
  padding: "6px 10px",
  fontSize: "0.85rem",
  width: 120,
};
