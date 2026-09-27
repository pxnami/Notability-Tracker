import { Card } from "../components/ui/Card";
import { useLiveData } from "../data/live";

export function Releases() {
  const { releaseNotes } = useLiveData();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Release Notes</h1>
      {!releaseNotes.length && <p>No structured release notes imported yet.</p>}
      {releaseNotes.map((release) => (
        <Card key={release.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{release.version}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{release.releaseDate}</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Highlights</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {release.highlights.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium">Fixes</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {release.fixes.length ? release.fixes.map((item) => <li key={item}>{item}</li>) : <li>No verified fixes linked yet.</li>}
              </ul>
            </div>
          </div>
          <a href={release.sourceUrl} className="mt-4 inline-flex text-sm font-medium text-notability-700 dark:text-notability-100">Original source</a>
        </Card>
      ))}
    </div>
  );
}
