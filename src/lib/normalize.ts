import type { IssueStatus, TrackedIssue } from "../types";

const officialOrder: IssueStatus[] = [
  "Unknown",
  "Reported",
  "Community Confirmed",
  "Officially Acknowledged",
  "Investigating",
  "In Progress",
  "Fixed",
  "Closed"
];

export function normalizeTitle(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function duplicateKey(title: string, platform = "Unknown") {
  return `${platform.toLowerCase()}::${normalizeTitle(title)}`;
}

export function canApplyOfficialStatus(current: IssueStatus, next: IssueStatus, hasEvidence: boolean) {
  if (!hasEvidence) return false;
  if (next === "Fixed" || next === "Closed") return hasEvidence;
  return officialOrder.indexOf(next) >= officialOrder.indexOf(current);
}

export function searchIssues(records: TrackedIssue[], query: string) {
  const needle = normalizeTitle(query);
  if (!needle) return records;
  return records.filter((issue) =>
    normalizeTitle(`${issue.title} ${issue.summary} ${issue.platform} ${issue.officialStatus}`).includes(needle)
  );
}
