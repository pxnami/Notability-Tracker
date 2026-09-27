import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { FeatureRequest, ReleaseNote, SourceSummary, TrackedIssue, SourceKind } from "../types";

export interface SourceRecord {
  id: string; title: string; source_id: SourceKind; url: string;
  published_at: string | null; fetched_at: string;
}
interface SourceRow { id: SourceKind; name: string; url: string; official: boolean; health: SourceSummary["health"]; last_successful_sync: string | null }
interface IssueRow { id: string; title: string; ai_summary: string | null; ai_classification: TrackedIssue["classification"]; official_status: TrackedIssue["officialStatus"]; community_status: TrackedIssue["communityStatus"]; severity: TrackedIssue["severity"]; platform: TrackedIssue["platform"]; app_version: string | null; first_reported_at: string | null; last_verified_at: string | null }
interface FeatureRow { id: string; title: string; description: string | null; source_id: SourceKind; roadmap_status: FeatureRequest["roadmapStatus"]; vote_count: number | null; source_url: string; last_verified_at: string | null }
interface ReleaseRow { id: string; version: string; release_date: string | null; new_features: string[]; improvements: string[]; fixed_bugs: string[]; source_url: string }
interface LinkRow { issue_id: string; source_record_id: string }
export interface LiveData { sources: SourceSummary[]; issues: TrackedIssue[]; features: FeatureRequest[]; releaseNotes: ReleaseNote[]; records: SourceRecord[] }
const Context = createContext<LiveData | null>(null);

export function safeUrl(value: string) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : "#"; }
  catch { return "#"; }
}

async function rows<T>(table: string, columns: string): Promise<T[]> {
  if (!supabase) throw new Error("Database connection is not configured.");
  const result: T[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from(table).select(columns).order(table === "issue_sources" ? "issue_id" : "id").range(offset, offset + 499);
    if (error) throw new Error(`Could not load ${table}. Please try again.`);
    result.push(...(data as unknown as T[]));
    if (data.length < 500) return result;
  }
}

export async function loadLiveData(): Promise<LiveData> {
  const [sources, issues, features, releases, records, links] = await Promise.all([
    rows<SourceRow>("sources", "id,name,url,official,health,last_successful_sync"),
    rows<IssueRow>("issues", "id,title,ai_summary,ai_classification,official_status,community_status,severity,platform,app_version,first_reported_at,last_verified_at"),
    rows<FeatureRow>("feature_requests", "id,title,description,source_id,roadmap_status,vote_count,source_url,last_verified_at"),
    rows<ReleaseRow>("release_notes", "id,version,release_date,new_features,improvements,fixed_bugs,source_url"),
    rows<SourceRecord>("source_records", "id,title,source_id,url,published_at,fetched_at"),
    rows<LinkRow>("issue_sources", "issue_id,source_record_id")
  ]);
  const recordSources = new Map(records.map(record => [record.id, record.source_id]));
  return {
    sources: sources.map(row => ({ id: row.id, name: row.name, url: safeUrl(row.url), official: row.official, health: row.health, lastSync: row.last_successful_sync ?? undefined, cadence: "", note: row.last_successful_sync ? `Last successful import: ${new Date(row.last_successful_sync).toLocaleString()}` : "No successful import yet." })),
    issues: issues.map(row => {
      const evidence = links.filter(link => link.issue_id === row.id);
      return { id: row.id, title: row.title, summary: row.ai_summary ?? "", classification: row.ai_classification, officialStatus: row.official_status, communityStatus: row.community_status, severity: row.severity, platform: row.platform, version: row.app_version ?? undefined, firstReported: row.first_reported_at ?? "Unknown", lastUpdated: row.last_verified_at ? new Date(row.last_verified_at).toLocaleDateString() : "Not verified", sourceCount: evidence.length, sourceIds: [...new Set(evidence.map(link => recordSources.get(link.source_record_id)).filter((id): id is SourceKind => Boolean(id)))], aiGenerated: Boolean(row.ai_summary) };
    }),
    features: features.map(row => ({ id: row.id, title: row.title, description: row.description ?? "", roadmapStatus: row.roadmap_status, source: row.source_id, votes: row.vote_count ?? undefined, communityInterest: 0, updatedAt: row.last_verified_at ?? "", url: safeUrl(row.source_url) })),
    releaseNotes: releases.map(row => ({ id: row.id, version: row.version, releaseDate: row.release_date ?? "Unknown", highlights: [...row.new_features, ...row.improvements], fixes: row.fixed_bugs, sourceUrl: safeUrl(row.source_url) })).sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)),
    records: records.map(row => ({ ...row, url: safeUrl(row.url) })).sort((a, b) => b.fetched_at.localeCompare(a.fetched_at) || a.title.localeCompare(b.title))
  };
}

export function LiveDataProvider({ children }: { children: ReactNode }) {
  const query = useQuery({ queryKey: ["tracker"], queryFn: loadLiveData, staleTime: 60000, retry: 1 });
  if (query.isPending) return <p role="status">Loading records...</p>;
  if (query.isError) return <div role="alert"><p>{query.error.message}</p><button className="mt-3 underline" onClick={() => void query.refetch()}>Try again</button></div>;
  return <Context.Provider value={query.data}>{children}</Context.Provider>;
}

export function useLiveData() {
  const data = useContext(Context);
  if (!data) throw new Error("LiveDataProvider is required");
  return data;
}
