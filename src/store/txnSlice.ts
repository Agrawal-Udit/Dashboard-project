// src/store/txnSlice.ts
import type { StateCreator } from "zustand";
import type { Transaction } from "../types";
import { MOCK_TRANSACTIONS } from "../data/mockData";

// Forward-reference to avoid circular import. UiSlice is defined in ./uiSlice.ts
// TypeScript resolves type-only circular imports at compile time without runtime issues.
import type { UiSlice } from "./uiSlice";

export interface TxnSlice {
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  editTransaction: (
    id: string,
    updates: Partial<Omit<Transaction, "id">>,
  ) => void;
  deleteTransaction: (id: string) => void;
  resetTransactions: () => void;
}

// Middleware mutators tuple — immer innermost, persist outer (matches store.ts composition order)
type Mutators = [["zustand/immer", never], ["zustand/persist", unknown]];

export const createTxnSlice: StateCreator<
  TxnSlice & UiSlice,
  Mutators,
  [],
  TxnSlice
> = (set) => ({
  transactions: MOCK_TRANSACTIONS,

  addTransaction: (t) =>
    set((draft) => {
      draft.transactions.push(t);
    }),

  editTransaction: (id, updates) =>
    set((draft) => {
      const idx = draft.transactions.findIndex((t) => t.id === id);
      if (idx !== -1) {
        draft.transactions[idx] = { ...draft.transactions[idx], ...updates };
      }
    }),

  deleteTransaction: (id) =>
    set((draft) => {
      draft.transactions = draft.transactions.filter((t) => t.id !== id);
    }),

  resetTransactions: () =>
    set((draft) => {
      draft.transactions = [...MOCK_TRANSACTIONS];
    }),
});
