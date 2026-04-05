import { describe, it, expect } from "vitest";
import type { Transaction } from "../../types";
import {
  sanitizeCsvCell,
  transactionsToCsv,
  transactionsToJson,
} from "../exportUtils";

const visibleTransactions: Transaction[] = [
  {
    id: "txn-001",
    date: "2026-03-10",
    amount: 1200,
    category: "salary",
    type: "income",
    description: "=SUM(A1:A2)",
  },
  {
    id: "txn-002",
    date: "2026-03-11",
    amount: 45.5,
    category: "food",
    type: "expense",
    description: 'Lunch "special"',
  },
];

describe("exportUtils", () => {
  it("creates CSV with deterministic header order", () => {
    const csv = transactionsToCsv(visibleTransactions);
    const header = csv.split("\n")[0];
    expect(header).toBe("date,description,category,type,amount");
  });

  it("preserves input ordering exactly in CSV output", () => {
    const csv = transactionsToCsv(visibleTransactions);
    const rows = csv.split("\n");

    expect(rows[1]).toContain(visibleTransactions[0].date);
    expect(rows[2]).toContain(visibleTransactions[1].date);
  });

  it("guards dangerous leading spreadsheet characters with apostrophe", () => {
    expect(sanitizeCsvCell("=SUM(A1:A2)").startsWith("'")).toBe(true);
    expect(sanitizeCsvCell("  =SUM(A1:A2)").startsWith("'")).toBe(true);
    expect(sanitizeCsvCell("+10").startsWith("'")).toBe(true);
    expect(sanitizeCsvCell("-12").startsWith("'")).toBe(true);
    expect(sanitizeCsvCell("@user").startsWith("'")).toBe(true);
    expect(sanitizeCsvCell("\tformula").startsWith("'")).toBe(true);
    expect(sanitizeCsvCell("\rformula").startsWith("'")).toBe(true);
  });

  it("escapes quotes inside CSV string cells", () => {
    expect(sanitizeCsvCell('Lunch "special"')).toContain('""');
  });

  it("serializes JSON preserving order and numeric amount type", () => {
    const json = transactionsToJson(visibleTransactions);
    const parsed = JSON.parse(json) as Transaction[];

    expect(parsed[0].id).toBe(visibleTransactions[0].id);
    expect(parsed[1].id).toBe(visibleTransactions[1].id);
    expect(typeof parsed[0].amount).toBe("number");
  });

  it("does not mutate input arrays", () => {
    const before = structuredClone(visibleTransactions);

    transactionsToCsv(visibleTransactions);
    transactionsToJson(visibleTransactions);

    expect(visibleTransactions).toEqual(before);
  });
});
