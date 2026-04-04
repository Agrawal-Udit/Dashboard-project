import { format, parseISO } from 'date-fns';
import type { Transaction, SummaryTotals, CategoryChartPoint, ChartDataPoint, Category } from '../types';
import { getCategoryMeta } from '../constants/categories';

/**
 * Sums all transactions into income, expenses, and balance totals.
 * balance === income - expenses (mathematical identity).
 * Returns {balance:0, income:0, expenses:0} for empty input.
 */
export function calcTotals(transactions: Transaction[]): SummaryTotals {
  return transactions.reduce<SummaryTotals>(
    (acc, t) => {
      if (t.type === 'income') {
        return { ...acc, income: acc.income + t.amount, balance: acc.balance + t.amount };
      }
      return { ...acc, expenses: acc.expenses + t.amount, balance: acc.balance - t.amount };
    },
    { balance: 0, income: 0, expenses: 0 }
  );
}

/**
 * Groups expense transactions by category.
 * Income transactions are intentionally excluded — this powers the spending breakdown chart only.
 * Returns CategoryChartPoint[] with name (display label), value (total amount), and color (hex).
 */
export function groupByCategory(transactions: Transaction[]): CategoryChartPoint[] {
  const expenseOnly = transactions.filter((t) => t.type === 'expense');
  const totals = new Map<string, number>();
  for (const t of expenseOnly) {
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }
  return Array.from(totals.entries()).map(([category, value]) => {
    const meta = getCategoryMeta(category as Category);
    return { name: meta.label, value, color: meta.color };
  });
}

/**
 * Groups transactions by month and returns an array of ChartDataPoint objects.
 * @returns ChartDataPoint[] grouped by month.
 * balance field is the per-month net (income - expenses for that month).
 * Cumulative balance across months is computed by the chart selector hook.
 * Every output object is guaranteed to have all four keys — Recharts crash prevention.
 */
export function formatChartData(transactions: Transaction[]): ChartDataPoint[] {
  if (transactions.length === 0) return [];

  const monthMap = new Map<string, { income: number; expenses: number; balance: number }>();

  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const t of sorted) {
    const monthKey = format(parseISO(t.date), 'yyyy-MM');
    const existing = monthMap.get(monthKey) ?? { income: 0, expenses: 0, balance: 0 };

    if (t.type === 'income') {
      monthMap.set(monthKey, {
        ...existing,
        income: existing.income + t.amount,
        balance: existing.balance + t.amount,
      });
    } else {
      monthMap.set(monthKey, {
        ...existing,
        expenses: existing.expenses + t.amount,
        balance: existing.balance - t.amount,
      });
    }
  }

  return Array.from(monthMap.entries()).map(([date, values]) => ({
    date,
    income: values.income,
    expenses: values.expenses,
    balance: values.balance,
  }));
}
