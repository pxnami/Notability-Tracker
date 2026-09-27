import { describe, expect, it } from "vitest";
import { parseBoard, parseIssues, parseReleases } from "./parsers.mjs";

describe("source evidence parsers", () => {
  it("keeps original board stages and respects hidden vote counts", () => {
    const data = {
      portalCards: [
        {
          id: "one",
          name: "Test idea",
          description: "**A real idea**",
          slug: "1-test",
          updatedAt: "2026-01-01",
          portalVotesCount: 100,
        },
      ],
      portalTabs: [{ id: "tab", name: "Prototyping / Experimenting" }],
      portalCardAssignments: [{ portalCardId: "one", portalTabId: "tab" }],
      portals: [{ displayVotesCounts: false }],
    };
    const result = parseBoard(
      `<script>window.pbData = ${JSON.stringify(data)};</script>`,
      "now",
    );
    expect(result.features[0].roadmapStatus).toBe(
      "Prototyping / Experimenting",
    );
    expect(result.features[0].description).toBe("A real idea");
    expect(result.features[0]).not.toHaveProperty("votes");
  });
  it("rejects a board without verifiable status assignments", () => {
    expect(() => parseBoard("<html></html>", "now")).toThrow();
  });
  it("separates inline workarounds from issue titles and never infers fixed status", () => {
    const article = {
      html_url: "https://support.gingerlabs.com/issue",
      updated_at: "2026-01-01",
      body: "<h3>Ongoing Issues</h3><p><strong>First issue</strong></p><p>Currently investigating.</p><p><strong>Second issue</strong><br><br>Try this workaround.</p><h3>Fixed Issues</h3><p><strong>Third issue</strong></p><p>Fixed in 16.1.</p>",
    };
    const result = parseIssues(article, "now");
    expect(result).toHaveLength(3);
    expect(result.map((row) => row.officialStatus)).toEqual([
      "Investigating",
      "Officially Acknowledged",
      "Fixed",
    ]);
    expect(result[1].summary).toBe("Try this workaround.");
    expect(result[2].version).toBe("16.1");
    expect(result[0].severity).toBe("Unknown");
  });
  it("only labels explicit fixes as fixes and does not invent release dates", () => {
    const article = {
      html_url: "https://support.gingerlabs.com/release",
      updated_at: "2026-01-01",
      body: '<h2 id="v">New in 16.1</h2><ul><li>New feature</li><li>Fixed a crash</li><li>General stability improvements</li></ul>',
    };
    const [release] = parseReleases(article, "now");
    expect(release.fixes).toEqual(["Fixed a crash"]);
    expect(release.highlights).toHaveLength(2);
    expect(release.releaseDate).toBe("");
    expect(release.sourceUrl).toContain("#v");
  });
});
