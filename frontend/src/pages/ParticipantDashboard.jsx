import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import CommitTimeline from "../components/CommitTimeline";
import IntegrityMeter from "../components/IntegrityMeter";
import FlagsList from "../components/FlagsList";
import LiveIndicator from "../components/LiveIndicator";

const POLL_INTERVAL = 10_000; // 10 seconds
const LOCATION_INTERVAL = 15_000; // report location every 15 seconds

export default function ParticipantDashboard() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [summary, setSummary] = useState(null);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [geoStatus, setGeoStatus] = useState("pending"); // pending | active | denied | unavailable
  const [currentLocation, setCurrentLocation] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [remark, setRemark] = useState(null);
  const intervalRef = useRef(null);
  const geoIntervalRef = useRef(null);

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
        axios.get(`/api/tasks?team=${selectedTeam}`),
        axios.get(`/api/remarks/scores/team/${selectedTeam}`),
      ])
        .then(([commitsRes, summaryRes, tasksRes, remarkRes]) => {
          setCommits(commitsRes.data);
          setSummary(summaryRes.data);
          setTasks(tasksRes.data);
          setRemark(remarkRes.data);
          setLastUpdate(new Date());
        })
        .finally(() => setLoading(false));
    },
    [selectedTeam]
  );

  // On team load/change: sync with GitHub first, then fetch display data.
  // Background polling (every 10s) only reads the DB — no extra API calls.
  useEffect(() => {
    if (!selectedTeam) return;
    setSyncing(true);
    axios
      .post(`/api/sync/team/${selectedTeam}`)
      .catch((err) => console.warn("[sync]", err.message))
      .finally(() => {
        setSyncing(false);
        fetchData(true);
      });
    // Start polling
    intervalRef.current = setInterval(() => fetchData(false), POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]); // fetchData already changes when selectedTeam changes

  // ── Browser geolocation → report to backend ──────────
  const reportLocation = useCallback(async () => {
    if (!selectedTeam) return;

    const sendLocation = (latitude, longitude, accuracy = null) => {
      setCurrentLocation({ latitude, longitude, accuracy });
      setGeoStatus("active");
      axios
        .post("/api/participant/location", {
          team: selectedTeam,
          latitude,
          longitude,
          accuracy,
        })
        .catch((err) =>
          console.warn("[geo] Failed to report location:", err.message)
        );
    };

    // Try browser geolocation first
    const tryBrowserGeo = () =>
      new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("unsupported"));
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          (err) => reject(err),
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 30000 }
        );
      });

    try {
      const coords = await tryBrowserGeo();
      sendLocation(coords.latitude, coords.longitude, coords.accuracy);
    } catch (geoErr) {
      console.warn("[geo] Browser geolocation failed:", geoErr.message, "— trying IP fallback");
      // IP-based fallback
      try {
        const res = await axios.get("/api/geolocation");
        sendLocation(res.data.latitude, res.data.longitude);
      } catch {
        console.warn("[geo] IP fallback also failed");
        setGeoStatus(geoErr?.code === 1 ? "denied" : "unavailable");
      }
    }
  }, [selectedTeam]);

  useEffect(() => {
    reportLocation(); // report immediately
    geoIntervalRef.current = setInterval(reportLocation, LOCATION_INTERVAL);
    return () => clearInterval(geoIntervalRef.current);
  }, [reportLocation]);

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

      {/* ── Location tracking status ─────────── */}
      <div
        style={{
          marginBottom: 16,
          padding: "8px 14px",
          borderRadius: 8,
          fontSize: "0.85rem",
          background:
            geoStatus === "active"
              ? "rgba(82,196,26,0.12)"
              : geoStatus === "denied"
              ? "rgba(248,81,73,0.12)"
              : "rgba(139,148,158,0.12)",
          color:
            geoStatus === "active"
              ? "#52c41a"
              : geoStatus === "denied"
              ? "#f85149"
              : "#8b949e",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: "1.1rem" }}>
          {geoStatus === "active"
            ? "📍"
            : geoStatus === "denied"
            ? "🚫"
            : "⏳"}
        </span>
        {geoStatus === "active" && currentLocation && (
          <span>
            Location tracking active — ({currentLocation.latitude.toFixed(4)},{" "}
            {currentLocation.longitude.toFixed(4)})
            {currentLocation.accuracy && (
              <span style={{ opacity: 0.7 }}>
                {" "}
                ±{Math.round(currentLocation.accuracy)}m
              </span>
            )}
          </span>
        )}
        {geoStatus === "pending" && <span>Requesting location access…</span>}
        {geoStatus === "denied" && (
          <span>
            Location access denied — please allow location to verify on-site
            presence.
          </span>
        )}
        {geoStatus === "unavailable" && (
          <span>Geolocation not available in this browser.</span>
        )}
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

      {/* ── Assigned Tasks ──────────────────────── */}
      <div className="card">
        <h2 className="section-title">
          Assigned Tasks{" "}
          <span style={{ fontSize: "0.75rem", color: "#484f58", fontWeight: 400 }}>
            (set by judges)
          </span>
        </h2>
        {tasks.length > 0 ? (
          <>
            <div
              style={{
                marginBottom: 8,
                fontSize: "0.82rem",
                color: "#8b949e",
              }}
            >
              {tasks.filter((tk) => tk.completed).length} / {tasks.length}{" "}
              completed
            </div>
            {/* Progress bar */}
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: "#21262d",
                marginBottom: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(tasks.filter((tk) => tk.completed).length / tasks.length) * 100}%`,
                  background: "#238636",
                  borderRadius: 3,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {tasks.map((task) => (
                <li
                  key={task._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    marginBottom: 4,
                    borderRadius: 6,
                    background: task.completed
                      ? "rgba(82,196,26,0.08)"
                      : "rgba(139,148,158,0.06)",
                    border: "1px solid #21262d",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.1rem",
                      width: 22,
                      textAlign: "center",
                    }}
                  >
                    {task.completed ? "\u2705" : "\u2B55"}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      textDecoration: task.completed
                        ? "line-through"
                        : "none",
                      color: task.completed ? "#52c41a" : "#c9d1d9",
                    }}
                  >
                    {task.title}
                  </span>
                  {task.completed && task.completedAt && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "#484f58",
                      }}
                    >
                      Done {new Date(task.completedAt).toLocaleString()}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p style={{ color: "#484f58", fontSize: "0.85rem" }}>
            No tasks assigned yet.
          </p>
        )}
      </div>

      {/* ── Judge Remarks & Scores ──────────────── */}
      {remark && remark.scores && remark.scores.length > 0 && (
        <div className="card" style={{ marginBottom: 0 }}>
          <h2 className="section-title">
            Judge Remarks{" "}
            <span
              style={{
                fontSize: "0.75rem",
                color: "#484f58",
                fontWeight: 400,
              }}
            >
              (scoring by judges)
            </span>
          </h2>

          {/* Final verdict banner */}
          {remark.finalVerdict && remark.finalVerdict !== "Pending" && (
            <div
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                marginBottom: 14,
                fontWeight: 700,
                fontSize: "1rem",
                background:
                  remark.finalVerdict === "Winner"
                    ? "rgba(82,196,26,0.12)"
                    : remark.finalVerdict === "Disqualified"
                    ? "rgba(248,81,73,0.12)"
                    : "rgba(88,166,255,0.1)",
                color:
                  remark.finalVerdict === "Winner"
                    ? "#52c41a"
                    : remark.finalVerdict === "Disqualified"
                    ? "#f85149"
                    : "#58a6ff",
                textAlign: "center",
              }}
            >
              {remark.finalVerdict === "Winner" && "🏆 "}
              {remark.finalVerdict === "Runner Up" && "🥈 "}
              {remark.finalVerdict === "Honorable Mention" && "🎖️ "}
              {remark.finalVerdict === "Disqualified" && "⛔ "}
              Decision: {remark.finalVerdict}
            </div>
          )}

          {/* Section-wise scores */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 12,
            }}
          >
            {remark.scores.map((sc, i) => (
              <div
                key={i}
                style={{
                  background: "#161b22",
                  border: "1px solid #21262d",
                  borderRadius: 8,
                  padding: "10px 16px",
                  minWidth: 120,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "#8b949e",
                    marginBottom: 4,
                  }}
                >
                  {sc.sectionName}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color:
                      sc.marks >= sc.maxMarks * 0.7
                        ? "#52c41a"
                        : sc.marks >= sc.maxMarks * 0.4
                        ? "#d29922"
                        : "#f85149",
                  }}
                >
                  {sc.marks}
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "#484f58",
                      fontWeight: 400,
                    }}
                  >
                    /{sc.maxMarks}
                  </span>
                </div>
              </div>
            ))}
            {/* Total */}
            <div
              style={{
                background: "rgba(88,166,255,0.08)",
                border: "1px solid rgba(88,166,255,0.25)",
                borderRadius: 8,
                padding: "10px 16px",
                minWidth: 120,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "#58a6ff",
                  marginBottom: 4,
                }}
              >
                Total
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: "#58a6ff",
                }}
              >
                {remark.totalMarks}
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#484f58",
                    fontWeight: 400,
                  }}
                >
                  /{remark.maxTotalMarks}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar for total */}
          <div
            style={{
              height: 6,
              borderRadius: 3,
              background: "#21262d",
              marginBottom: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${remark.maxTotalMarks > 0 ? (remark.totalMarks / remark.maxTotalMarks) * 100 : 0}%`,
                background:
                  remark.totalMarks / (remark.maxTotalMarks || 1) >= 0.7
                    ? "#238636"
                    : remark.totalMarks / (remark.maxTotalMarks || 1) >= 0.4
                    ? "#d29922"
                    : "#f85149",
                borderRadius: 3,
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {/* Notes */}
          {remark.notes && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                background: "rgba(139,148,158,0.06)",
                border: "1px solid #21262d",
                fontSize: "0.85rem",
                color: "#c9d1d9",
              }}
            >
              <strong style={{ color: "#8b949e" }}>Judge Notes:</strong>{" "}
              {remark.notes}
            </div>
          )}
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
        {syncing ? (
          <p style={{ color: "#58a6ff" }}>Syncing with GitHub…</p>
        ) : loading ? (
          <p>Loading…</p>
        ) : (
          <CommitTimeline commits={commits} />
        )}
      </div>
    </>
  );
}
