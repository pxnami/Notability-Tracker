import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useLiveData } from "../data/live";

export function Features() {
  const { features } = useLiveData();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Feature Requests</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Productboard statuses are preserved exactly when available.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {!features.length && <p>No feature requests imported yet.</p>}
        {features.map((feature) => (
          <Card key={feature.id}>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="blue">{feature.roadmapStatus}</Badge>
              <Badge>{feature.source}</Badge>
              {feature.votes ? <Badge variant="green">{feature.votes.toLocaleString()} votes</Badge> : null}
            </div>
            <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.description}</p>
            <a className="mt-4 inline-flex text-sm font-medium text-notability-700 dark:text-notability-100" href={feature.url}>Original source</a>
          </Card>
        ))}
      </div>
    </div>
  );
}
