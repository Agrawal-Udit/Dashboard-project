# Stack Research

**Domain:** Finance Dashboard UI (frontend-only, React SPA)
**Researched:** 2026-04-03
**Confidence:** HIGH (core stack verified via official release pages and npm; supporting libraries verified via WebSearch with official sources)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.x (19.2.4) | UI rendering and component model | Current stable; supports concurrent features, Actions, use() hook; fully supported by Recharts 3.x and Zustand 5.x |
| Vite | 8.x (8.0.3) | Build tool and dev server | Current stable; ships Rolldown (Rust-based bundler) — 10-30x faster builds; first-party `@tailwindcss/vite` plugin; replaces CRA entirely |
| TypeScript | 5.x (5.9+) | Static typing | Industry standard; required by Zustand v5; provides autocomplete on chart data shapes and store slices |
| Tailwind CSS | 4.x (4.1+) | Utility-first styling | v4 is the current stable (released Jan 2025); zero-config, CSS-first approach; built-in dark mode via `prefers-color-scheme` or class strategy; no PostCSS config needed with `@tailwindcss/vite` |
| Recharts | 3.x (3.8.1) | Charting (area, bar, pie, line) | React-native composable API; v3 rewrote state management for correctness; supports React 19; dark mode via CSS variables; best default aesthetics for finance UIs |
| Zustand | 5.x (5.0.11) | Global client state management | Lightest option with full TypeScript inference; no Provider wrapping; ~1.2KB; uses native `useSyncExternalStore`; natural fit for eval demos — minimal boilerplate |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `clsx` | ^2.1.1 | Conditional class composition | Every component that toggles classes (dark mode, active states, variants) |
| `date-fns` | ^4.1.0 | Date formatting and arithmetic | Formatting chart X-axis labels, transaction dates, monthly comparison logic |
| `lucide-react` | ^0.564.0 | Icon set (tree-shakeable) | Navigation, action buttons, category icons in transaction rows |
| `react-hook-form` | ^7.71.1 | Form state and validation | Admin "add/edit transaction" modal — avoids uncontrolled input pitfalls |
| `zod` | ^3.25.x | Schema validation | Validate transaction form data before writing to store/localStorage |
| `react-papaparse` | ^4.x | CSV export | Export transactions as CSV using built-in `CSVDownloader` component |
| `motion` (formerly `framer-motion`) | ^12.37.0 | Animations and micro-interactions | Card enter animations, chart fade-ins, modal transitions — import from `motion/react` |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `@tailwindcss/vite` | First-party Vite plugin for Tailwind v4 | Replaces PostCSS config; add as Vite plugin, import `@import "tailwindcss"` in CSS |
| `@vitejs/plugin-react` | v6+ React Fast Refresh via Oxc | No longer requires Babel; smaller install; ships with Vite 8 setup |
| ESLint + `eslint-plugin-react-hooks` | Lint React rules and hook dependencies | Use flat config (`eslint.config.js`) — the legacy `.eslintrc` is deprecated |
| Prettier | Code formatting | Pair with `eslint-config-prettier` to avoid rule conflicts |
| Vitest + React Testing Library | Unit and component testing | Vitest 3.x shares Vite config; zero extra setup for transforms |
| `typescript-eslint` | TypeScript-aware linting | Required for type-checked lint rules on store slices and chart data types |

---

## Installation

```bash
# Scaffold with Vite (React + TypeScript template)
npm create vite@latest finance-dashboard -- --template react-ts
cd finance-dashboard

# Tailwind CSS v4 (Vite-native)
npm install tailwindcss @tailwindcss/vite

# Charts
npm install recharts

# State
npm install zustand

# Utilities
npm install clsx date-fns lucide-react

# Forms + validation
npm install react-hook-form zod

# Animation
npm install motion

# CSV export
npm install react-papaparse

# Dev dependencies
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom prettier eslint typescript-eslint eslint-plugin-react-hooks eslint-config-prettier
```

**Tailwind v4 Vite config (`vite.config.ts`):**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**CSS entry (`src/index.css`):**
```css
@import "tailwindcss";
```
No `tailwind.config.js` or `@tailwind` directives needed.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|------------------------|
| Recharts 3.x | Chart.js + react-chartjs-2 | Prefer Chart.js when mixing Canvas/WebGL for very large datasets (>10K points); Recharts is SVG-based and better for composability and custom tooltips |
| Recharts 3.x | Victory Charts | Victory has better animation support out of box; Recharts is lighter and more idiomatic React |
| Recharts 3.x | Tremor | Tremor provides opinionated dashboard components (not just charts); adds significant bundle weight; avoid for custom designs |
| Zustand 5.x | Redux Toolkit | Use Redux when the team is large, state is very complex, or time-travel debugging matters; overkill for a frontend eval project |
| Zustand 5.x | Jotai | Jotai is atom-based (better for derived/computed state); Zustand is better when state lives in one coherent "store" object |
| Zustand 5.x | React Context | Context is fine for low-frequency updates (theme, role); becomes a performance trap for high-frequency state like transactions list |
| Tailwind CSS v4 | CSS Modules | CSS Modules scale well in large teams with strict naming; Tailwind is faster for solo/small teams and responsive-first design |
| `motion` (v12) | `@react-spring/web` | React Spring is physics-first and more powerful for complex gesture animations; Motion is simpler API for dashboard micro-interactions |
| `react-papaparse` | native Blob + `URL.createObjectURL` | The native approach is zero-dependency but verbose for JSON-to-CSV; react-papaparse handles edge cases (quoting, encoding) |
| Vite 8 | Next.js | Next.js adds SSR/SSG/file-based routing; this project is purely frontend with no backend — Vite SPA is correct choice |
| React Router v6/v7 | TanStack Router | TanStack Router wins on type safety; React Router v7 is fine for a small SPA with 3-4 views and no nested data loading complexity |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App (CRA) | Officially unmaintained since 2023; slow cold starts; no modern bundler | Vite 8 |
| Moment.js | 300KB+, mutable API, officially in maintenance mode | `date-fns` v4 (tree-shakeable, immutable, ~20KB) |
| `framer-motion` package | Renamed/moved — package is now `motion`; old package still works but points to an outdated fork | `motion` (`npm install motion`, import from `motion/react`) |
| D3.js directly | Raw D3 requires manual DOM reconciliation which conflicts with React's virtual DOM; complex setup for simple charts | Recharts (D3 under the hood, React-idiomatic API) |
| MUI (Material UI) | Heavy (~300KB), Material Design aesthetic clashes with clean minimal finance design intent; hard to de-Material-ify | Tailwind CSS + Radix UI primitives / shadcn components a la carte |
| Ant Design | Similar weight problem; opinionated enterprise aesthetic that fights a custom minimal finance theme | Same as above |
| Redux + `react-redux` | Excessive boilerplate for a no-backend demo; reducers, actions, slices, selectors — all unnecessary here | Zustand 5.x |
| `localStorage` raw reads/writes scattered | Hard to maintain, no reactivity, no error boundary | Zustand `persist` middleware from `zustand/middleware` |
| Tailwind CSS v3 | v4 is stable and significantly faster; v3 requires PostCSS config and `tailwind.config.js`; no reason to start new project on v3 | Tailwind CSS v4 |

