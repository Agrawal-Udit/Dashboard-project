import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

// Mock the store — ThemeSync reads darkMode from useAppStore
vi.mock('../../../store/store', () => ({
  useAppStore: vi.fn(),
}))

import { useAppStore } from '../../../store/store'
import { ThemeSync } from '../ThemeSync'

describe('ThemeSync', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    vi.clearAllMocks()
  })

  it('adds dark class to document.documentElement when darkMode is true', () => {
    vi.mocked(useAppStore).mockReturnValue(true as unknown as ReturnType<typeof useAppStore>)
    render(<ThemeSync />)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class from document.documentElement when darkMode is false', () => {
    document.documentElement.classList.add('dark')
    vi.mocked(useAppStore).mockReturnValue(false as unknown as ReturnType<typeof useAppStore>)
    render(<ThemeSync />)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('renders nothing (returns null)', () => {
    vi.mocked(useAppStore).mockReturnValue(false as unknown as ReturnType<typeof useAppStore>)
    const { container } = render(<ThemeSync />)
    expect(container.firstChild).toBeNull()
  })
})
