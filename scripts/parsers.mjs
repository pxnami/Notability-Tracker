import { load } from "cheerio";
import { marked } from "marked";
import { createHash } from "node:crypto";

const text = (value) =>
  load(String(value ?? ""))
    .text()
    .replace(/\s+/g, " ")
    .trim();
const idFor = (value) =>
  createHash("sha256").update(value).digest("hex").slice(0, 16);
export function parseBoard(html, checkedAt) {
  const $ = load(html);
  const script = $("script")
    .toArray()
    .map((node) => $(node).html() ?? "")
    .find((value) => value.trim().startsWith("window.pbData ="));
  if (!script) throw new Error("Productboard public data is missing");
  const data = JSON.parse(
    script
      .slice(script.indexOf("=") + 1)
      .trim()
      .replace(/;$/, ""),
  );
  if (
    !Array.isArray(data.portalCards) ||
    !Array.isArray(data.portalCardAssignments) ||
    !Array.isArray(data.portalTabs)
  )
    throw new Error("Productboard schema changed");
  const tabs = new Map(data.portalTabs.map((tab) => [tab.id, tab]));
  const features = data.portalCardAssignments.map((assignment) => {
    const card = data.portalCards.find(
      (card) => card.id === assignment.portalCardId,
    );
    const tab = tabs.get(assignment.portalTabId);
    if (!card || !tab)
      throw new Error("Productboard status assignment missing");
    return {
      id: `pb-${card.id}`,
      title: card.name,
      description: text(marked.parse(card.description ?? "")),
      roadmapStatus: tab.name,
      source: "productboard",
      ...(data.portals?.[0]?.displayVotesCounts
        ? { votes: card.portalVotesCount }
        : {}),
      updatedAt: card.updatedAt,
      checkedAt,
      url: `https://portal.productboard.com/gingerlabs/1-notability/c/${card.slug}`,
    };
  });
  const updates = (data.portalCardUpdates ?? [])
    .filter((update) => update.state === "posted")
    .flatMap((update) => {
      const feature = features.find(
        (feature) => feature.id === `pb-${update.portalCardId}`,
      );
      return feature
        ? [
            {
              id: `pb-update-${update.id}`,
              title: feature.title,
              summary: text(update.content),
              source_id: "productboard",
              url: feature.url,
              published_at: update.createdAt,
              updated_at: update.updatedAt,
              fetched_at: checkedAt,
              category: "Development update",
            },
          ]
        : [];
    });
  return { features, updates };
}

export function parseIssues(article, checkedAt) {
  const $ = load(article.body);
  const issues = [];
  let section = "";
  let current;
  $("body")
    .children()
    .each((_, node) => {
      const el = $(node);
      const value = text(el.html());
      if (/^h[1-6]$/.test(node.tagName)) {
        section = value;
        current = undefined;
        return;
      }
      if (!["Ongoing Issues", "Fixed Issues"].includes(section)) return;
      // Titles may share a paragraph with a workaround separated by line breaks.
      const bold = el
        .find("strong,b")
        .toArray()
        .map((node) => $(node).text())
        .join("")
        .replace(/\s+/g, " ")
        .trim();
      const inlineTitle =
        el.children().first().is("strong,b") &&
        el.find("br").length > 0 &&
        value.startsWith(bold);
      if (node.tagName === "p" && bold && (value === bold || inlineTitle)) {
        current = {
          id: `support-issue-${idFor(bold)}`,
          title: bold,
          summary: inlineTitle ? value.slice(bold.length).trim() : "",
          classification: "Bug report",
          officialStatus:
            section === "Fixed Issues" ? "Fixed" : "Officially Acknowledged",
          communityStatus: "Unknown",
          severity: "Unknown",
          platform: "Unknown",
          firstReported: "Unknown",
          lastUpdated: article.updated_at,
          sourceCount: 1,
          sourceIds: ["support"],
          officialEvidence: section,
          aiGenerated: false,
          url: article.html_url,
          checkedAt,
        };
        issues.push(current);
      } else if (current && value) {
        current.summary += `${current.summary ? "\n" : ""}${value}`;
        if (
          section === "Ongoing Issues" &&
          /currently investigating|actively looking into/i.test(value)
        )
          current.officialStatus = "Investigating";
        const version = value.match(/Fixed in (\d+(?:\.\d+)+)/i);
        if (version) current.version = version[1];
      }
    });
  if (!issues.length)
    throw new Error("Official issue document structure changed");
  return issues;
}

export function parseReleases(article, checkedAt) {
  const $ = load(article.body);
  const releases = [];
  $("h2").each((_, heading) => {
    const version = $(heading)
      .text()
      .match(/^New in (\d+(?:\.\d+)+)$/)?.[1];
    if (!version) return;
    const section = $(heading).nextUntil("h2");
    const bullets = section
      .find("li")
      .toArray()
      .map((node) => text($(node).html()));
    const notes = section
      .filter("p")
      .toArray()
      .map((node) => text($(node).html()))
      .filter((value) => value && !value.startsWith("Thank you"));
    releases.push({
      id: `ios-${version}`,
      version,
      releaseDate: "",
      highlights: [
        ...notes,
        ...bullets.filter((value) => !/^fixed\b/i.test(value)),
      ],
      fixes: bullets.filter((value) => /^fixed\b/i.test(value)),
      sourceUrl: `${article.html_url}#${$(heading).attr("id")}`,
      checkedAt,
      sourceUpdatedAt: article.updated_at,
    });
  });
  if (!releases.length)
    throw new Error("Official release document structure changed");
  return releases;
}