---

## Stack Patterns by Variant

**For dark mode:**
- Use Tailwind's `dark:` variant with the `class` strategy
- Toggle `document.documentElement.classList.toggle('dark')` from a Zustand `useThemeStore`
- Pass `stroke` and `fill` as CSS variables to Recharts so charts respect dark mode automatically

**For role-based UI (Admin vs Viewer):**
- Store `role: 'admin' | 'viewer'` in Zustand `useRoleStore` with `persist` middleware
- Guard write actions in the store itself — Viewer calls are no-ops
- Use conditional rendering at the component level, never at the route level (no real auth)

**For localStorage persistence:**
- Use Zustand's built-in `persist` middleware (`import { persist } from 'zustand/middleware'`)
- Persist `transactions` slice and `role` slice separately
- Do NOT persist derived/computed values (balances, summaries) — recompute from transactions

**For CSV export:**
- Use `react-papaparse`'s `jsonToCSV` utility function (no React component needed)
- Trigger via a plain `<button>` that creates a Blob and fires `URL.createObjectURL` + programmatic `<a>` click
- This avoids the `CSVDownloader` component's iframe approach which can be blocked by some browsers

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `recharts@3.8.x` | `react@19.x` | Full React 19 support confirmed in v3.x; v2.x had React 19 issues |
| `zustand@5.x` | `react@18+` only | Dropped React 16/17 support; uses native `useSyncExternalStore` |
| `motion@12.x` | `react@19.x` | Full concurrent-mode support; import from `motion/react` not `framer-motion` |
| `tailwindcss@4.x` + `@tailwindcss/vite` | `vite@6+`, `vite@7+`, `vite@8+` | The `@tailwindcss/vite` plugin is required for v4; PostCSS approach still works but is slower |
| `react-hook-form@7.x` | `react@18+`, `react@19+` | Fully compatible with React 19 concurrent features |
| `date-fns@4.x` | Any JS/TS | Major v4 rewrite — pure ESM, tree-shakeable; `parse` and `format` API is stable |
| `vite@8.x` | `node@20.19+` or `node@22.12+` | Node 18 is no longer supported in Vite 8 |

---

## Sources

- [Vite 8.0 Official Announcement](https://vite.dev/blog/announcing-vite8) — version 8.0.3 confirmed current stable
- [React v19 Official Blog](https://react.dev/blog/2024/12/05/react-19) — v19 stable confirmed December 2024
- [Tailwind CSS v4.0 Official Blog](https://tailwindcss.com/blog/tailwindcss-v4) — v4 stable confirmed January 2025
- [Recharts GitHub Releases](https://github.com/recharts/recharts/releases) — v3.8.1 confirmed current
- [Recharts 3.0 Migration Guide](https://github.com/recharts/recharts/wiki/3.0-migration-guide) — React 19 compat and state rewrite
- [Zustand v5 Announcement (pmnd.rs)](https://pmnd.rs/blog/announcing-zustand-v5) — v5.0.11 confirmed current
- [motion npm package](https://www.npmjs.com/package/framer-motion) — v12.37.0 confirmed, renamed from `framer-motion`
- [Motion for React docs](https://motion.dev/docs/react) — import path `motion/react` confirmed
- [@tailwindcss/vite npm](https://www.npmjs.com/package/@tailwindcss/vite) — Vite plugin setup confirmed
- [State of React State Management 2026 — PkgPulse](https://www.pkgpulse.com/blog/state-of-react-state-management-2026) — Zustand ~20M weekly downloads, clear leader
- [React UI Libraries in 2025 — Makers Den](https://makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra) — MUI/Ant weight comparison
- [Tailwind CSS v4 Vite setup guide — DEV Community](https://dev.to/imamifti056/how-to-setup-tailwind-css-v415-with-vite-react-2025-updated-guide-3koc) — install steps verified

---
*Stack research for: Finance Dashboard UI (React + Vite SPA)*
*Researched: 2026-04-03*
