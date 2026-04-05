// src/store/uiSlice.ts
import type { StateCreator } from "zustand";
import type { TxnSlice } from "./txnSlice";

export type Role = "Viewer" | "Admin";

export interface UiSlice {
  role: Role;
  darkMode: boolean;
  isAuthenticated: boolean;
  username: string | null;
  setRole: (role: Role) => void;
  setDarkMode: (dark: boolean) => void;
  login: (username: string, role: Role) => void;
  logout: () => void;
}

// Middleware mutators tuple — must match the composition order in store.ts
type Mutators = [["zustand/immer", never], ["zustand/persist", unknown]];

export const createUiSlice: StateCreator<
  TxnSlice & UiSlice,
  Mutators,
  [],
  UiSlice
> = (set) => ({
  role: "Viewer",
  darkMode: false,
  isAuthenticated: false,
  username: null,

  setRole: (role) =>
    set((draft) => {
      draft.role = role;
    }),

  setDarkMode: (dark) =>
    set((draft) => {
      draft.darkMode = dark;
    }),

  login: (username, role) =>
    set((draft) => {
      draft.isAuthenticated = true;
      draft.username = username;
      draft.role = role;
    }),

  logout: () =>
    set((draft) => {
      draft.isAuthenticated = false;
      draft.username = null;
      draft.role = "Viewer";
    }),
});
