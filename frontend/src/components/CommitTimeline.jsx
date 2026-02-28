import CommitCard from "./CommitCard";

/**
 * CommitTimeline – renders a list of commits.
 */
export default function CommitTimeline({ commits }) {
  if (!commits || commits.length === 0) {
    return <div className="empty">No commits yet.</div>;
  }

  return (
    <ul className="commit-list">
      {commits.map((c) => (
        <CommitCard key={c._id || c.commitHash} commit={c} />
      ))}
    </ul>
  );
}
