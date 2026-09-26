import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { features } from "../data/sample";

export function Features() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Feature Requests</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Productboard statuses are preserved exactly when available.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.id}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="blue">{feature.roadmapStatus}</Badge>
              <Badge>{feature.source}</Badge>
              {feature.votes ? <Badge variant="green">{feature.votes.toLocaleString()} votes</Badge> : null}
            </div>
            <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
            <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-2 rounded-full bg-notability-500" style={{ width: `${feature.communityInterest}%` }} />
            </div>
            <a className="mt-4 inline-flex text-sm font-medium text-notability-700 dark:text-notability-100" href={feature.url}>Original source</a>
          </Card>
        ))}
      </div>
    </div>
  );
}
