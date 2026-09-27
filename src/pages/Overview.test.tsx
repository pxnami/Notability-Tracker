import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Overview } from "./Overview";
vi.mock("../data/live", () => ({ useLiveData: () => ({ sources: [], issues: [], features: [], releaseNotes: [], records: [] }) }));

describe("Overview", () => {
  it("labels the app as unofficial", () => {
    render(<Overview />);
    expect(screen.getByText(/Unofficial community intelligence/i)).toBeInTheDocument();
    expect(screen.getByText("No articles imported yet.")).toBeInTheDocument();
    expect(screen.queryByText("Awaiting live sync")).not.toBeInTheDocument();
  });
});
