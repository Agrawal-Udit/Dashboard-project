import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Transaction } from "../../../types";
import { TransactionExportActions } from "../TransactionExportActions";
import {
  transactionsToCsv,
  transactionsToJson,
  downloadTextFile,
} from "../../../utils/exportUtils";

vi.mock("../../../utils/exportUtils", () => ({
  transactionsToCsv: vi.fn(
    () =>
      "date,description,category,type,amount\n2026-03-10,test,salary,income,1200",
  ),
  transactionsToJson: vi.fn(() => '[{"id":"txn-001"}]'),
  downloadTextFile: vi.fn(),
}));

const visibleTransactions: Transaction[] = [
  {
    id: "txn-001",
    date: "2026-03-10",
    amount: 1200,
    category: "salary",
    type: "income",
    description: "Salary payment",
  },
];

describe("TransactionExportActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses visibleTransactions prop for CSV export", () => {
    render(
      <TransactionExportActions visibleTransactions={visibleTransactions} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /export csv/i }));

    expect(transactionsToCsv).toHaveBeenCalledWith(visibleTransactions);
  });

  it("uses visibleTransactions prop for JSON export", () => {
    render(
      <TransactionExportActions visibleTransactions={visibleTransactions} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /export json/i }));

    expect(transactionsToJson).toHaveBeenCalledWith(visibleTransactions);
  });

  it("calls downloader with correct mime types and extensions", () => {
    render(
      <TransactionExportActions visibleTransactions={visibleTransactions} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /export csv/i }));
    fireEvent.click(screen.getByRole("button", { name: /export json/i }));

    expect(downloadTextFile).toHaveBeenCalledWith(
      expect.stringMatching(/\.csv$/),
      expect.any(String),
      "text/csv;charset=utf-8",
    );

    expect(downloadTextFile).toHaveBeenCalledWith(
      expect.stringMatching(/\.json$/),
      expect.any(String),
      "application/json;charset=utf-8",
    );
  });
});
