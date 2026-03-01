export default function FlagsList({ flags = [] }) {
  if (!flags.length) return null;

  return (
    <div style={{ flex: 1, minWidth: 240 }}>
      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#f85149", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <span>{"\u26A0"}</span> Integrity Flags
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {flags.map((flag, i) => (
          <li key={i} style={{
            padding: "8px 12px", marginBottom: 6,
            background: "rgba(248,81,73,0.08)", borderRadius: 6,
            fontSize: "0.82rem", color: "#f0a8a0",
            borderLeft: "3px solid #f85149",
          }}>
            {flag}
          </li>
        ))}
      </ul>
    </div>
  );
}
