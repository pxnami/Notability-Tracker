import { useLiveData } from "../data/live";
import { Badge } from "../components/ui/Badge";
import { Empty, PageHeading, SourceLink } from "../components/TrackerUI";
const ROADMAP_STAGE_ORDER = [
  "Actively Considering",
  "Prototyping / Experimenting",
  "Building",
  "Launched",
];
export function Roadmap() {
  const { features } = useLiveData();
  const columns = [
    ...new Set([
      ...ROADMAP_STAGE_ORDER,
      ...features.map((feature) => feature.roadmapStatus),
    ]),
  ];
  return (
    <>
      <PageHeading
        eyebrow="FROM IDEA TO REALITY"
        title="What's next for Notability?"
        description="Published stages from the official feature board. No predicted dates or inferred commitments."
      />
      {!features.length ? (
        <Empty title="No roadmap entries yet." />
      ) : (
        <div className="roadmap-board">
          {columns.map((status, index) => {
            const items = features.filter(
              (feature) => feature.roadmapStatus === status,
            );
            return (
              <section key={status} className="roadmap-column">
                <header className={`roadmap-title tone-${index % 4}`}>
                  <span className="eyebrow">0{index + 1}</span>
                  <h2>{status}</h2>
                  <span>{items.length} ideas</span>
                </header>
                <div>
                  {items.map((feature) => (
                    <article className="roadmap-item" key={feature.id}>
                      <h3>{feature.title}</h3>
                      <SourceLink href={feature.url}>View idea</SourceLink>
                    </article>
                  ))}
                  {!items.length && <Badge>No entries</Badge>}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
