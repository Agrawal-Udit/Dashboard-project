export type TransactionType = 'income' | 'expense';

export type Category =
  | 'housing'
  | 'food'
  | 'transport'
  | 'utilities'
  | 'entertainment'
  | 'healthcare'
  | 'education'
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'other';

export interface Transaction {
  id: string;
  date: string;         // ISO 8601: "YYYY-MM-DD" — string, NOT Date object (JSON.parse does not restore Date objects)
  amount: number;       // Always positive — type field determines whether added (income) or subtracted (expense)
  category: Category;
  type: TransactionType;
  description: string;
}

export interface SummaryTotals {
  balance: number;
  income: number;
  expenses: number;
}

export interface CategoryChartPoint {
  name: string;    // Category display label
  value: number;   // Total expense amount
  color: string;   // Hex color from CATEGORIES constant
}

export interface ChartDataPoint {
  date: string;       // Month label: "Jan 2026"
  income: number;
  expenses: number;
  balance: number;    // Cumulative running balance (not per-month net)
}
