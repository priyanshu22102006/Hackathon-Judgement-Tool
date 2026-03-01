import { useEffect, useState, useCallback, useRef } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import CommitTimeline from "../components/CommitTimeline";
import IntegrityMeter from "../components/IntegrityMeter";
import FlagsList from "../components/FlagsList";
import LiveIndicator from "../components/LiveIndicator";

const POLL_INTERVAL = 10_000; // 10 seconds
const LOCATION_INTERVAL = 15_000; // report location every 15 seconds

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const selectedTeam = user?.teamId || "";
  const repoName = user?.githubRepo || "";

  const [summary, setSummary] = useState(null);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [geoStatus, setGeoStatus] = useState("pending");
  const [currentLocation, setCurrentLocation] = useState(null);
  const intervalRef = useRef(null);
  const geoIntervalRef = useRef(null);

  // Fetch data function (reusable for polling)
  const fetchData = useCallback(
    (showLoading = false) => {
      if (!selectedTeam) return;
      if (showLoading) setLoading(true);

      Promise.all([
        api.get(`/api/participant/commits?team=${selectedTeam}`),
        api.get(`/api/participant/summary?team=${selectedTeam}`),
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

  // On team load/change: sync with GitHub first, then fetch display data.
  // Background polling (every 10s) only reads the DB — no extra API calls.
  useEffect(() => {
    if (!selectedTeam) return;
    setSyncing(true);
    api
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
  const reportLocation = useCallback(() => {
    if (!selectedTeam) return;
    if (!navigator.geolocation) {
      setGeoStatus("unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCurrentLocation({ latitude, longitude, accuracy });
        setGeoStatus("active");

        api
          .post("/api/participant/location", {
            team: selectedTeam,
            latitude,
            longitude,
            accuracy,
          })
          .catch((err) =>
            console.warn("[geo] Failed to report location:", err.message)
          );
      },
      (err) => {
        console.warn("[geo] Geolocation error:", err.message);
        setGeoStatus(err.code === 1 ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
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
          <span style={{ fontWeight: 600 }}>Your Repo:</span>
          <span style={{ color: "#58a6ff", fontFamily: "monospace", fontSize: "0.9rem" }}>
            {repoName || "(no repo linked)"}
          </span>
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
