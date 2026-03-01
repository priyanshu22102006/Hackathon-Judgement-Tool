export default function LiveIndicator({ lastUpdate }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", color: "#8b949e" }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: lastUpdate ? "#52c41a" : "#484f58",
        display: "inline-block",
        animation: lastUpdate ? "pulse 2s infinite" : "none",
      }} />
      {lastUpdate ? (
        <>
          <span style={{ color: "#52c41a", fontWeight: 600 }}>Live monitoring</span>
          <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
        </>
      ) : (
        "Waiting\u2026"
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
