import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate } from '../dateUtils'

describe('formatCurrency', () => {
  it('returns "₹0.00" for 0', () => {
    expect(formatCurrency(0)).toBe('₹0.00')
  })

  it('returns "-₹150.00" for -150', () => {
    expect(formatCurrency(-150)).toBe('-₹150.00')
  })

  it('returns "₹0.00" for null (no throw)', () => {
    expect(formatCurrency(null as unknown as number)).toBe('₹0.00')
  })

  it('returns "₹0.00" for undefined (no throw)', () => {
    expect(formatCurrency(undefined as unknown as number)).toBe('₹0.00')
  })

  it('returns "₹1,234.56" for 1234.56', () => {
    expect(formatCurrency(1234.56)).toBe('₹1,234.56')
  })
})

describe('formatDate', () => {
  it('returns "Invalid date" for null (no throw)', () => {
    expect(formatDate(null as unknown as string)).toBe('Invalid date')
  })

  it('returns "Invalid date" for undefined (no throw)', () => {
    expect(formatDate(undefined as unknown as string)).toBe('Invalid date')
  })

  it('returns "Invalid date" for "not-a-date" (no throw)', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date')
  })

  it('returns "Jan 15, 2026" for "2026-01-15"', () => {
    expect(formatDate('2026-01-15')).toBe('Jan 15, 2026')
  })

  it('returns "Jan 2026" for "2026-01-15" with "MMM yyyy" format', () => {
    expect(formatDate('2026-01-15', 'MMM yyyy')).toBe('Jan 2026')
  })
})
