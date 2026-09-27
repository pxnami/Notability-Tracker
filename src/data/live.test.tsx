import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { LiveDataProvider, loadLiveData, safeUrl } from "./live";

const mock = vi.hoisted(() => ({ fail: false, pending: false }));
vi.mock("../lib/supabase", () => ({ supabase: { from: (table: string) => ({ select: () => ({ order: () => ({ range: async () => {
  if (mock.pending) return new Promise(() => {});
  if (mock.fail) return { data: null, error: { message: "denied" } };
  return { error: null, data: table === "source_records" ? [{ id: "1", title: "Real support article", source_id: "support", url: "https://support.gingerlabs.com/article", fetched_at: "2026-09-27T00:00:00Z", published_at: null }] : [] };
} }) }) }) } }));
beforeEach(() => { mock.fail = false; mock.pending = false; });

it("loads original articles without inventing bugs or features", async () => {
  const data = await loadLiveData();
  expect(data.records[0].title).toBe("Real support article");
  expect(data.issues).toEqual([]);
  expect(data.features).toEqual([]);
});
it("rejects unsafe source links", () => {
  expect(safeUrl("javascript:alert(1)")).toBe("#");
  expect(safeUrl("https://support.gingerlabs.com/")).toBe("https://support.gingerlabs.com/");
});
it("does not silently replace failed reads with empty or sample data", async () => {
  mock.fail = true;
  await expect(loadLiveData()).rejects.toThrow("Could not load");
});
it("shows loading without rendering misleading zero counts", () => {
  mock.pending = true;
  render(<QueryClientProvider client={new QueryClient()}><LiveDataProvider><p>Loaded content</p></LiveDataProvider></QueryClientProvider>);
  expect(screen.getByRole("status")).toHaveTextContent("Loading records");
  expect(screen.queryByText("Loaded content")).not.toBeInTheDocument();
});
