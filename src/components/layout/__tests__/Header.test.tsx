import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../../../store/store', () => ({
  useAppStore: vi.fn(),
}))

import { useAppStore } from '../../../store/store'
import { Header } from '../Header'

const mockSetRole = vi.fn()
const mockSetDarkMode = vi.fn()

function mockStore(overrides = {}) {
  vi.mocked(useAppStore).mockImplementation((selector: unknown) => {
    const state = {
      role: 'Viewer',
      darkMode: false,
      setRole: mockSetRole,
      setDarkMode: mockSetDarkMode,
      ...overrides,
    }
    if (typeof selector === 'function') return (selector as (s: typeof state) => unknown)(state)
    return state
  })
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore()
  })

  it('renders role switcher with Viewer and Admin options', () => {
    render(<MemoryRouter><Header onMenuClick={vi.fn()} /></MemoryRouter>)
    expect(screen.getByRole('combobox', { name: /switch role/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Viewer' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Admin' })).toBeInTheDocument()
  })

  it('shows disclaimer text near the role switcher', () => {
    render(<MemoryRouter><Header onMenuClick={vi.fn()} /></MemoryRouter>)
    expect(screen.getByText(/UI simulation — no backend authentication/i)).toBeInTheDocument()
  })

  it('calls setRole when role switcher changes', () => {
    render(<MemoryRouter><Header onMenuClick={vi.fn()} /></MemoryRouter>)
    fireEvent.change(screen.getByRole('combobox', { name: /switch role/i }), {
      target: { value: 'Admin' },
    })
    expect(mockSetRole).toHaveBeenCalledWith('Admin')
  })

  it('renders dark mode toggle button', () => {
    render(<MemoryRouter><Header onMenuClick={vi.fn()} /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /dark mode|light mode/i })).toBeInTheDocument()
  })

  it('calls setDarkMode when dark mode toggle is clicked', () => {
    render(<MemoryRouter><Header onMenuClick={vi.fn()} /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: /dark mode|light mode/i }))
    expect(mockSetDarkMode).toHaveBeenCalledWith(true)
  })
})
