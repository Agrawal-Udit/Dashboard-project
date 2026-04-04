import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SpendingPieChart } from '../SpendingPieChart'

describe('SpendingPieChart', () => {
  it('renders "No spending data" text when data prop is empty array', () => {
    render(<SpendingPieChart data={[]} />)
    expect(screen.getByText(/No spending data/i)).toBeDefined()
  })
})
