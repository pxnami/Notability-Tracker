export type SourceKind =
  | "productboard"
  | "reddit"
  | "github"
  | "discord"
  | "support"
  | "release_notes"
  | "status"
  | "blog";

export type Classification =
  | "Bug report"
  | "Feature request"
  | "Official announcement"
  | "Release note"
  | "Service incident"
  | "Support response"
  | "General discussion";

export type IssueStatus =
  | "Reported"
  | "Community Confirmed"
  | "Officially Acknowledged"
  | "Investigating"
  | "In Progress"
  | "Fixed"
  | "Closed"
  | "Unknown";

export type SourceHealth = "healthy" | "stale" | "needs_auth" | "failed";

export interface SourceSummary {
  id: SourceKind;
  name: string;
  official: boolean;
  url: string;
  cadence: string;
  health: SourceHealth;
  lastSync?: string;
  note: string;
}

export interface TrackedIssue {
  id: string;
  title: string;
  summary: string;
  classification: Classification;
  officialStatus: IssueStatus;
  communityStatus: IssueStatus;
  severity: "Low" | "Medium" | "High" | "Critical" | "Unknown";
  platform: "iPadOS" | "iOS" | "macOS" | "Web" | "Unknown";
  version?: string;
  firstReported: string;
  lastUpdated: string;
  sourceCount: number;
  sourceIds: SourceKind[];
  officialEvidence?: string;
  aiGenerated: boolean;
  url?: string;
  checkedAt?: string;
}

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  roadmapStatus: string;
  source: SourceKind;
  votes?: number;
  updatedAt: string;
  url: string;
}

export interface ReleaseNote {
  id: string;
  version: string;
  releaseDate: string;
  highlights: string[];
  fixes: string[];
  sourceUrl: string;
  checkedAt?: string;
  sourceUpdatedAt?: string;
}
