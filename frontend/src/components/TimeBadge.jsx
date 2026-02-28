/**
 * TimeBadge – shows "Valid" / "Invalid" based on timeValid boolean.
 */
export default function TimeBadge({ valid }) {
  if (valid === null || valid === undefined) {
    return <span className="badge unknown">Unchecked</span>;
  }
  return valid ? (
    <span className="badge valid">Valid Time</span>
  ) : (
    <span className="badge invalid">Outside Window</span>
  );
}
