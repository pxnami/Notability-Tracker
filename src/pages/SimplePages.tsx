import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useLiveData } from "../data/live";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export function Community() {
  return <Feed title="Community" communityOnly />;
}

export function ActivityFeed() {
  return <Feed title="Imported Articles" />;
}

function Feed({ title, communityOnly = false }: { title: string; communityOnly?: boolean }) {
  const { records, sources } = useLiveData();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const setSearch = (value: string) => setParams(value ? { q: value } : {}, { replace: true });
  const [page, setPage] = useState(0);
  const filtered = records.filter(record => (!communityOnly || ["reddit", "discord"].includes(record.source_id)) && record.title.toLowerCase().includes(search.toLowerCase()));
  const pageCount = Math.max(1, Math.ceil(filtered.length / 20));
  const currentPage = Math.min(page, pageCount - 1);
  const activity = filtered.slice(currentPage * 20, currentPage * 20 + 20);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{filtered.length} records</p>
      </div>
      <input aria-label="Search articles" className="w-full rounded-lg border border-slate-300 bg-transparent p-3" placeholder="Search articles" value={search} onChange={event => { setSearch(event.target.value); setPage(0); }} />
      {!filtered.length && <p>{search ? "No matching articles." : communityOnly ? "No community reports imported yet." : "No articles imported yet."}</p>}
      {activity.map((item) => (
        <Card key={item.id}>
          <div className="flex flex-wrap gap-2">
            <Badge variant={sources.find(source => source.id === item.source_id)?.official ? "blue" : "gray"}>{item.source_id}</Badge>
            <span className="text-xs text-slate-500">Imported {new Date(item.fetched_at).toLocaleString()}</span>
          </div>
          <p className="mt-3 font-medium">{item.title}</p>
          <a href={item.url} className="mt-3 inline-flex text-sm font-medium text-notability-700 dark:text-notability-100">Open source</a>
        </Card>
      ))}
      {pageCount > 1 && <div className="flex items-center justify-between gap-3"><button className="p-2 disabled:opacity-40" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} aria-label="Previous page">&larr;</button><span>{currentPage + 1} / {pageCount}</span><button className="p-2 disabled:opacity-40" disabled={currentPage + 1 === pageCount} onClick={() => setPage(currentPage + 1)} aria-label="Next page">&rarr;</button></div>}
    </div>
  );
}

export function Sources() {
  const { sources } = useLiveData();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Sources</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        {!sources.length && <p>No sources connected yet.</p>}
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
              <Badge variant={source.health === "healthy" ? "green" : source.health === "failed" ? "red" : "amber"}>{source.health.replace("_", " ")}</Badge>
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
          Public read-only access. Import administration is managed separately in Supabase.
        </p>
      </Card>
    </div>
  );
}
