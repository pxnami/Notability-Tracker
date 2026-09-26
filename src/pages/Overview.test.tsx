import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Overview } from "./Overview";

describe("Overview", () => {
  it("labels the app as unofficial", () => {
    render(<Overview />);
    expect(screen.getByText(/Unofficial community intelligence/i)).toBeInTheDocument();
  });
});
