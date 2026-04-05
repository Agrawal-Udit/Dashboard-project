import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPage } from "../DashboardPage";
import { useSummaryTotals } from "../../hooks/useSummaryTotals";
import { useTransactions } from "../../hooks/useTransactions";
import { useAppStore } from "../../store/store";
import type { Transaction } from "../../types";

vi.mock("../../hooks/useSummaryTotals", () => ({
  useSummaryTotals: vi.fn(),
}));

vi.mock("../../hooks/useTransactions", () => ({
  useTransactions: vi.fn(),
}));

vi.mock("../../store/store", () => ({
  useAppStore: vi.fn(),
}));

vi.mock("../../components/dashboard/BalanceTrendChart", () => ({
  BalanceTrendChart: ({ data }: { data: unknown[] }) => (
    <div data-testid="balance-trend-chart">trend-{data.length}</div>
  ),
}));

vi.mock("../../components/dashboard/SpendingPieChart", () => ({
  SpendingPieChart: ({ data }: { data: unknown[] }) => (
    <div data-testid="spending-pie-chart">pie-{data.length}</div>
  ),
}));

const mockUseSummaryTotals = vi.mocked(useSummaryTotals);
const mockUseTransactions = vi.mocked(useTransactions);

function mockStoreUsername(username: string | null) {
  vi.mocked(useAppStore).mockImplementation((selector: unknown) => {
    const state = { username };
    if (typeof selector === "function") {
      return (selector as (s: typeof state) => unknown)(state);
    }
    return state;
  });
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders fallback username and dashboard empty states", () => {
    mockStoreUsername(null);
    mockUseSummaryTotals.mockReturnValue({
      balance: 0,
      income: 0,
      expenses: 0,
    });
    mockUseTransactions.mockReturnValue([]);

    render(<DashboardPage />);

    expect(
      screen.getByRole("heading", { name: /dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/welcome back, demo user/i)).toBeInTheDocument();
    expect(screen.getByText(/top spending: no expense data/i)).toBeInTheDocument();
    expect(
      screen.getByText(/no transactions yet. add one to get started/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/no transaction data yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no income data yet/i)).toBeInTheDocument();
    expect(screen.getByText(/no expense data yet/i)).toBeInTheDocument();
  });

  it("shows top spending and recent transactions for non-empty data", () => {
    const transactions: Transaction[] = [
      {
        id: "txn-1",
        date: "2026-03-20",
        amount: 1000,
        category: "salary",
        type: "income",
        description: "Monthly salary",
      },
      {
        id: "txn-2",
        date: "2026-03-19",
        amount: 120,
        category: "food",
        type: "expense",
        description: "Groceries",
      },
      {
        id: "txn-3",
        date: "2026-03-18",
        amount: 60,
        category: "transport",
        type: "expense",
        description: "Taxi",
      },
    ];

    mockStoreUsername("Riya");
    mockUseSummaryTotals.mockReturnValue({
      balance: 820,
      income: 1000,
      expenses: 180,
    });
    mockUseTransactions.mockReturnValue(transactions);

    render(<DashboardPage />);

    expect(screen.getByText(/welcome back, riya/i)).toBeInTheDocument();
    expect(
      screen.getByText(/top spending: food & dining \(₹120.00\)/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/latest 3/i)).toBeInTheDocument();
    expect(screen.getByText("Monthly salary")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Taxi")).toBeInTheDocument();
    expect(screen.getByText("+₹1,000.00")).toBeInTheDocument();
    expect(screen.getByText("-₹120.00")).toBeInTheDocument();
  });
});