import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'
import { Card } from '../Card'
import { Badge } from '../Badge'
import { Input } from '../Input'
import { Select } from '../Select'
import { Modal } from '../Modal'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('renders all four variants without crashing', () => {
    const { rerender } = render(<Button variant="primary">P</Button>)
    rerender(<Button variant="secondary">S</Button>)
    rerender(<Button variant="ghost">G</Button>)
    rerender(<Button variant="danger">D</Button>)
  })
})

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })
})

describe('Badge', () => {
  it('renders label text', () => {
    render(<Badge label="income" variant="income" />)
    expect(screen.getByText('income')).toBeInTheDocument()
  })
})

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Amount" id="amount" value="" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Amount')).toBeInTheDocument()
  })
})

describe('Select', () => {
  it('renders with label and options', () => {
    render(
      <Select label="Type" id="type" value="income" onChange={vi.fn()}>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </Select>
    )
    expect(screen.getByLabelText('Type')).toBeInTheDocument()
  })
})

describe('Modal', () => {
  it('renders children when open', () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal body</p>
      </Modal>
    )
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal body')).toBeInTheDocument()
  })

  it('does not render content when closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Test Modal">
        <p>Modal body</p>
      </Modal>
    )
    expect(screen.queryByText('Modal body')).not.toBeInTheDocument()
  })
})
