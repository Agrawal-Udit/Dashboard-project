import { beforeEach, describe, it, expect } from 'vitest'
import { useAppStore } from '../store'

describe('persist middleware — localStorage key', () => {
  it('uses the key finance-dashboard-store', () => {
    // Access the persist options via the store's persist API
    const persistOptions = (useAppStore as any).persist?.getOptions?.()
    expect(persistOptions?.name).toBe('finance-dashboard-store')
  })
})

describe('persist middleware — partialize', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('partialize includes role', () => {
    const persistOptions = (useAppStore as any).persist?.getOptions?.()
    const partial = persistOptions?.partialize?.(useAppStore.getState())
    expect(partial).toHaveProperty('role')
  })

  it('partialize includes darkMode', () => {
    const persistOptions = (useAppStore as any).persist?.getOptions?.()
    const partial = persistOptions?.partialize?.(useAppStore.getState())
    expect(partial).toHaveProperty('darkMode')
  })

  it('partialize excludes transactions', () => {
    const persistOptions = (useAppStore as any).persist?.getOptions?.()
    const partial = persistOptions?.partialize?.(useAppStore.getState())
    expect(partial).not.toHaveProperty('transactions')
  })

  it('partialize excludes action functions', () => {
    const persistOptions = (useAppStore as any).persist?.getOptions?.()
    const partial = persistOptions?.partialize?.(useAppStore.getState())
    const hasFunction = Object.values(partial ?? {}).some((v) => typeof v === 'function')
    expect(hasFunction).toBe(false)
  })
})

describe('persist middleware — migrate', () => {
  it('migrate from version 0 returns Viewer role and darkMode false', () => {
    const persistOptions = (useAppStore as any).persist?.getOptions?.()
    const result = persistOptions?.migrate?.({}, 0)
    expect(result).toEqual({ role: 'Viewer', darkMode: false })
  })

  it('migrate from version 1 returns persisted state unchanged', () => {
    const persistOptions = (useAppStore as any).persist?.getOptions?.()
    const persisted = { role: 'Admin', darkMode: true }
    const result = persistOptions?.migrate?.(persisted, 1)
    expect(result).toEqual(persisted)
  })
})
