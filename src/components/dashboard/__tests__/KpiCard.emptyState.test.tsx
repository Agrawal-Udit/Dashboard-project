import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCard } from "../KpiCard";

describe("KpiCard empty state", () => {
  it("renders emptyMessage when provided", () => {
    render(
      <KpiCard
        label="Total Balance"
        value={1234.56}
        icon={<span data-testid="icon" />}
        emptyMessage="No transaction data yet"
      />,
    );

    expect(screen.getByText("No transaction data yet")).toBeDefined();
  });

  it("suppresses normal currency emphasis when emptyMessage is present", () => {
    render(
      <KpiCard
        label="Total Balance"
        value={1234.56}
        icon={<span data-testid="icon" />}
        emptyMessage="No transaction data yet"
      />,
    );

    expect(screen.queryByText("₹1,234.56")).toBeNull();
  });
});
