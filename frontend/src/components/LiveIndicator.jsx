/**
 * LiveIndicator – shows a pulsing dot indicating live monitoring.
 */
export default function LiveIndicator({ lastUpdate }) {
  const timeStr = lastUpdate
    ? new Date(lastUpdate).toLocaleTimeString()
    : "—";

  return (
    <div className="live-indicator">
      <span className="live-dot" />
      <span className="live-text">Live monitoring</span>
      <span className="live-time">Last update: {timeStr}</span>
    </div>
  );
}
