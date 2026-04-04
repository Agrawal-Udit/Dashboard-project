import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { RoleGate } from '../RoleGate'
import { useAppStore } from '../../../store/store'

beforeEach(() => {
  useAppStore.setState(useAppStore.getInitialState(), true)
})

describe('RoleGate', () => {
  it('renders children when role is Admin and allowedRoles includes Admin', () => {
    useAppStore.setState({ role: 'Admin' })
    render(
      <RoleGate allowedRoles={['Admin']}>
        <span>secret</span>
      </RoleGate>
    )
    expect(screen.getByText('secret')).toBeDefined()
  })

  it('hides children when role is Viewer and allowedRoles only includes Admin', () => {
    // default role from getInitialState is Viewer
    render(
      <RoleGate allowedRoles={['Admin']}>
        <span>secret</span>
      </RoleGate>
    )
    expect(screen.queryByText('secret')).toBeNull()
  })

  it('shows children after role changes from Viewer to Admin', () => {
    const { rerender } = render(
      <RoleGate allowedRoles={['Admin']}>
        <span>secret</span>
      </RoleGate>
    )
    // Initially Viewer — should not see children
    expect(screen.queryByText('secret')).toBeNull()

    // Change role to Admin
    act(() => {
      useAppStore.setState({ role: 'Admin' })
    })

    // Re-render to pick up updated store state
    rerender(
      <RoleGate allowedRoles={['Admin']}>
        <span>secret</span>
      </RoleGate>
    )
    expect(screen.getByText('secret')).toBeDefined()
  })
})
