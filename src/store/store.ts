// src/store/store.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { createTxnSlice, type TxnSlice } from './txnSlice'
import { createUiSlice, type UiSlice } from './uiSlice'

export type AppState = TxnSlice & UiSlice

export const useAppStore = create<AppState>()(
  immer(
    persist(
      (...args) => ({
        ...createTxnSlice(...args),
        ...createUiSlice(...args),
      }),
      {
        name: 'finance-dashboard-store',
        version: 1,

        // ONLY persist scalar UI preferences.
        // Transactions are intentionally excluded — re-seeded from MOCK_TRANSACTIONS on load.
        // Action functions are excluded — functions cannot be JSON-serialized.
        partialize: (state): Pick<AppState, 'role' | 'darkMode'> => ({
          role: state.role,
          darkMode: state.darkMode,
        }),

        // migrate fires once when stored version < current version.
        // v0 had no role field — default both fields to safe initial values.
        migrate: (persistedState: unknown, version: number): Pick<AppState, 'role' | 'darkMode'> => {
          if (version === 0) {
            return { role: 'Viewer', darkMode: false }
          }
          return persistedState as Pick<AppState, 'role' | 'darkMode'>
        },
      }
    )
  )
)
