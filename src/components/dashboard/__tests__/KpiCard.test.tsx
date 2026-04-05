import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from '../KpiCard'

describe('KpiCard', () => {
  it('renders the label prop as text', () => {
    render(
      <KpiCard
        label="Total Balance"
        value={500}
        icon={<span data-testid="icon" />}
      />
    )
    expect(screen.getByText('Total Balance')).toBeDefined()
  })

  it('renders formatted currency value for 1234.56 as "₹1,234.56"', () => {
    render(
      <KpiCard
        label="Income"
        value={1234.56}
        icon={<span data-testid="icon" />}
      />
    )
    expect(screen.getByText('₹1,234.56')).toBeDefined()
  })

  it('renders "₹0.00" when value is 0', () => {
    render(
      <KpiCard
        label="Expenses"
        value={0}
        icon={<span data-testid="icon" />}
      />
    )
    expect(screen.getByText('₹0.00')).toBeDefined()
  })

  it('applies colorClass to the icon wrapper when provided', () => {
    const { container } = render(
      <KpiCard
        label="Balance"
        value={100}
        icon={<span data-testid="icon" />}
        colorClass="text-green-500"
      />
    )
    const iconWrapper = container.querySelector('.text-green-500')
    expect(iconWrapper).not.toBeNull()
  })
})
