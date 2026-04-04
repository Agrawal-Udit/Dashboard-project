// src/store/uiSlice.ts
import type { StateCreator } from 'zustand'
import type { TxnSlice } from './txnSlice'

export type Role = 'Viewer' | 'Admin'

export interface UiSlice {
  role: Role
  darkMode: boolean
  setRole: (role: Role) => void
  setDarkMode: (dark: boolean) => void
}

// Middleware mutators tuple — must match the composition order in store.ts
type Mutators = [['zustand/immer', never], ['zustand/persist', unknown]]

export const createUiSlice: StateCreator<
  TxnSlice & UiSlice,
  Mutators,
  [],
  UiSlice
> = (set) => ({
  role: 'Viewer',
  darkMode: false,

  setRole: (role) =>
    set((draft) => {
      draft.role = role
    }),

  setDarkMode: (dark) =>
    set((draft) => {
      draft.darkMode = dark
    }),
})
