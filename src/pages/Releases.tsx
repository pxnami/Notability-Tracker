import { useState } from "react";
import { useLiveData } from "../data/live";
import { Badge } from "../components/ui/Badge";
import {
  Empty,
  formatDate,
  PageHeading,
  SearchBox,
  SourceLink,
} from "../components/TrackerUI";
export function Releases() {
  const { releaseNotes } = useLiveData();
  const [search, setSearch] = useState("");
  const filtered = releaseNotes.filter((release) =>
    `${release.version} ${release.highlights.join(" ")} ${release.fixes.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="THE CHANGELOG"
        title="A little better, every release."
        description="Features, improvements and explicit fixes from Notability's iOS release notes."
      />
      <div className="toolbar">
        <SearchBox
          value={search}
          onChange={setSearch}
          label="Search versions and changes"
        />
        <span className="result-count">{filtered.length} versions</span>
      </div>
      <div className="release-list">
        {filtered.map((release) => (
          <article key={release.id} className="release">
            <div className="release-version">
              <Badge variant="blue">iOS</Badge>
              <h2>{release.version}</h2>
              <p>
                {release.releaseDate
                  ? formatDate(release.releaseDate)
                  : "Release date not provided"}
              </p>
              <SourceLink href={release.sourceUrl} />
            </div>
            <div className="release-body">
              {release.highlights.length > 0 && (
                <>
                  <h3>What's new & improved</h3>
                  <ul>
                    {release.highlights.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
              {release.fixes.length > 0 && (
                <>
                  <h3 className="fix-heading">Fixes</h3>
                  <ul>
                    {release.fixes.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
              <p className="muted small">
                Source document updated {formatDate(release.sourceUpdatedAt)} ·
                Checked {formatDate(release.checkedAt)}
              </p>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && <Empty title="No matching releases." />}
    </>
  );
}
