import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Overview } from "./Overview";
import { MemoryRouter } from "react-router-dom";
vi.mock("../data/live", () => ({
  useLiveData: () => ({
    sources: [],
    issues: [],
    features: [],
    releaseNotes: [],
    records: [],
  }),
}));

describe("Overview", () => {
  it("labels the app as unofficial", () => {
    render(
      <MemoryRouter>
        <Overview />
      </MemoryRouter>,
    );
    expect(
      screen.getByText(/UNOFFICIAL NOTABILITY TRACKER/i),
    ).toBeInTheDocument();
    expect(screen.getByText("No articles imported yet.")).toBeInTheDocument();
    expect(screen.queryByText("Awaiting live sync")).not.toBeInTheDocument();
  });
});
