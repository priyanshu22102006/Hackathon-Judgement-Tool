/**
 * FlagsList – displays integrity flags/warnings.
 */
export default function FlagsList({ flags }) {
  if (!flags || flags.length === 0) return null;

  return (
    <div className="flags-list">
      <h3 className="flags-title">⚠ Integrity Flags</h3>
      <ul>
        {flags.map((f, i) => (
          <li key={i} className="flag-item">
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
