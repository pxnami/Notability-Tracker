import { Link, useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { useLiveData } from "../data/live";
import {
  Empty,
  ExportButton,
  formatDate,
  PageHeading,
  Pagination,
  SaveButton,
  SearchBox,
  SourceLink,
} from "../components/TrackerUI";
import { useSaved, useTheme } from "../lib/preferences";

export function Community() {
  return <Feed communityOnly />;
}
export function ActivityFeed() {
  return <Feed />;
}
function Feed({ communityOnly = false }: { communityOnly?: boolean }) {
  const {
    records,
    issues,
    features,
    releaseNotes,
    history = [],
  } = useLiveData();
  const { saved } = useSaved();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const source = params.get("source") ?? "all";
  function set(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  }
  const all = [
    ...records.map((record) => ({
      id: record.id,
      title: record.title,
      summary: record.summary ?? "",
      url: record.url,
      source: record.source_id as string,
      category: record.category ?? "Source article",
      date: record.updated_at ?? record.published_at ?? record.fetched_at,
    })),
    ...history.map((change) => ({
      id: change.id,
      title: change.title,
      summary: `${change.previous} → ${change.current}`,
      url: change.url,
      source: "status history",
      category: "Observed status change",
      date: change.observedAt,
    })),
    ...(query || params.get("saved")
      ? [
          ...issues.map((issue) => ({
            id: issue.id,
            title: issue.title,
            summary: issue.summary,
            url: `#/bugs?item=${issue.id}`,
            source: "issues",
            category: issue.officialStatus,
            date: issue.checkedAt ?? issue.lastUpdated,
          })),
          ...features.map((feature) => ({
            id: feature.id,
            title: feature.title,
            summary: feature.description,
            url: feature.url,
            source: "features",
            category: feature.roadmapStatus,
            date: feature.updatedAt,
          })),
          ...releaseNotes.map((release) => ({
            id: release.id,
            title: `Notability ${release.version}`,
            summary: [...release.highlights, ...release.fixes].join(" "),
            url: "#/releases",
            source: "releases",
            category: "Release notes",
            date: release.sourceUpdatedAt ?? release.releaseDate,
          })),
        ]
      : []),
  ]
    .filter(
      (item) =>
        (!communityOnly || ["reddit", "discord"].includes(item.source)) &&
        (source === "all" || item.source === source) &&
        (!params.get("saved") || saved.includes(item.id)) &&
        `${item.title} ${item.summary}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const pages = Math.max(1, Math.ceil(all.length / 15));
  const page = Math.min(
    pages - 1,
    Math.max(0, Number(params.get("page")) || 0),
  );
  return (
    <>
      <PageHeading
        eyebrow={communityOnly ? "COMMUNITY" : "THE UPDATE DESK"}
        title={communityOnly ? "From the community." : "Stay in the loop."}
        description={
          communityOnly
            ? "Community reports stay separate from official statements."
            : "Official articles, development notes and observed status changes."
        }
        action={<ExportButton data={all} name="notability-updates" />}
      />
      <div className="toolbar">
        <SearchBox
          label="Search everything"
          value={query}
          onChange={(value) => set("q", value)}
        />
        <label className="select-label">
          Source
          <select
            value={source}
            onChange={(event) => set("source", event.target.value)}
          >
            {[
              "all",
              "support",
              "productboard",
              "github",
              "reddit",
              "issues",
              "features",
              "releases",
              "status history",
            ].map((value) => (
              <option key={value} value={value}>
                {value === "all" ? "All sources" : value}
              </option>
            ))}
          </select>
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={Boolean(params.get("saved"))}
            onChange={(event) => set("saved", event.target.checked ? "1" : "")}
          />
          Saved only
        </label>
        <span className="result-count">{all.length} results</span>
      </div>
      {!all.length && (
        <Empty
          title={
            communityOnly
              ? "Community import is not connected."
              : "No matching updates."
          }
        >
          {communityOnly ? (
            <>
              Reddit API access is required.{" "}
              <Link to="/sources">View sources</Link>
            </>
          ) : (
            "Try another search or clear your filters."
          )}
        </Empty>
      )}
      <div className="feed-list">
        {all.slice(page * 15, page * 15 + 15).map((item) => (
          <article key={item.id} className="feed-row">
            <div className="feed-date">{formatDate(item.date)}</div>
            <div className="feed-content">
              <div className="row-meta">
                <Badge variant={item.source === "github" ? "gray" : "blue"}>
                  {item.source}
                </Badge>
                <span>{item.category}</span>
              </div>
              <h2>{item.title}</h2>
              {item.summary && (
                <p>
                  {item.summary.slice(0, 280)}
                  {item.summary.length > 280 ? "…" : ""}
                </p>
              )}
              {item.url.startsWith("#/") ? (
                <a className="source-link" href={item.url}>
                  View in tracker →
                </a>
              ) : (
                <SourceLink href={item.url} />
              )}
            </div>
            <SaveButton id={item.id} />
          </article>
        ))}
      </div>
      <Pagination
        page={page}
        total={pages}
        onChange={(value) => set("page", String(value))}
      />
    </>
  );
}

export function Sources() {
  const {
    sources,
    records,
    features,
    issues,
    generatedAt,
    refresh,
    refreshing,
  } = useLiveData();
  return (
    <>
      <PageHeading
        eyebrow="TRACE IT TO THE SOURCE"
        title="Evidence over guesswork."
        description="What is connected, when it was checked, and what each source can actually tell us."
        action={
          <button className="button" onClick={refresh} disabled={refreshing}>
            <RefreshCw size={17} className={refreshing ? "spin" : ""} />
            Refresh
          </button>
        }
      />
      <p className="muted small">
        Public collection runs every 6 hours. Last snapshot:{" "}
        {formatDate(generatedAt)}. Source checks are not publication dates.
      </p>
      <div className="sources-grid">
        {sources.map((source) => (
          <article className="source-card" key={source.id}>
            <div className="card-top">
              <span className="source-initial">
                {source.id.slice(0, 1).toUpperCase()}
              </span>
              <Badge
                variant={
                  source.health === "healthy"
                    ? "green"
                    : source.health === "failed"
                      ? "red"
                      : "amber"
                }
              >
                {source.health === "needs_auth"
                  ? "Not connected"
                  : source.health === "healthy"
                    ? "Connected"
                    : source.health}
              </Badge>
            </div>
            <h2>{source.name}</h2>
            <p>
              {source.id === "github"
                ? "Public, non-fork repositories with explicit Notability relevance. Repository activity is not evidence of app fixes."
                : source.id === "productboard"
                  ? "Published feature ideas and original board stages. No private roadmap or inferred deadlines."
                  : source.id === "support"
                    ? `${records.filter((record) => record.source_id === "support").length} articles and ${issues.filter((issue) => issue.sourceIds.includes("support")).length} documented issues from official support.`
                    : source.note}
            </p>
            <dl>
              <div>
                <dt>Scope</dt>
                <dd>
                  {source.official ? "Official public source" : "Community"}
                </dd>
              </div>
              <div>
                <dt>Last successful check</dt>
                <dd>{formatDate(source.lastSync)}</dd>
              </div>
              {source.id === "productboard" && (
                <div>
                  <dt>Ideas tracked</dt>
                  <dd>{features.length}</dd>
                </div>
              )}
            </dl>
            {source.health === "failed" && (
              <p role="status" className="notice">
                {source.note}
              </p>
            )}
            <SourceLink href={source.url} />
          </article>
        ))}
      </div>
      <section className="methodology">
        <h2>A few important distinctions.</h2>
        <div className="reading-grid">
          <div>
            <h3>Reported isn't fixed.</h3>
            <p>
              A problem only receives a fixed status when the source explicitly
              lists it as fixed.
            </p>
          </div>
          <div>
            <h3>Considering isn't promised.</h3>
            <p>
              Roadmap stages are copied from the public board. No delivery dates
              are invented.
            </p>
          </div>
          <div>
            <h3>A check isn't a change.</h3>
            <p>
              Status history begins with our first observation. Older history is
              not reconstructed.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
export function Settings() {
  const [theme, setTheme] = useTheme();
  const { saved, clear } = useSaved();
  const { refresh, refreshing, generatedAt } = useLiveData();
  return (
    <>
      <PageHeading
        eyebrow="MAKE YOURSELF AT HOME"
        title="Your tracker, your way."
      />
      <section className="settings-section">
        <div>
          <h2>Appearance</h2>
          <p>Choose a comfortable reading environment.</p>
        </div>
        <div className="segmented" role="group" aria-label="Appearance">
          <button
            aria-pressed={theme === "light"}
            onClick={() => setTheme("light")}
          >
            Light
          </button>
          <button
            aria-pressed={theme === "dark"}
            onClick={() => setTheme("dark")}
          >
            Dark
          </button>
        </div>
      </section>
      <section className="settings-section">
        <div>
          <h2>Saved items</h2>
          <p>{saved.length} bookmarks stored in this browser.</p>
        </div>
        <div className="inline-actions">
          <Link className="button" to="/activity?saved=1">
            View saved
          </Link>
          <button
            className="text-button"
            disabled={!saved.length}
            onClick={clear}
          >
            Clear bookmarks
          </button>
        </div>
      </section>
      <section className="settings-section">
        <div>
          <h2>Data freshness</h2>
          <p>
            Snapshot checked {formatDate(generatedAt)}. Reload the latest
            available data.
          </p>
        </div>
        <button className="button" onClick={refresh} disabled={refreshing}>
          <RefreshCw size={17} className={refreshing ? "spin" : ""} />
          Refresh data
        </button>
      </section>
      <section className="settings-section">
        <div>
          <h2>About this project</h2>
          <p>
            Independent and open source. No affiliation with Notability or
            Ginger Labs.
          </p>
        </div>
        <SourceLink href="https://github.com/pxnami/Notability-Tracker">
          View repository
        </SourceLink>
      </section>
    </>
  );
}
