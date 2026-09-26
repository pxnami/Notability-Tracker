import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { features } from "../data/sample";

const columns = ["Requested", "Actively Considering", "Planned", "In Progress", "Released"] as const;

export function Roadmap() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Roadmap</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No AI prediction is promoted to official roadmap status.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-5">
        {columns.map((column) => (
          <Card key={column} className="min-h-64">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{column}</h2>
              <Badge>{features.filter((feature) => feature.roadmapStatus === column).length}</Badge>
            </div>
            <div className="space-y-3">
              {features.filter((feature) => feature.roadmapStatus === column).map((feature) => (
                <a key={feature.id} href={feature.url} className="block rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm transition hover:border-notability-200 dark:border-slate-800 dark:bg-slate-900">
                  <p className="font-medium">{feature.title}</p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{feature.source}</p>
                </a>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
