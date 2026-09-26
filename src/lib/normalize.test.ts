import { describe, expect, it } from "vitest";
import { canApplyOfficialStatus, duplicateKey, searchIssues } from "./normalize";
import { issues } from "../data/sample";

describe("normalization", () => {
  it("creates stable duplicate keys", () => {
    expect(duplicateKey("Sync duplicates!", "iPadOS")).toBe("ipados::sync duplicates");
  });

  it("requires evidence for official status changes", () => {
    expect(canApplyOfficialStatus("Unknown", "Fixed", false)).toBe(false);
    expect(canApplyOfficialStatus("Unknown", "Fixed", true)).toBe(true);
  });

  it("searches issue content", () => {
    expect(searchIssues(issues, "audio")).toHaveLength(1);
  });
});
