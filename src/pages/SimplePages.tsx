import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { activity, sources } from "../data/sample";

export function Community() {
  return <Feed title="Community" subtitle="Unified public community feed from Reddit, GitHub, Discord, and official discussions." />;
}

export function ActivityFeed() {
  return <Feed title="Activity Feed" subtitle="Connector, classification, status, and release activity in one audit-friendly stream." />;
}

function Feed({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      {activity.map((item) => (
        <Card key={item.id}>
          <div className="flex flex-wrap gap-2">
            <Badge variant={item.official ? "blue" : "gray"}>{item.source}</Badge>
            <Badge>{item.category}</Badge>
          </div>
          <p className="mt-3 font-medium">{item.title}</p>
          <a href={item.url} className="mt-3 inline-flex text-sm font-medium text-notability-700 dark:text-notability-100">Open source</a>
        </Card>
      ))}
    </div>
  );
}

export function Sources() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Sources</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        {sources.map((source) => (
          <Card key={source.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{source.name}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{source.note}</p>
              </div>
              <Badge variant={source.official ? "blue" : "gray"}>{source.official ? "Official" : "Community"}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="amber">{source.health.replace("_", " ")}</Badge>
              <Badge>{source.cadence}</Badge>
            </div>
            <a href={source.url} className="mt-4 inline-flex text-sm font-medium text-notability-700 dark:text-notability-100">Original source</a>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Card>
        <h2 className="font-semibold">Administration</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          The production admin dashboard is backed by Supabase Auth, row-level security, connector configuration, manual sync triggers, duplicate review, AI review, and audit logs.
          Configure credentials in Supabase secrets, never in the GitHub Pages frontend.
        </p>
      </Card>
    </div>
  );
}
