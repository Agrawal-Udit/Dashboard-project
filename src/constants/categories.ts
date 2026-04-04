import type { Category } from '../types';

export interface CategoryMeta {
  id: Category;
  label: string;
  color: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'housing',       label: 'Housing',        color: '#6366f1' },
  { id: 'food',          label: 'Food & Dining',  color: '#f59e0b' },
  { id: 'transport',     label: 'Transport',      color: '#10b981' },
  { id: 'utilities',     label: 'Utilities',      color: '#3b82f6' },
  { id: 'entertainment', label: 'Entertainment',  color: '#ec4899' },
  { id: 'healthcare',    label: 'Healthcare',     color: '#ef4444' },
  { id: 'education',     label: 'Education',      color: '#8b5cf6' },
  { id: 'salary',        label: 'Salary',         color: '#22c55e' },
  { id: 'freelance',     label: 'Freelance',      color: '#14b8a6' },
  { id: 'investment',    label: 'Investment',     color: '#f97316' },
  { id: 'other',         label: 'Other',          color: '#94a3b8' },
];

export const CATEGORY_MAP = new Map<Category, CategoryMeta>(
  CATEGORIES.map((c) => [c.id, c])
);

export const getCategoryMeta = (id: Category): CategoryMeta =>
  CATEGORY_MAP.get(id) ?? { id: 'other', label: 'Other', color: '#94a3b8' };
