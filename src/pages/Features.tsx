import { useSearchParams } from "react-router-dom";
import { useLiveData } from "../data/live";
import { Badge } from "../components/ui/Badge";
import {
  Empty,
  ExportButton,
  PageHeading,
  Pagination,
  SaveButton,
  SearchBox,
  SourceLink,
} from "../components/TrackerUI";
import { useSaved } from "../lib/preferences";

export function Features() {
  const { features } = useLiveData();
  const { saved } = useSaved();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const status = params.get("status") ?? "All";
  const sort = params.get("sort") ?? "updated";
  function set(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  }
  const filtered = features
    .filter(
      (feature) =>
        (status === "All" || feature.roadmapStatus === status) &&
        (!params.get("saved") || saved.includes(feature.id)) &&
        `${feature.title} ${feature.description}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : b.updatedAt.localeCompare(a.updatedAt),
    );
  const pages = Math.max(1, Math.ceil(filtered.length / 18));
  const page = Math.min(
    pages - 1,
    Math.max(0, Number(params.get("page")) || 0),
  );
  return (
    <>
      <PageHeading
        eyebrow="THE FEATURE BOARD"
        title="Ideas worth following."
        description="The public Notability board, with its original statuses. Considering is not a promise."
        action={<ExportButton data={filtered} name="notability-features" />}
      />
      <div className="toolbar">
        <SearchBox
          value={search}
          onChange={(value) => set("q", value)}
          label="Search feature ideas"
        />
        <label className="select-label">
          Status
          <select
            value={status}
            onChange={(event) => set("status", event.target.value)}
          >
            {[
              "All",
              ...new Set(features.map((feature) => feature.roadmapStatus)),
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="select-label">
          Sort
          <select
            value={sort}
            onChange={(event) => set("sort", event.target.value)}
          >
            <option value="updated">Recently updated</option>
            <option value="title">Alphabetical</option>
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
      </div>
      <p className="result-count">{filtered.length} ideas</p>
      <div className="feature-grid">
        {filtered.slice(page * 18, page * 18 + 18).map((feature) => (
          <article className="feature-card" key={feature.id}>
            <div className="card-top">
              <Badge
                variant={
                  feature.roadmapStatus === "Launched" ? "green" : "blue"
                }
              >
                {feature.roadmapStatus}
              </Badge>
              <SaveButton id={feature.id} />
            </div>
            <h2>{feature.title}</h2>
            <p>
              {feature.description.slice(0, 200)}
              {feature.description.length > 200 ? "…" : ""}
            </p>
            {feature.description.length > 200 && (
              <details>
                <summary>Full description</summary>
                <p>{feature.description}</p>
              </details>
            )}
            <div className="card-bottom">
              <SourceLink href={feature.url}>View idea</SourceLink>
              {feature.votes !== undefined && (
                <span>{feature.votes} votes</span>
              )}
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && <Empty title="No matching ideas." />}
      <Pagination
        page={page}
        total={pages}
        onChange={(value) => set("page", String(value))}
      />
    </>
  );
}
