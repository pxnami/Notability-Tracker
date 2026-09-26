import type { ActivityItem, FeatureRequest, ReleaseNote, SourceSummary, TrackedIssue } from "../types";

export const sources: SourceSummary[] = [
  {
    id: "productboard",
    name: "Official Productboard",
    official: true,
    url: "https://portal.productboard.com/gingerlabs/1-notability/tabs/14-actively-considering",
    cadence: "Every 2 hours",
    health: "needs_auth",
    note: "Public page extraction is configured; private API access is optional."
  },
  {
    id: "reddit",
    name: "r/notabilityapp",
    official: false,
    url: "https://www.reddit.com/r/notabilityapp/",
    cadence: "Every 30 minutes",
    health: "needs_auth",
    note: "Requires Reddit app credentials for production sync."
  },
  {
    id: "github",
    name: "Ginger Labs GitHub",
    official: true,
    url: "https://github.com/ginger-labs",
    cadence: "Every 30 minutes",
    health: "needs_auth",
    note: "Discovers public repositories and filters for Notability relevance."
  },
  {
    id: "discord",
    name: "Notability Discord",
    official: true,
    url: "https://discord.com/",
    cadence: "Event-based",
    health: "needs_auth",
    note: "Requires an authorized bot token and configured channel IDs."
  },
  {
    id: "support",
    name: "Ginger Labs Support",
    official: true,
    url: "https://support.gingerlabs.com/",
    cadence: "Every 6 hours",
    health: "stale",
    note: "Crawler is ready for known issue and troubleshooting pages."
  },
  {
    id: "blog",
    name: "Notability Blog",
    official: true,
    url: "https://blog.notability.com/",
    cadence: "Every 6 hours",
    health: "stale",
    note: "RSS and public article discovery are supported."
  }
];

export const issues: TrackedIssue[] = [
  {
    id: "sync-duplicates",
    title: "Duplicate notes after cloud synchronization",
    summary: "Community reports describe duplicate note copies after sync conflicts. This sample is labeled as seeded data until live connectors are authorized.",
    classification: "Bug report",
    officialStatus: "Unknown",
    communityStatus: "Community Confirmed",
    severity: "High",
    platform: "iPadOS",
    version: "Unknown",
    firstReported: "2026-09-01",
    lastUpdated: "2026-09-18",
    sourceCount: 5,
    sourceIds: ["reddit", "support"],
    aiGenerated: true
  },
  {
    id: "audio-playback",
    title: "Audio playback position resets",
    summary: "Reports mention recordings restarting from the beginning after switching documents.",
    classification: "Bug report",
    officialStatus: "Reported",
    communityStatus: "Reported",
    severity: "Medium",
    platform: "iOS",
    firstReported: "2026-08-27",
    lastUpdated: "2026-09-12",
    sourceCount: 2,
    sourceIds: ["reddit"],
    aiGenerated: true
  }
];

export const features: FeatureRequest[] = [
  {
    id: "nested-folders",
    title: "Nested folder organization",
    description: "Allow deeper subject and divider hierarchies for large academic libraries.",
    roadmapStatus: "Actively Considering",
    source: "productboard",
    votes: 1284,
    communityInterest: 94,
    updatedAt: "2026-09-08",
    url: "https://portal.productboard.com/gingerlabs/1-notability/tabs/14-actively-considering"
  },
  {
    id: "collaboration",
    title: "Real-time collaborative editing",
    description: "Multi-user notebooks with presence, comments, and conflict-safe editing.",
    roadmapStatus: "Requested",
    source: "reddit",
    communityInterest: 82,
    updatedAt: "2026-08-30",
    url: "https://www.reddit.com/r/notabilityapp/"
  }
];

export const releaseNotes: ReleaseNote[] = [
  {
    id: "seed-release",
    version: "Awaiting live sync",
    releaseDate: "2026-09-26",
    highlights: ["Release-note connector is configured but needs authoritative source confirmation."],
    fixes: [],
    sourceUrl: "https://support.gingerlabs.com/"
  }
];

export const activity: ActivityItem[] = [
  {
    id: "a1",
    title: "Productboard roadmap source configured",
    source: "productboard",
    category: "Official announcement",
    timestamp: "2026-09-26T18:00:00Z",
    url: "https://portal.productboard.com/gingerlabs/1-notability/tabs/14-actively-considering",
    official: true
  },
  {
    id: "a2",
    title: "Reddit connector awaiting OAuth credentials",
    source: "reddit",
    category: "General discussion",
    timestamp: "2026-09-26T18:15:00Z",
    url: "https://www.reddit.com/r/notabilityapp/",
    official: false
  }
];
