import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import CommitTimeline from "../components/CommitTimeline";
import IntegrityMeter from "../components/IntegrityMeter";
import FlagsList from "../components/FlagsList";
import LiveIndicator from "../components/LiveIndicator";
import CommitFrequencyCurve from "../components/CommitFrequencyCurve";
import RepoStatusPanel from "../components/RepoStatusPanel";

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

  // Task management state
  const [teamTasks, setTeamTasks] = useState({}); // { [teamId]: Task[] }
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskSaving, setTaskSaving] = useState(false);

  // Scoring criteria state (hackathon-level sections)
  const [scoringSections, setScoringSections] = useState([]); // [{ name, maxMarks }]
  const [criteriaEditing, setCriteriaEditing] = useState(false);
  const [criteriaDraft, setCriteriaDraft] = useState([]); // editing copy
  const [criteriaSaving, setCriteriaSaving] = useState(false);

  // Per-team remarks state
  const [teamRemarks, setTeamRemarks] = useState({}); // { [teamId]: Remark }
  const [remarkSaving, setRemarkSaving] = useState(false);
  const [remarkSavingTeam, setRemarkSavingTeam] = useState(null); // which team is saving

  // Venue editor state
  const [venueEditing, setVenueEditing] = useState(false);
  const [venueLabel, setVenueLabel] = useState("");
  const [venueLat, setVenueLat] = useState("");
  const [venueLng, setVenueLng] = useState("");
  const [venueRadius, setVenueRadius] = useState("");
  const [venueSaving, setVenueSaving] = useState(false);
  const [venueResult, setVenueResult] = useState(null);

  // Deep analysis state
  const [deepSyncing, setDeepSyncing] = useState(false);
  const [deepSyncResult, setDeepSyncResult] = useState(null);

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
    // Fetch tasks and remark when expanding
    if (expandedTeam !== teamId) {
      fetchTasks(teamId);
      fetchRemark(teamId);
    }
  };

  // ── Scoring criteria helpers ─────────────────────────
  const fetchCriteria = useCallback(() => {
    if (!selectedHackathon) return;
    axios.get(`/api/remarks/criteria?hackathon=${selectedHackathon}`).then((res) => {
      setScoringSections(res.data?.sections || []);
    });
  }, [selectedHackathon]);

  useEffect(() => {
    fetchCriteria();
  }, [fetchCriteria]);

  const handleCriteriaEdit = () => {
    setCriteriaDraft(
      scoringSections.length > 0
        ? scoringSections.map((s) => ({ ...s }))
        : [{ name: "", maxMarks: 10 }]
    );
    setCriteriaEditing(true);
  };

  const handleCriteriaSave = async () => {
    const valid = criteriaDraft.filter((s) => s.name.trim() && s.maxMarks > 0);
    if (valid.length === 0) return;
    setCriteriaSaving(true);
    try {
      await axios.put("/api/remarks/criteria", {
        hackathon: selectedHackathon,
        sections: valid.map((s) => ({ name: s.name.trim(), maxMarks: Number(s.maxMarks) })),
      });
      setCriteriaEditing(false);
      fetchCriteria();
      // Refresh all team remarks so the score table updates
      fetchAllRemarks();
    } catch (err) {
      console.error("Criteria save error:", err);
    } finally {
      setCriteriaSaving(false);
    }
  };

  // ── Per-team remark helpers ──────────────────────────
  const fetchAllRemarks = useCallback(() => {
    if (!selectedHackathon) return;
    axios.get(`/api/remarks/scores?hackathon=${selectedHackathon}`).then((res) => {
      const map = {};
      (res.data || []).forEach((r) => {
        const tid = r.team?._id || r.team;
        map[tid] = r;
      });
      setTeamRemarks(map);
    });
  }, [selectedHackathon]);

  // Fetch all remarks when hackathon or criteria change
  useEffect(() => {
    if (scoringSections.length > 0) fetchAllRemarks();
  }, [scoringSections, fetchAllRemarks]);

  const fetchRemark = useCallback((teamId) => {
    axios.get(`/api/remarks/scores/team/${teamId}`).then((res) => {
      if (res.data) {
        setTeamRemarks((prev) => ({ ...prev, [teamId]: res.data }));
      } else {
        // Initialize empty remark from current criteria
        setTeamRemarks((prev) => ({
          ...prev,
          [teamId]: {
            scores: scoringSections.map((s) => ({ sectionName: s.name, maxMarks: s.maxMarks, marks: 0 })),
            finalVerdict: "Pending",
            notes: "",
          },
        }));
      }
    });
  }, [scoringSections]);

  const handleScoreChange = (teamId, sectionName, marks) => {
    setTeamRemarks((prev) => {
      const remark = { ...(prev[teamId] || {}) };
      // Initialize scores from criteria if not yet set
      const currentScores =
        remark.scores && remark.scores.length > 0
          ? remark.scores
          : scoringSections.map((s) => ({
              sectionName: s.name,
              maxMarks: s.maxMarks,
              marks: 0,
            }));
      remark.scores = currentScores.map((s) =>
        s.sectionName === sectionName
          ? { ...s, marks: Math.min(Number(marks) || 0, s.maxMarks) }
          : s
      );
      return { ...prev, [teamId]: remark };
    });
  };

  const handleVerdictChange = (teamId, verdict) => {
    setTeamRemarks((prev) => ({
      ...prev,
      [teamId]: { ...(prev[teamId] || {}), finalVerdict: verdict },
    }));
  };

  const handleNotesChange = (teamId, notes) => {
    setTeamRemarks((prev) => ({
      ...prev,
      [teamId]: { ...(prev[teamId] || {}), notes },
    }));
  };

  const handleRemarkSave = async (teamId) => {
    const remark = teamRemarks[teamId];
    if (!remark) return;
    setRemarkSaving(true);
    setRemarkSavingTeam(teamId);
    try {
      await axios.put("/api/remarks/scores", {
        hackathon: selectedHackathon,
        team: teamId,
        scores: remark.scores,
        finalVerdict: remark.finalVerdict,
        notes: remark.notes,
      });
      fetchRemark(teamId);
    } catch (err) {
      console.error("Remark save error:", err);
    } finally {
      setRemarkSaving(false);
      setRemarkSavingTeam(null);
    }
  };

  // ── Task helpers ─────────────────────────────────
  const fetchTasks = useCallback((teamId) => {
    axios.get(`/api/tasks?team=${teamId}`).then((res) => {
      setTeamTasks((prev) => ({ ...prev, [teamId]: res.data }));
    });
  }, []);

  const handleAddTask = async (teamId) => {
    if (!newTaskTitle.trim() || !selectedHackathon) return;
    setTaskSaving(true);
    try {
      await axios.post("/api/tasks", {
        team: teamId,
        hackathon: selectedHackathon,
        title: newTaskTitle.trim(),
      });
      setNewTaskTitle("");
      fetchTasks(teamId);
    } catch (err) {
      console.error("Add task error:", err);
    } finally {
      setTaskSaving(false);
    }
  };

  const handleToggleTask = async (taskId, teamId) => {
    try {
      await axios.patch(`/api/tasks/${taskId}/toggle`);
      fetchTasks(teamId);
    } catch (err) {
      console.error("Toggle task error:", err);
    }
  };

  const handleDeleteTask = async (taskId, teamId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      fetchTasks(teamId);
    } catch (err) {
      console.error("Delete task error:", err);
    }
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

  // Deep analysis handler
  const handleDeepSync = async () => {
    if (!selectedHackathon || deepSyncing) return;
    setDeepSyncing(true);
    setDeepSyncResult(null);
    try {
      const { data } = await axios.post(
        `/api/sync/hackathon/${selectedHackathon}/deep`
      );
      setDeepSyncResult(data.results);
      // Refresh dashboard data so updated file details are visible in analysis
      fetchData(false);
    } catch (err) {
      console.error("Deep sync error:", err);
      setDeepSyncResult({ error: err.response?.data?.error || err.message });
    } finally {
      setDeepSyncing(false);
    }
  };

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
          {/* ── Deep Analysis Button ───────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <button
              onClick={handleDeepSync}
              disabled={deepSyncing}
              style={{
                background: deepSyncing ? "#21262d" : "#8b5cf6",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                cursor: deepSyncing ? "wait" : "pointer",
                fontWeight: 700,
                fontSize: "0.85rem",
                opacity: deepSyncing ? 0.7 : 1,
                transition: "all 0.2s",
              }}
            >
              {deepSyncing ? "⏳ Running Deep Analysis…" : "🔬 Run Deep Analysis"}
            </button>
            <span style={{ fontSize: "0.78rem", color: "#484f58" }}>
              Fetches per-commit file details for padding &amp; dump detection
            </span>
            {deepSyncResult && !deepSyncResult.error && (
              <span style={{ fontSize: "0.78rem", color: "#52c41a", fontWeight: 600 }}>
                ✓ Deep analysis complete —{" "}
                {Object.values(deepSyncResult).reduce((s, r) => s + (r.enriched || 0), 0)} commits enriched
              </span>
            )}
            {deepSyncResult?.error && (
              <span style={{ fontSize: "0.78rem", color: "#f85149" }}>
                Error: {deepSyncResult.error}
              </span>
            )}
          </div>
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
                    onClick={async () => {
                      // Helper: try browser geolocation first
                      const tryBrowserGeo = () =>
                        new Promise((resolve, reject) => {
                          if (!navigator.geolocation) return reject(new Error("unsupported"));
                          navigator.geolocation.getCurrentPosition(
                            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                            (err) => reject(err),
                            { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
                          );
                        });

                      // Helper: IP-based fallback via backend
                      const tryIpGeo = async () => {
                        const res = await axios.get("/api/geolocation");
                        return { lat: res.data.latitude, lng: res.data.longitude };
                      };

                      try {
                        const loc = await tryBrowserGeo();
                        setVenueLat(loc.lat);
                        setVenueLng(loc.lng);
                      } catch {
                        // Browser geolocation failed — try IP fallback
                        try {
                          const loc = await tryIpGeo();
                          setVenueLat(loc.lat);
                          setVenueLng(loc.lng);
                        } catch {
                          alert(
                            "Could not get your location.\n\n" +
                            "Please ensure location services are enabled in your browser settings, " +
                            "or enter the coordinates manually."
                          );
                        }
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

          {/* ── Scoring & Remarks (unified) ─────────── */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <h2 className="section-title" style={{ margin: 0 }}>
                Scoring &amp; Remarks
              </h2>
              <button
                onClick={criteriaEditing ? () => setCriteriaEditing(false) : handleCriteriaEdit}
                style={{
                  background: criteriaEditing ? "none" : "#238636",
                  border: criteriaEditing ? "1px solid #30363d" : "none",
                  color: criteriaEditing ? "#58a6ff" : "#fff",
                  borderRadius: 6,
                  padding: "4px 14px",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                }}
              >
                {criteriaEditing ? "Cancel" : scoringSections.length > 0 ? "✎ Edit Sections" : "+ Add Sections"}
              </button>
            </div>

            {/* ── Section editor (inline) ──────────── */}
            {criteriaEditing && (
              <div
                style={{
                  background: "#0d1117",
                  border: "1px solid #21262d",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: "0.78rem", color: "#8b949e", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Define Sections &amp; Max Marks
                </div>
                {criteriaDraft.map((sec, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ color: "#484f58", fontSize: "0.8rem", width: 20, textAlign: "right" }}>{i + 1}.</span>
                    <input
                      type="text"
                      placeholder="Section name"
                      value={sec.name}
                      onChange={(e) => {
                        const copy = [...criteriaDraft];
                        copy[i] = { ...copy[i], name: e.target.value };
                        setCriteriaDraft(copy);
                      }}
                      style={{ ...inputStyle, flex: 1, minWidth: 120 }}
                    />
                    <span style={{ color: "#8b949e", fontSize: "0.78rem" }}>Max:</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="10"
                      value={sec.maxMarks}
                      onChange={(e) => {
                        const copy = [...criteriaDraft];
                        copy[i] = { ...copy[i], maxMarks: Number(e.target.value) || 1 };
                        setCriteriaDraft(copy);
                      }}
                      style={{ ...inputStyle, width: 60, textAlign: "center", fontWeight: 700 }}
                    />
                    <button
                      onClick={() => setCriteriaDraft(criteriaDraft.filter((_, j) => j !== i))}
                      style={{ background: "none", border: "none", color: "#f85149", cursor: "pointer", fontSize: "0.9rem", padding: "0 6px" }}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {criteriaDraft.length > 0 && (
                  <div style={{ textAlign: "right", fontSize: "0.82rem", color: "#52c41a", fontWeight: 600, margin: "4px 0 8px" }}>
                    Grand Total: {criteriaDraft.reduce((s, sc) => s + (Number(sc.maxMarks) || 0), 0)}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setCriteriaDraft([...criteriaDraft, { name: "", maxMarks: 10 }])}
                    style={{ background: "none", border: "1px solid #30363d", color: "#58a6ff", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: "0.82rem" }}
                  >
                    + Add Section
                  </button>
                  <button
                    onClick={handleCriteriaSave}
                    disabled={criteriaSaving || criteriaDraft.filter((s) => s.name.trim()).length === 0}
                    style={{ background: "#238636", color: "#fff", border: "none", borderRadius: 6, padding: "4px 14px", cursor: "pointer", fontWeight: 600, fontSize: "0.82rem", opacity: criteriaSaving ? 0.6 : 1 }}
                  >
                    {criteriaSaving ? "Saving…" : "Save Sections"}
                  </button>
                </div>
              </div>
            )}

            {/* ── No sections message ──────────────── */}
            {!criteriaEditing && scoringSections.length === 0 && (
              <p style={{ color: "#484f58", fontSize: "0.85rem", margin: "4px 0 0" }}>
                No scoring sections defined yet. Click &quot;+ Add Sections&quot; to get started.
              </p>
            )}

            {/* ── Scoring table (sections + scores + decisions) ── */}
            {scoringSections.length > 0 && overview?.teams?.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    fontSize: "0.85rem",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "10px 12px",
                          borderBottom: "2px solid #30363d",
                          color: "#8b949e",
                          fontWeight: 600,
                          position: "sticky",
                          left: 0,
                          background: "#161b22",
                          zIndex: 1,
                          minWidth: 140,
                        }}
                      >
                        Team
                      </th>
                      {scoringSections.map((sec, i) => (
                        <th
                          key={i}
                          style={{
                            textAlign: "center",
                            padding: "10px 12px",
                            borderBottom: "2px solid #30363d",
                            color: "#58a6ff",
                            fontWeight: 600,
                            minWidth: 110,
                          }}
                        >
                          <div>{sec.name}</div>
                          <div style={{ fontSize: "0.7rem", color: "#484f58", fontWeight: 400 }}>
                            max {sec.maxMarks}
                          </div>
                        </th>
                      ))}
                      <th style={{ textAlign: "center", padding: "10px 12px", borderBottom: "2px solid #30363d", color: "#52c41a", fontWeight: 700, minWidth: 80 }}>
                        Total
                        <div style={{ fontSize: "0.7rem", color: "#484f58", fontWeight: 400 }}>
                          max {scoringSections.reduce((s, sc) => s + sc.maxMarks, 0)}
                        </div>
                      </th>
                      <th style={{ textAlign: "center", padding: "10px 12px", borderBottom: "2px solid #30363d", color: "#8b949e", fontWeight: 600, minWidth: 150 }}>
                        Decision
                      </th>
                      <th style={{ textAlign: "center", padding: "10px 12px", borderBottom: "2px solid #30363d", color: "#8b949e", fontWeight: 600, minWidth: 180 }}>
                        Notes
                      </th>
                      <th style={{ padding: "10px 8px", borderBottom: "2px solid #30363d", minWidth: 70 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {overview.teams.map((t) => {
                      const scores =
                        teamRemarks[t.teamId]?.scores ||
                        scoringSections.map((s) => ({
                          sectionName: s.name,
                          maxMarks: s.maxMarks,
                          marks: 0,
                        }));
                      const total = scores.reduce((sum, sc) => sum + (sc.marks || 0), 0);
                      const maxTotal = scoringSections.reduce((sum, sc) => sum + sc.maxMarks, 0);
                      const pctTotal = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                      return (
                        <tr key={t.teamId} style={{ borderBottom: "1px solid #21262d" }}>
                          <td
                            style={{
                              padding: "10px 12px",
                              borderBottom: "1px solid #21262d",
                              fontWeight: 600,
                              color: "#c9d1d9",
                              position: "sticky",
                              left: 0,
                              background: "#161b22",
                              zIndex: 1,
                            }}
                          >
                            {t.teamName}
                          </td>
                          {scoringSections.map((sec, i) => {
                            const sc = scores.find((s) => s.sectionName === sec.name) || { marks: 0, maxMarks: sec.maxMarks };
                            const pct = sc.maxMarks > 0 ? (sc.marks / sc.maxMarks) * 100 : 0;
                            return (
                              <td key={i} style={{ padding: "8px 10px", borderBottom: "1px solid #21262d", textAlign: "center", verticalAlign: "middle" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                                  <input
                                    type="number"
                                    min="0"
                                    max={sec.maxMarks}
                                    value={sc.marks}
                                    onChange={(e) => handleScoreChange(t.teamId, sec.name, e.target.value)}
                                    style={{ ...inputStyle, width: 48, fontSize: "1rem", fontWeight: 700, textAlign: "center", padding: "5px 3px" }}
                                  />
                                  <span style={{ color: "#484f58", fontSize: "0.75rem" }}>/{sec.maxMarks}</span>
                                </div>
                                <div style={{ height: 3, borderRadius: 2, background: "#21262d", marginTop: 4, overflow: "hidden" }}>
                                  <div style={{ height: "100%", width: `${pct}%`, background: pct >= 70 ? "#238636" : pct >= 40 ? "#d29922" : "#f85149", borderRadius: 2, transition: "width 0.2s ease" }} />
                                </div>
                              </td>
                            );
                          })}
                          {/* Total */}
                          <td style={{ padding: "10px 12px", borderBottom: "1px solid #21262d", textAlign: "center", verticalAlign: "middle" }}>
                            <div style={{ fontWeight: 700, fontSize: "1.05rem", color: pctTotal >= 70 ? "#52c41a" : pctTotal >= 40 ? "#d29922" : "#f85149" }}>
                              {total}<span style={{ color: "#484f58", fontWeight: 400, fontSize: "0.75rem" }}>/{maxTotal}</span>
                            </div>
                            <div style={{ height: 3, borderRadius: 2, background: "#21262d", marginTop: 4, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pctTotal}%`, background: pctTotal >= 70 ? "#238636" : pctTotal >= 40 ? "#d29922" : "#f85149", borderRadius: 2, transition: "width 0.2s ease" }} />
                            </div>
                          </td>
                          {/* Decision */}
                          <td style={{ padding: "8px 10px", borderBottom: "1px solid #21262d", textAlign: "center" }}>
                            <select
                              value={teamRemarks[t.teamId]?.finalVerdict || "Pending"}
                              onChange={(e) => handleVerdictChange(t.teamId, e.target.value)}
                              style={{ ...inputStyle, width: 140, fontSize: "0.82rem" }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Winner">Winner</option>
                              <option value="Runner Up">Runner Up</option>
                              <option value="Honorable Mention">Honorable Mention</option>
                              <option value="Participated">Participated</option>
                              <option value="Disqualified">Disqualified</option>
                            </select>
                          </td>
                          {/* Notes */}
                          <td style={{ padding: "8px 10px", borderBottom: "1px solid #21262d" }}>
                            <input
                              type="text"
                              placeholder="Feedback…"
                              value={teamRemarks[t.teamId]?.notes || ""}
                              onChange={(e) => handleNotesChange(t.teamId, e.target.value)}
                              style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
                            />
                          </td>
                          {/* Save */}
                          <td style={{ padding: "8px 8px", borderBottom: "1px solid #21262d", textAlign: "center" }}>
                            <button
                              onClick={() => handleRemarkSave(t.teamId)}
                              disabled={remarkSaving && remarkSavingTeam === t.teamId}
                              style={{
                                background: "#238636",
                                color: "#fff",
                                border: "none",
                                borderRadius: 6,
                                padding: "5px 12px",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "0.78rem",
                                whiteSpace: "nowrap",
                                opacity: remarkSaving && remarkSavingTeam === t.teamId ? 0.6 : 1,
                              }}
                            >
                              {remarkSaving && remarkSavingTeam === t.teamId ? "Saving…" : "Save"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

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
                  <th>Repo Status</th>
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
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "0.78rem",
                              padding: "3px 10px",
                              borderRadius: 12,
                              background: `${t.integrity?.repoStatusColor || "#8b949e"}18`,
                              color: t.integrity?.repoStatusColor || "#8b949e",
                              letterSpacing: 0.3,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {(t.integrity?.repoStatus || "—").replace(/_/g, " ")}
                          </span>
                        </td>
                      </tr>
                      {expandedTeam === t.teamId && (
                        <tr key={`${t.teamId}-detail`}>
                          <td
                            colSpan={8}
                            style={{
                              padding: "16px 20px",
                              background: "#0d1117",
                            }}
                          >
                            <div className="team-detail-panel">
                              <IntegrityMeter integrity={t.integrity} />
                              <FlagsList flags={t.integrity?.flags} />
                            </div>

                            {/* ── Repo Status & Analysis ──────── */}
                            <RepoStatusPanel integrity={t.integrity} />

                            {/* ── Commit Frequency Curve ──────── */}
                            <CommitFrequencyCurve
                              frequencyCurve={t.integrity?.frequencyCurve}
                            />
                            {/* ── Tasks Section ───────────────── */}
                            <h3
                              style={{
                                margin: "16px 0 8px",
                                fontSize: "0.9rem",
                              }}
                            >
                              Target Tasks
                            </h3>
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                marginBottom: 12,
                                alignItems: "center",
                              }}
                            >
                              <input
                                type="text"
                                placeholder="Add a task for this team…"
                                value={newTaskTitle}
                                onChange={(e) =>
                                  setNewTaskTitle(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleAddTask(t.teamId);
                                }}
                                style={{
                                  ...inputStyle,
                                  width: 300,
                                  flex: "0 0 auto",
                                }}
                              />
                              <button
                                onClick={() =>
                                  handleAddTask(t.teamId)
                                }
                                disabled={
                                  taskSaving ||
                                  !newTaskTitle.trim()
                                }
                                style={{
                                  background: "#238636",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 6,
                                  padding: "6px 14px",
                                  cursor: "pointer",
                                  fontWeight: 600,
                                  fontSize: "0.85rem",
                                  opacity:
                                    taskSaving ||
                                    !newTaskTitle.trim()
                                      ? 0.5
                                      : 1,
                                }}
                              >
                                {taskSaving
                                  ? "Adding…"
                                  : "+ Add Task"}
                              </button>
                            </div>

                            {teamTasks[t.teamId]?.length > 0 ? (
                              <ul
                                style={{
                                  listStyle: "none",
                                  padding: 0,
                                  margin: 0,
                                }}
                              >
                                {teamTasks[t.teamId].map(
                                  (task) => (
                                    <li
                                      key={task._id}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        padding:
                                          "8px 12px",
                                        marginBottom: 4,
                                        borderRadius: 6,
                                        background:
                                          task.completed
                                            ? "rgba(82,196,26,0.08)"
                                            : "rgba(139,148,158,0.06)",
                                        border:
                                          "1px solid #21262d",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={
                                          task.completed
                                        }
                                        onChange={() =>
                                          handleToggleTask(
                                            task._id,
                                            t.teamId
                                          )
                                        }
                                        style={{
                                          width: 18,
                                          height: 18,
                                          cursor:
                                            "pointer",
                                          accentColor:
                                            "#238636",
                                        }}
                                      />
                                      <span
                                        style={{
                                          flex: 1,
                                          textDecoration:
                                            task.completed
                                              ? "line-through"
                                              : "none",
                                          color:
                                            task.completed
                                              ? "#52c41a"
                                              : "#c9d1d9",
                                        }}
                                      >
                                        {task.title}
                                      </span>
                                      {task.completed &&
                                        task.completedAt && (
                                          <span
                                            style={{
                                              fontSize:
                                                "0.72rem",
                                              color:
                                                "#484f58",
                                            }}
                                          >
                                            {new Date(
                                              task.completedAt
                                            ).toLocaleString()}
                                          </span>
                                        )}
                                      <button
                                        onClick={() =>
                                          handleDeleteTask(
                                            task._id,
                                            t.teamId
                                          )
                                        }
                                        title="Delete task"
                                        style={{
                                          background:
                                            "none",
                                          border: "none",
                                          color:
                                            "#f85149",
                                          cursor:
                                            "pointer",
                                          fontSize:
                                            "1rem",
                                          padding:
                                            "0 4px",
                                        }}
                                      >
                                        ✕
                                      </button>
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p
                                style={{
                                  color: "#484f58",
                                  fontSize: "0.85rem",
                                  margin: "4px 0 12px",
                                }}
                              >
                                No tasks assigned yet.
                              </p>
                            )}

                            {/* ── Remarks & Scoring ─────────── */}
                            {scoringSections.length > 0 && (
                              <>
                                <h3
                                  style={{
                                    margin: "16px 0 8px",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  Remarks &amp; Scoring
                                </h3>
                                <div
                                  style={{
                                    background: "#161b22",
                                    border: "1px solid #21262d",
                                    borderRadius: 8,
                                    padding: 14,
                                    marginBottom: 12,
                                  }}
                                >
                                  {/* Section score cards */}
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns:
                                        "repeat(auto-fill, minmax(180px, 1fr))",
                                      gap: 12,
                                      marginBottom: 14,
                                    }}
                                  >
                                    {(teamRemarks[t.teamId]?.scores ||
                                      scoringSections.map((s) => ({
                                        sectionName: s.name,
                                        maxMarks: s.maxMarks,
                                        marks: 0,
                                      }))
                                    ).map((sc, i) => {
                                      const pct =
                                        sc.maxMarks > 0
                                          ? (sc.marks / sc.maxMarks) * 100
                                          : 0;
                                      return (
                                        <div
                                          key={i}
                                          style={{
                                            background: "#0d1117",
                                            border: "1px solid #21262d",
                                            borderRadius: 10,
                                            padding: 14,
                                            textAlign: "center",
                                          }}
                                        >
                                          <div
                                            style={{
                                              fontSize: "0.82rem",
                                              fontWeight: 600,
                                              color: "#c9d1d9",
                                              marginBottom: 6,
                                            }}
                                          >
                                            {sc.sectionName}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: "0.7rem",
                                              color: "#484f58",
                                              marginBottom: 8,
                                            }}
                                          >
                                            Max: {sc.maxMarks}
                                          </div>
                                          {/* Marks input */}
                                          <div
                                            style={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              gap: 6,
                                              marginBottom: 8,
                                            }}
                                          >
                                            <input
                                              type="number"
                                              min="0"
                                              max={sc.maxMarks}
                                              value={sc.marks}
                                              onChange={(e) =>
                                                handleScoreChange(
                                                  t.teamId,
                                                  sc.sectionName,
                                                  e.target.value
                                                )
                                              }
                                              style={{
                                                ...inputStyle,
                                                width: 64,
                                                fontSize: "1.1rem",
                                                fontWeight: 700,
                                                textAlign: "center",
                                                padding: "8px 6px",
                                              }}
                                            />
                                            <span
                                              style={{
                                                color: "#484f58",
                                                fontSize: "0.9rem",
                                              }}
                                            >
                                              / {sc.maxMarks}
                                            </span>
                                          </div>
                                          {/* Mini progress bar */}
                                          <div
                                            style={{
                                              height: 4,
                                              borderRadius: 2,
                                              background: "#21262d",
                                              overflow: "hidden",
                                            }}
                                          >
                                            <div
                                              style={{
                                                height: "100%",
                                                width: `${pct}%`,
                                                background:
                                                  pct >= 70
                                                    ? "#238636"
                                                    : pct >= 40
                                                    ? "#d29922"
                                                    : "#f85149",
                                                borderRadius: 2,
                                                transition:
                                                  "width 0.25s ease",
                                              }}
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}

                                    {/* Total card */}
                                    <div
                                      style={{
                                        background:
                                          "rgba(88,166,255,0.06)",
                                        border:
                                          "1px solid rgba(88,166,255,0.25)",
                                        borderRadius: 10,
                                        padding: 14,
                                        textAlign: "center",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontSize: "0.82rem",
                                          fontWeight: 600,
                                          color: "#58a6ff",
                                          marginBottom: 6,
                                        }}
                                      >
                                        Total
                                      </div>
                                      <div
                                        style={{
                                          fontWeight: 700,
                                          color: "#58a6ff",
                                          fontSize: "1.4rem",
                                        }}
                                      >
                                        {(
                                          teamRemarks[t.teamId]
                                            ?.scores || []
                                        ).reduce(
                                          (s, sc) =>
                                            s + (sc.marks || 0),
                                          0
                                        )}
                                        <span
                                          style={{
                                            fontSize: "0.85rem",
                                            color: "#484f58",
                                            fontWeight: 400,
                                          }}
                                        >
                                          {" "}/{" "}
                                          {scoringSections.reduce(
                                            (s, sc) =>
                                              s + sc.maxMarks,
                                            0
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Final verdict + notes */}
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: 12,
                                      flexWrap: "wrap",
                                      alignItems: "flex-end",
                                      marginBottom: 10,
                                    }}
                                  >
                                    <div>
                                      <label
                                        style={{
                                          display: "block",
                                          fontSize: "0.75rem",
                                          color: "#8b949e",
                                          marginBottom: 3,
                                        }}
                                      >
                                        Final Decision
                                      </label>
                                      <select
                                        value={
                                          teamRemarks[t.teamId]
                                            ?.finalVerdict || "Pending"
                                        }
                                        onChange={(e) =>
                                          handleVerdictChange(
                                            t.teamId,
                                            e.target.value
                                          )
                                        }
                                        style={{
                                          ...inputStyle,
                                          width: 170,
                                        }}
                                      >
                                        <option value="Pending">
                                          Pending
                                        </option>
                                        <option value="Winner">
                                          Winner
                                        </option>
                                        <option value="Runner Up">
                                          Runner Up
                                        </option>
                                        <option value="Honorable Mention">
                                          Honorable Mention
                                        </option>
                                        <option value="Participated">
                                          Participated
                                        </option>
                                        <option value="Disqualified">
                                          Disqualified
                                        </option>
                                      </select>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                      <label
                                        style={{
                                          display: "block",
                                          fontSize: "0.75rem",
                                          color: "#8b949e",
                                          marginBottom: 3,
                                        }}
                                      >
                                        Notes / Feedback
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Optional feedback…"
                                        value={
                                          teamRemarks[t.teamId]?.notes || ""
                                        }
                                        onChange={(e) =>
                                          handleNotesChange(
                                            t.teamId,
                                            e.target.value
                                          )
                                        }
                                        style={{
                                          ...inputStyle,
                                          width: "100%",
                                        }}
                                      />
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleRemarkSave(t.teamId)
                                      }
                                      disabled={remarkSaving}
                                      style={{
                                        background: "#238636",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: 6,
                                        padding: "6px 16px",
                                        cursor: "pointer",
                                        fontWeight: 600,
                                        fontSize: "0.85rem",
                                        opacity: remarkSaving ? 0.6 : 1,
                                      }}
                                    >
                                      {remarkSaving
                                        ? "Saving…"
                                        : "Save Remarks"}
                                    </button>
                                  </div>

                                  {/* Saved verdict badge */}
                                  {teamRemarks[t.teamId]?.finalVerdict &&
                                    teamRemarks[t.teamId]?.finalVerdict !== "Pending" && (
                                      <div
                                        style={{
                                          marginTop: 6,
                                          padding: "6px 12px",
                                          borderRadius: 6,
                                          fontSize: "0.82rem",
                                          fontWeight: 600,
                                          background:
                                            teamRemarks[t.teamId]?.finalVerdict === "Winner"
                                              ? "rgba(82,196,26,0.12)"
                                              : teamRemarks[t.teamId]?.finalVerdict === "Disqualified"
                                              ? "rgba(248,81,73,0.12)"
                                              : "rgba(88,166,255,0.1)",
                                          color:
                                            teamRemarks[t.teamId]?.finalVerdict === "Winner"
                                              ? "#52c41a"
                                              : teamRemarks[t.teamId]?.finalVerdict === "Disqualified"
                                              ? "#f85149"
                                              : "#58a6ff",
                                        }}
                                      >
                                        Decision: {teamRemarks[t.teamId]?.finalVerdict}
                                        {teamRemarks[t.teamId]?.totalMarks != null && (
                                          <span style={{ marginLeft: 12, fontWeight: 400 }}>
                                            Score: {teamRemarks[t.teamId]?.totalMarks} / {teamRemarks[t.teamId]?.maxTotalMarks}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                </div>
                              </>
                            )}

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
