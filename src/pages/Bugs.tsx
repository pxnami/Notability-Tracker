import { useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { useLiveData } from "../data/live";
import { searchIssues } from "../lib/normalize";

export function Bugs() {
  const { issues } = useLiveData();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => searchIssues(issues, query), [issues, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold">Bug Tracker</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Official status, community status, and AI classification stay separate.</p>
        </div>
        <input className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950" placeholder="Filter bugs" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Issue</th>
                <th className="px-4 py-3">Official</th>
                <th className="px-4 py-3">Community</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Sources</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {!filtered.length && <tr><td colSpan={7} className="p-6">{issues.length ? "No matching bugs." : "No bug reports imported yet."}</td></tr>}
              {filtered.map((issue) => (
                <tr key={issue.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-4">
                    <p className="font-medium">{issue.title}</p>
                    <p className="mt-1 max-w-xl text-slate-500 dark:text-slate-400">{issue.summary}</p>
                    {issue.aiGenerated && <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">AI-generated summary, pending human review</p>}
                  </td>
                  <td className="px-4 py-4"><Badge variant="blue">{issue.officialStatus}</Badge></td>
                  <td className="px-4 py-4"><Badge>{issue.communityStatus}</Badge></td>
                  <td className="px-4 py-4">{issue.severity}</td>
                  <td className="px-4 py-4">{issue.platform}</td>
                  <td className="px-4 py-4">{issue.sourceCount}</td>
                  <td className="px-4 py-4">{issue.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
