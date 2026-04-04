import { beforeEach, describe, it, expect } from 'vitest'
import { useAppStore } from '../store'

describe('uiSlice — initial state', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('initial role is Viewer', () => {
    expect(useAppStore.getState().role).toBe('Viewer')
  })

  it('initial darkMode is false', () => {
    expect(useAppStore.getState().darkMode).toBe(false)
  })
})

describe('uiSlice — setRole', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('changes role to Admin', () => {
    useAppStore.getState().setRole('Admin')
    expect(useAppStore.getState().role).toBe('Admin')
  })

  it('setting role does not affect darkMode', () => {
    useAppStore.getState().setRole('Admin')
    expect(useAppStore.getState().darkMode).toBe(false)
  })
})

describe('uiSlice — setDarkMode', () => {
  beforeEach(() => {
    useAppStore.setState(useAppStore.getInitialState(), true)
  })

  it('changes darkMode to true', () => {
    useAppStore.getState().setDarkMode(true)
    expect(useAppStore.getState().darkMode).toBe(true)
  })

  it('setting darkMode does not affect role', () => {
    useAppStore.getState().setDarkMode(true)
    expect(useAppStore.getState().role).toBe('Viewer')
  })
})
