import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parseBoard, parseIssues, parseReleases } from "./parsers.mjs";

const checkedAt = new Date().toISOString();
const output = new URL("../public/data/public-feed.json", import.meta.url);
let previous;
try {
  previous = JSON.parse(await readFile(output, "utf8"));
} catch {
  previous = {};
}
const feed = {
  generatedAt: checkedAt,
  sources: [],
  issues: [],
  features: [],
  releaseNotes: [],
  records: [],
  history: previous.history ?? [],
};
async function get(url, json = true) {
  const response = await fetch(url, {
    headers: {
      Accept: json ? "application/json" : "text/html",
      "User-Agent":
        "NotabilityTracker/1.0 (https://github.com/pxnami/Notability-Tracker)",
    },
    signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return json ? response.json() : response.text();
}
async function collect(id, name, url, action) {
  try {
    await action();
    feed.sources.push({
      id,
      name,
      url,
      official: true,
      health: "healthy",
      lastSync: checkedAt,
      cadence: "Every 6 hours",
      note: "Public source checked successfully.",
    });
  } catch (error) {
    console.error(`${id}: ${error.message}`);
    const old = previous.sources?.find((source) => source.id === id);
    feed.sources.push({
      id,
      name,
      url,
      official: true,
      health: "failed",
      lastSync: old?.lastSync,
      cadence: "Every 6 hours",
      note: `Latest check failed (${error.message}). Last successful records retained.`,
    });
    feed.records.push(
      ...(previous.records ?? []).filter((record) => record.source_id === id),
    );
    if (id === "support") {
      feed.issues = previous.issues ?? [];
      feed.releaseNotes = previous.releaseNotes ?? [];
    }
    if (id === "productboard") feed.features = previous.features ?? [];
  }
}
await collect(
  "support",
  "Notability Support",
  "https://support.gingerlabs.com/hc/en-us",
  async () => {
    const articles = [];
    let next =
      "https://support.gingerlabs.com/api/v2/help_center/en-us/articles.json?per_page=100";
    const visited = new Set();
    while (next) {
      const parsed = new URL(next);
      if (
        parsed.origin !== "https://support.gingerlabs.com" ||
        visited.has(next) ||
        visited.size >= 10
      )
        throw new Error("Invalid pagination");
      visited.add(next);
      const page = await get(next);
      if (!Array.isArray(page.articles))
        throw new Error("Article response changed");
      articles.push(...page.articles.filter((article) => !article.draft));
      next = page.next_page;
    }
    const issues = articles.find((article) => article.id === 360035063091);
    const releases = articles.find((article) => article.id === 9414165465882);
    if (!issues || !releases)
      throw new Error("Required official documents missing");
    const parsedIssues = parseIssues(issues, checkedAt);
    const parsedReleases = parseReleases(releases, checkedAt);
    feed.issues = parsedIssues;
    feed.releaseNotes = parsedReleases;
    feed.records.push(
      ...articles.map((article) => ({
        id: `support-${article.id}`,
        title: article.title,
        source_id: "support",
        url: article.html_url,
        published_at: article.created_at,
        updated_at: article.updated_at,
        fetched_at: checkedAt,
        category: "Support article",
      })),
    );
  },
);
await collect(
  "productboard",
  "Notability Feature Board",
  "https://portal.productboard.com/gingerlabs/1-notability/tabs/14-actively-considering",
  async () => {
    const board = parseBoard(
      await get(
        "https://portal.productboard.com/gingerlabs/1-notability/tabs/14-actively-considering",
        false,
      ),
      checkedAt,
    );
    feed.features = board.features;
    feed.records.push(...board.updates);
  },
);
await collect(
  "github",
  "Ginger Labs on GitHub",
  "https://github.com/Ginger-Labs",
  async () => {
    const repos = await get(
      "https://api.github.com/orgs/Ginger-Labs/repos?per_page=100",
    );
    if (!Array.isArray(repos)) throw new Error("Repository response changed");
    const relevant = repos.filter(
      (repo) =>
        !repo.fork && /notability/i.test(`${repo.name} ${repo.description}`),
    );
    feed.records.push(
      ...relevant.map((repo) => ({
        id: `github-${repo.id}`,
        title: repo.name,
        summary: repo.description,
        source_id: "github",
        url: repo.html_url,
        published_at: repo.created_at,
        updated_at: repo.pushed_at,
        fetched_at: checkedAt,
        category: "Public repository",
      })),
    );
  },
);
feed.sources.push({
  id: "reddit",
  name: "r/notabilityapp",
  url: "https://www.reddit.com/r/notabilityapp/",
  official: false,
  health: "needs_auth",
  cadence: "Not connected",
  note: "Reddit API access is not configured. Community reports are not being imported.",
});
for (const [key, status] of [
  ["issues", "officialStatus"],
  ["features", "roadmapStatus"],
]) {
  const old = new Map((previous[key] ?? []).map((row) => [row.id, row]));
  for (const row of feed[key]) {
    const before = old.get(row.id);
    if (before && before[status] !== row[status])
      feed.history.push({
        id: `${row.id}-${checkedAt}`,
        targetId: row.id,
        title: row.title,
        previous: before[status],
        current: row[status],
        observedAt: checkedAt,
        url: row.url,
      });
  }
}
feed.history = feed.history.slice(-500);
await mkdir(new URL("../public/data/", import.meta.url), { recursive: true });
await writeFile(output, JSON.stringify(feed, null, 2) + "\n");
console.log(
  JSON.stringify({
    issues: feed.issues.length,
    features: feed.features.length,
    releases: feed.releaseNotes.length,
    records: feed.records.length,
    sources: feed.sources.map((source) => `${source.id}:${source.health}`),
  }),
);
if (!feed.sources.some((source) => source.health === "healthy"))
  process.exitCode = 1;
