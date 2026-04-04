import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BalanceTrendChart } from '../BalanceTrendChart'

describe('BalanceTrendChart', () => {
  it('renders "No transaction data" text when data prop is empty array', () => {
    render(<BalanceTrendChart data={[]} />)
    expect(screen.getByText(/No transaction data/i)).toBeDefined()
  })
})
