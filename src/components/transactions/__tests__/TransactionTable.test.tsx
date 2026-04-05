import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TransactionTable } from "../TransactionTable";
import type { Transaction } from "../../../types";

const mockTxns: Transaction[] = [
  {
    id: "t1",
    date: "2026-01-10",
    amount: 100,
    category: "food",
    type: "expense",
    description: "Groceries",
  },
  {
    id: "t2",
    date: "2026-01-15",
    amount: 2000,
    category: "salary",
    type: "income",
    description: "Paycheck",
  },
];
const noop = vi.fn();

describe("TransactionTable", () => {
  it("renders a row for each transaction showing its description", () => {
    render(
      <TransactionTable
        transactions={mockTxns}
        sortBy="date"
        sortOrder="desc"
        onSort={noop}
        onEdit={noop}
      />,
    );
    expect(screen.getAllByText("Groceries").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Paycheck").length).toBeGreaterThan(0);
  });

  it("renders the empty state message when transactions array is empty", () => {
    render(
      <TransactionTable
        transactions={[]}
        sortBy="date"
        sortOrder="desc"
        onSort={noop}
        onEdit={noop}
      />,
    );
    expect(screen.getByText(/no transactions/i)).toBeDefined();
  });

  it("renders sort controls and calls onSort when date sort is clicked", () => {
    const onSort = vi.fn();

    render(
      <TransactionTable
        transactions={mockTxns}
        sortBy="date"
        sortOrder="desc"
        onSort={onSort}
        onEdit={noop}
      />,
    );

    const dateSortButtons = screen.getAllByRole("button", { name: /date/i });
    fireEvent.click(dateSortButtons[0]);

    expect(onSort).toHaveBeenCalledWith("date");
  });
});
