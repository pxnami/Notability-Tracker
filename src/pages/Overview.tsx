import { Link } from "react-router-dom";
import { useLiveData } from "../data/live";
import { Badge } from "../components/ui/Badge";
import { formatDate, SourceLink } from "../components/TrackerUI";
import { SfIcon, type SfIconName } from "../components/ui/SfIcon";

export function Overview() {
  const {
    issues,
    features,
    releaseNotes,
    sources,
    records,
    generatedAt,
    refresh,
    refreshing,
  } = useLiveData();
  const open = issues.filter(
    (issue) => !["Fixed", "Closed"].includes(issue.officialStatus),
  );
  const stats: Array<{
    label: string;
    value: number;
    icon: SfIconName;
    color: string;
    to: string;
    sub: string;
  }> = [
    {
      label: "Open issues",
      value: open.length,
      icon: "bug",
      color: "peach",
      to: "/bugs",
      sub: "From official support",
    },
    {
      label: "Fixed issues",
      value: issues.filter((issue) => issue.officialStatus === "Fixed").length,
      icon: "checked",
      color: "green",
      to: "/bugs?status=Fixed",
      sub: "Documented resolutions",
    },
    {
      label: "Feature ideas",
      value: features.length,
      icon: "sparkles",
      color: "blue",
      to: "/features",
      sub: "On the public feature board",
    },
    {
      label: "Being built",
      value: features.filter((feature) =>
        ["Building", "In Progress"].includes(feature.roadmapStatus),
      ).length,
      icon: "code-fork",
      color: "yellow",
      to: "/roadmap",
      sub: "As listed by Notability",
    },
  ];
  return (
    <>
      <header className="overview-heading">
        <p className="eyebrow">THE UNOFFICIAL NOTABILITY TRACKER</p>
        <h1>
          Notability Tracker<span className="blue-dot">.</span>
        </h1>
        <div className="intro-line">
          <p className="lede">The bugs. The fixes. The next big thing.</p>
          <button
            className="check-time"
            onClick={refresh}
            disabled={refreshing}
            title="Refresh data"
          >
            <SfIcon
              name="connection-sync"
              size={14}
              className={refreshing ? "spin" : ""}
            />
            Checked {formatDate(generatedAt ?? sources[0]?.lastSync)}
          </button>
        </div>
      </header>
      <div className="stats-grid">
        {stats.map((stat) => (
          <Link className={`stat ${stat.color}`} to={stat.to} key={stat.label}>
            <div className="stat-top">
              <SfIcon name={stat.icon} size={20} />
              <SfIcon name="long-arrow-right" size={18} />
            </div>
            <strong>{stat.value}</strong>
            <h2>{stat.label}</h2>
            <p>{stat.sub}</p>
          </Link>
        ))}
      </div>
      <div className="overview-columns">
        <section>
          <div className="section-heading">
            <h2>On our radar</h2>
            <Link to="/bugs">
              All issues <SfIcon name="long-arrow-right" size={16} />
            </Link>
          </div>
          {open.length ? (
            open.slice(0, 4).map((issue) => (
              <Link
                className="issue-preview"
                to={`/bugs?item=${issue.id}`}
                key={issue.id}
              >
                <Badge variant="amber">{issue.officialStatus}</Badge>
                <h3>{issue.title}</h3>
                <div>
                  <span>Official support</span>
                  <SfIcon name="long-arrow-right" size={18} />
                </div>
              </Link>
            ))
          ) : (
            <p className="muted">No open issues in the current sources.</p>
          )}
        </section>
        <aside className="overview-aside">
          <div className="section-heading">
            <h2>Fresh off the press</h2>
          </div>
          {releaseNotes[0] ? (
            <div className="latest-release">
              <p className="eyebrow">LATEST DOCUMENTED iOS VERSION</p>
              <h3>{releaseNotes[0].version}</h3>
              <ul>
                {[...releaseNotes[0].highlights, ...releaseNotes[0].fixes]
                  .slice(0, 3)
                  .map((line) => (
                    <li key={line}>{line}</li>
                  ))}
              </ul>
              <Link className="button" to="/releases">
                Read release notes
                <SfIcon name="long-arrow-right" size={17} />
              </Link>
            </div>
          ) : (
            <p>No releases imported yet.</p>
          )}
          <div className="section-heading source-heading">
            <h2>Connected, with context.</h2>
            <Link to="/sources">
              <SfIcon name="long-arrow-right" size={18} />
              <span className="sr-only">All sources</span>
            </Link>
          </div>
          <div className="source-list">
            {sources.map((source) => (
              <div key={source.id}>
                <span>
                  <i className={`status-dot ${source.health}`} />
                  {source.name}
                </span>
                <Badge
                  variant={source.health === "healthy" ? "green" : "amber"}
                >
                  {source.health === "healthy"
                    ? "Connected"
                    : source.health === "needs_auth"
                      ? "Not connected"
                      : source.health}
                </Badge>
              </div>
            ))}
          </div>
        </aside>
      </div>
      <section className="latest-articles">
        <div className="section-heading">
          <h2>The reading list</h2>
          <Link to="/activity">
            All {records.length} updates
            <SfIcon name="long-arrow-right" size={16} />
          </Link>
        </div>
        <div className="reading-grid">
          {records.slice(0, 3).map((record) => (
            <article key={record.id}>
              <p className="eyebrow">
                {record.source_id} /{" "}
                {formatDate(record.updated_at ?? record.published_at)}
              </p>
              <h3>{record.title}</h3>
              <SourceLink href={record.url} />
            </article>
          ))}
        </div>
        {!records.length && <p>No articles imported yet.</p>}
      </section>
    </>
  );
}
