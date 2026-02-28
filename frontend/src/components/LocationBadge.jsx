/**
 * LocationBadge – shows on-site / outside / unknown.
 */
export default function LocationBadge({ status, city, country }) {
  const label =
    status === "on-site"
      ? `On-site${city ? ` (${city})` : ""}`
      : status === "outside"
      ? `Outside${city ? ` (${city}, ${country})` : ""}`
      : "Location Unknown";

  return <span className={`badge ${status || "unknown"}`}>{label}</span>;
}
