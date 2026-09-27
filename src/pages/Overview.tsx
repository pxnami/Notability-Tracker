import { Activity, Bug, CheckCircle2, GitPullRequestArrow, ShieldCheck, Sparkles } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useLiveData } from "../data/live";

export function Overview() {
  const { features, issues, releaseNotes, sources, records } = useLiveData();
  const activity = records.slice(0, 5).map(record => ({ ...record, official: sources.find(source => source.id === record.source_id)?.official ?? false, timestamp: record.fetched_at, category: record.source_id }));
  const stats = [
    { label: "Open bugs", value: issues.filter((issue) => !["Fixed", "Closed"].includes(issue.officialStatus)).length, icon: Bug },
    { label: "Officially confirmed", value: issues.filter((issue) => issue.officialStatus === "Officially Acknowledged").length, icon: ShieldCheck },
    { label: "In-progress fixes", value: issues.filter((issue) => issue.officialStatus === "In Progress").length, icon: GitPullRequestArrow },
    { label: "Resolved bugs", value: issues.filter((issue) => issue.officialStatus === "Fixed").length, icon: CheckCircle2 },
    { label: "Feature requests", value: features.length, icon: Sparkles },
    { label: "Imported articles", value: records.length, icon: Activity }
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-notability-700 dark:text-notability-100">Unofficial community intelligence</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Notability signals, separated by evidence</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Independent tracking of Notability updates and community reports.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-notability-50 text-notability-700 dark:bg-notability-500/15 dark:text-notability-100">
                <stat.icon size={22} />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recently Imported</h2>
            <a href="#/activity" className="text-sm underline">All articles</a>
          </div>
          <div className="space-y-4">
            {!activity.length && <p>No articles imported yet.</p>}
            {activity.map((item) => (
              <a key={item.id} href={item.url} className="block rounded-lg border border-slate-100 p-4 transition hover:border-notability-200 dark:border-slate-800 dark:hover:border-notability-700">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={item.official ? "blue" : "gray"}>{item.official ? "Official source" : "Community"}</Badge>
                  <Badge>{item.category}</Badge>
                </div>
                <p className="mt-3 font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Imported {new Date(item.timestamp).toLocaleString()}</p>
              </a>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-semibold">Source Health</h2>
          <div className="space-y-3">
            {!sources.length && <p>No sources connected yet.</p>}
            {sources.map((source) => (
              <div key={source.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                <div>
                  <p className="font-medium">{source.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{source.note}</p>
                </div>
                <Badge variant={source.health === "healthy" ? "green" : source.health === "failed" ? "red" : "amber"}>{source.health.replace("_", " ")}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="border-notability-100 bg-notability-50/60 dark:border-notability-500/20 dark:bg-notability-500/10">
        <p className="text-sm font-medium text-notability-700 dark:text-notability-100">Latest Release Notes</p>
        <p className="mt-2 font-semibold">{releaseNotes[0]?.version ?? "No structured release notes imported yet."}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{releaseNotes[0]?.highlights[0]}</p>
      </Card>
    </div>
  );
}
