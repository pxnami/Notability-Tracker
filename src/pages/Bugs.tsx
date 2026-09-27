import { useSearchParams } from "react-router-dom";
import { useLiveData } from "../data/live";
import { Badge } from "../components/ui/Badge";
import {
  Empty,
  ExportButton,
  formatDate,
  PageHeading,
  SaveButton,
  SearchBox,
  SourceLink,
} from "../components/TrackerUI";
import { useSaved } from "../lib/preferences";

export function Bugs() {
  const { issues, history = [] } = useLiveData();
  const [params, setParams] = useSearchParams();
  const { saved } = useSaved();
  const query = params.get("q") ?? "";
  const status = params.get("status") ?? "All";
  function set(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }
  const filtered = issues.filter(
    (issue) =>
      (status === "All" ||
        (status === "Open"
          ? !["Fixed", "Closed"].includes(issue.officialStatus)
          : issue.officialStatus === status)) &&
      (!params.has("saved") || saved.includes(issue.id)) &&
      `${issue.title} ${issue.summary}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="ISSUE TRACKER"
        title="Less mystery. More clarity."
        description="Known problems and documented fixes, with the original evidence close at hand."
        action={<ExportButton data={filtered} name="notability-issues" />}
      />
      <div className="toolbar">
        <SearchBox
          value={query}
          onChange={(value) => set("q", value)}
          label="Search bugs and fixes"
        />
        <label className="select-label">
          Status
          <select
            value={status}
            onChange={(event) => set("status", event.target.value)}
          >
            {[
              "All",
              "Open",
              ...new Set(issues.map((issue) => issue.officialStatus)),
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={params.has("saved")}
            onChange={(event) => set("saved", event.target.checked ? "1" : "")}
          />
          Saved only
        </label>
        <span className="result-count">{filtered.length} issues</span>
      </div>
      {!filtered.length && <Empty title="No matching issues." />}
      <div className="issue-list">
        {filtered.map((issue) => (
          <article className="issue-row" key={issue.id}>
            <div className="issue-number">
              {issue.officialStatus === "Fixed" ? "FIX" : "BUG"}
            </div>
            <div className="issue-content">
              <div className="row-meta">
                <Badge
                  variant={issue.officialStatus === "Fixed" ? "green" : "amber"}
                >
                  {issue.officialStatus}
                </Badge>
                {issue.version && <span>Version {issue.version}</span>}
                <span>
                  Checked {formatDate(issue.checkedAt ?? issue.lastUpdated)}
                </span>
              </div>
              <h2>{issue.title}</h2>
              <details open={params.get("item") === issue.id}>
                <summary>Evidence & details</summary>
                <p className="evidence-text">
                  {issue.summary || "No additional description supplied."}
                </p>
                {issue.aiGenerated && (
                  <p className="notice">
                    AI-generated summary; verify against the original source.
                  </p>
                )}
                <dl className="detail-grid">
                  <div>
                    <dt>Official status</dt>
                    <dd>{issue.officialStatus}</dd>
                  </div>
                  <div>
                    <dt>Platform</dt>
                    <dd>{issue.platform}</dd>
                  </div>
                  <div>
                    <dt>Source updated</dt>
                    <dd>{formatDate(issue.lastUpdated)}</dd>
                  </div>
                  <div>
                    <dt>Severity</dt>
                    <dd>
                      {issue.severity === "Unknown"
                        ? "Not specified"
                        : issue.severity}
                    </dd>
                  </div>
                </dl>
                {history
                  .filter((change) => change.targetId === issue.id)
                  .map((change) => (
                    <p key={change.id}>
                      {formatDate(change.observedAt)}: {change.previous} →{" "}
                      {change.current}
                    </p>
                  ))}
                {issue.url && (
                  <SourceLink href={issue.url}>
                    Verify on Notability Support
                  </SourceLink>
                )}
              </details>
            </div>
            <SaveButton id={issue.id} />
          </article>
        ))}
      </div>
    </>
  );
}
