import { format, parseISO, isValid } from 'date-fns';

/**
 * Formats a number as a USD currency string.
 * Accepts null/undefined — both coerce to 0 via nullish coalescing (no throw).
 * Uses Intl.NumberFormat for correct locale formatting:
 *   - 0 → "$0.00"
 *   - -150 → "-$150.00"
 *   - 1234.56 → "$1,234.56"
 */
export function formatCurrency(amount: number | null | undefined): string {
  const value = amount ?? 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a date string or Date object using the given format string.
 * Returns "Invalid date" for null, undefined, unparseable strings, or invalid Date objects — never throws.
 * Uses date-fns parseISO for strings (parses as local time, NOT UTC — prevents timezone-shift bug
 * where "2026-01-15" would appear as January 14th in UTC-offset environments).
 *
 * @param date - ISO 8601 date string, Date object, null, or undefined
 * @param formatStr - date-fns format string (default: 'MMM d, yyyy')
 * @returns Formatted date string or "Invalid date" on failure
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatStr: string = 'MMM d, yyyy'
): string {
  if (!date) return 'Invalid date';
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    return format(parsed, formatStr);
  } catch {
    return 'Invalid date';
  }
}
