import TimeBadge from "./TimeBadge";
import LocationBadge from "./LocationBadge";

/**
 * CommitCard – renders a single commit row.
 */
export default function CommitCard({ commit }) {
  const date = new Date(commit.timestamp).toLocaleString();

  return (
    <li className="commit-item">
      <div>
        <div className="commit-msg">
          <a
            href={commit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="commit-hash"
          >
            {commit.commitHash?.slice(0, 7)}
          </a>{" "}
          {commit.message}
        </div>
        <div className="commit-meta">
          {commit.author} &middot; {date} &middot; {commit.branch}
        </div>
        {commit.filesChanged?.length > 0 && (
          <div className="files-list">
            {commit.filesChanged.map((f, i) => (
              <span key={i} className={f.status}>
                {f.status === "added"
                  ? "+"
                  : f.status === "removed"
                  ? "−"
                  : "~"}{" "}
                {f.filename}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="commit-badges">
        <TimeBadge valid={commit.timeValid} />
        <LocationBadge
          status={commit.locationStatus}
          city={commit.location?.city}
          country={commit.location?.country}
        />
      </div>
    </li>
  );
}
