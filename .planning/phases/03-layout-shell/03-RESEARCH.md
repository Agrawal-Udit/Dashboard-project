# Phase 3: Layout Shell - Research

**Researched:** 2026-04-04
**Domain:** Tailwind CSS v4 dark mode, sidebar layout, shared UI primitives, CSS variable chart palette, role switcher
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ROLE-01 | User can switch between Viewer and Admin roles via a dropdown or toggle in the header/navbar | `useAppStore().role` + `useAppStore().setRole` already exist from Phase 2; header dropdown calls `setRole`; disclaimer rendered as static text near the control |
| UX-01 | User can toggle between light and dark mode; preference persists across refresh | `useAppStore().darkMode` + `useAppStore().setDarkMode` already exist and are persisted by Zustand persist; `useEffect` syncs `darkMode` boolean to `document.documentElement.classList`; `@custom-variant dark (&:where(.dark, .dark *))` in index.css enables Tailwind dark: utilities |
| UX-02 | Dark mode correctly themes all chart colors via CSS variables, not hardcoded hex | CSS custom properties defined under `:root` and `html.dark` in index.css; Recharts `<Cell fill="var(--chart-color-1)" />` or `stroke="var(...)"` props accept CSS variable strings because SVG resolves `var()` at paint time |
</phase_requirements>

---

## Summary

Phase 3 constructs the app shell that all feature pages slot into. The primary technical work falls into four distinct areas: (1) Tailwind CSS v4 installation and dark mode configuration, (2) applying/removing `dark` class on `<html>` from Zustand state, (3) CSS variable chart color palette, and (4) shared UI primitive components.

Tailwind CSS v4 is not yet installed in the project. The v4 installation process is significantly simpler than v3 — no `tailwind.config.js` is required, the Vite plugin replaces PostCSS, and a single `@import "tailwindcss"` line in `index.css` replaces all `@tailwind` directives. Dark mode class-toggling in v4 requires one additional line: `@custom-variant dark (&:where(.dark, .dark *))`. Without this line, `dark:` utility classes do not activate even when `html.dark` is present in the DOM — this is the single most critical v4 configuration gotcha.

The Phase 2 store already owns `darkMode: boolean` and `setDarkMode`. Phase 3's job is to wire that state to the DOM: a `useEffect` in `App.tsx` (or a dedicated `ThemeSync` component) reads `darkMode` from the store and calls `document.documentElement.classList.toggle('dark', darkMode)`. This side-effect must live outside React's render tree boundary — setting `className` directly on `document.documentElement` is the correct approach, not adding a `className` prop to any React element.

CSS variables for chart colors must be defined under `:root` and `html.dark` (not `.dark`) because the `@custom-variant` declaration in Tailwind v4 targets the `html` element when the class is placed on it. Recharts SVG elements accept `fill="var(--chart-color-1)"` directly — SVG's `fill` presentation attribute resolves CSS `var()` references at paint time. This is verified behavior in modern browsers.

**Primary recommendation:** Install `tailwindcss @tailwindcss/vite` and add `@custom-variant dark (...)` to `index.css` before writing any component. Build primitives (Button, Card, Badge, Input, Select, Modal) as plain Tailwind utility-class components — no headlessui or radix needed for Phase 3 scope except for the Modal (which benefits from `@headlessui/react Dialog` for accessibility focus-trap and ARIA). Use React Router v7 in library mode (not framework mode) for page navigation between Dashboard and Transactions.

---

## Standard Stack

### Core (Phase 3 installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `tailwindcss` | `^4.1` | Utility CSS framework | Project stack decision; v4 is CSS-first, no config file needed |
| `@tailwindcss/vite` | `^4.1` | Official Vite plugin replacing PostCSS setup | Official Tailwind-maintained; replaces postcss + autoprefixer entirely |
| `react-router-dom` | `^7.x` | SPA page routing | v7 supports React 19; library mode (no framework mode) requires no Vite plugin |
| `lucide-react` | `^0.511+` | Icon set (Sun, Moon, User, Menu, etc.) | React 19 compatible (web version); tree-shakeable SVG icons; 1.5KB per icon |
| `recharts` | `^3.8` | Chart library | Project stack decision; 3.x removes the `react-is` peer dependency issue |
| `motion` | `^12.x` | Animation library (renamed framer-motion) | Project stack decision; install now so import works in Phase 3 groundwork |
| `@headlessui/react` | `^2.2.9` | Accessible dialog/modal primitive | React 19 compatible as of v2.2; only used for Modal focus-trap and ARIA |

### Supporting (already installed, used in Phase 3)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zustand` | `^5.x` | Store — role, darkMode | `useAppStore().role`, `useAppStore().darkMode`, `useAppStore().setRole`, `useAppStore().setDarkMode` |
| `@testing-library/react` | `^16.x` | Component rendering tests | `render`, `renderHook`, `screen`, `fireEvent` for component tests |
| `vitest` | `^4.x` | Test runner | Already configured with `environment: 'jsdom'` in `vitest.config.ts` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-router-dom` v7 | `useState` for active page | useState is simpler but breaks browser back/forward, URL sharing, and deep linking. Even a simple SPA benefits from URL-based routing. |
| `@headlessui/react` Dialog | Plain `<div role="dialog">` with `aria-modal` | Rolling a focus-trap manually is ~50 lines and has known edge cases (focus in shadow DOM, Safari quirks). headlessui is 8KB; use it only for Modal. |
| Plain Tailwind utilities | shadcn/ui | shadcn copies component code into the project which is excellent for long-lived apps, but for a single-developer assignment it adds boilerplate. Inline Tailwind utilities are faster and more transparent. |
| `lucide-react` | `react-icons` | react-icons bundles all icons by default (~1MB unoptimized); lucide is tree-shakeable and purpose-built for React. |

### Installation

```bash
# Phase 3 core installs
npm install tailwindcss @tailwindcss/vite react-router-dom recharts motion lucide-react @headlessui/react

# No --legacy-peer-deps needed: recharts 3.x treats react/react-dom as peerDeps
# and lucide-react web supports React 19 natively
```

---

## Architecture Patterns

### Phase 3 File Structure

```
src/
├── App.tsx                    # REPLACE: layout shell with ThemeSync + router
├── index.css                  # REPLACE: Tailwind v4 import + @custom-variant + :root CSS vars
├── main.tsx                   # No change from Phase 2
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx      # Outer shell: sidebar + main content area
│   │   ├── Header.tsx         # Top bar: logo, role switcher, dark toggle
│   │   ├── Sidebar.tsx        # Navigation: Dashboard, Transactions links
│   │   └── ThemeSync.tsx      # Side-effect: syncs darkMode store → html.dark class
│   └── ui/
│       ├── Button.tsx         # Variant: primary | secondary | ghost | danger
│       ├── Card.tsx           # Container with border, shadow, padding
│       ├── Badge.tsx          # Status/category pill with color map
│       ├── Input.tsx          # Controlled text input with label + error state
│       ├── Select.tsx         # Controlled native <select> with label + error state
│       └── Modal.tsx          # Accessible dialog using @headlessui/react Dialog
├── pages/
│   ├── DashboardPage.tsx      # Placeholder for Phase 4
│   └── TransactionsPage.tsx   # Placeholder for Phase 5
└── store/                     # Unchanged from Phase 2
    ├── txnSlice.ts
    ├── uiSlice.ts
    └── store.ts
```

**Rule:** `components/ui/` primitives must NOT import from `store/` — they receive all data and callbacks via props. `components/layout/` components MAY import from `store/` for role/darkMode. Pages import from `store/` and `components/`.

---

### Pattern 1: Tailwind v4 Installation

**What:** Two-step: install packages, add plugin to `vite.config.ts`, replace `index.css` with minimal Tailwind v4 import.

**Critical change from v3:** No `tailwind.config.js`. No PostCSS. No `content` array to configure. Content paths are auto-detected from the Vite plugin.

```typescript
// vite.config.ts — REPLACE existing content
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),   // order matters: tailwindcss() AFTER react()
  ],
})
```

```css
/* src/index.css — REPLACE current content entirely */
@import "tailwindcss";

/* CRITICAL: Must declare this or dark: utilities never activate */
@custom-variant dark (&:where(.dark, .dark *));

/* Chart color palette — accessible in both React and SVG */
:root {
  --chart-color-1: #6366f1;   /* indigo  — housing */
  --chart-color-2: #f59e0b;   /* amber   — food */
  --chart-color-3: #10b981;   /* emerald — transport */
  --chart-color-4: #3b82f6;   /* blue    — utilities */
  --chart-color-5: #ec4899;   /* pink    — entertainment */
  --chart-color-6: #ef4444;   /* red     — healthcare */
  --chart-color-7: #8b5cf6;   /* violet  — education */
  --chart-color-8: #22c55e;   /* green   — salary */
  --chart-color-9: #14b8a6;   /* teal    — freelance */
  --chart-color-10: #f97316;  /* orange  — investment */
  --chart-color-11: #94a3b8;  /* slate   — other */
}

html.dark {
  --chart-color-1: #818cf8;   /* lighter indigo for dark bg */
  --chart-color-2: #fcd34d;
  --chart-color-3: #34d399;
  --chart-color-4: #60a5fa;
  --chart-color-5: #f472b6;
  --chart-color-6: #f87171;
  --chart-color-7: #a78bfa;
  --chart-color-8: #4ade80;
  --chart-color-9: #2dd4bf;
  --chart-color-10: #fb923c;
  --chart-color-11: #cbd5e1;
}
```

**Why `html.dark` not `.dark` for CSS variables:** The `@custom-variant dark (&:where(.dark, .dark *))` targets elements that are descendants of `.dark`. Since `:root` is `<html>`, and `html.dark` means `.dark` is applied to `<html>`, the `html.dark` selector for overriding CSS variables matches correctly. Use `html.dark { ... }` for variable overrides, not just `.dark { ... }`.

---

### Pattern 2: ThemeSync — Applying dark class to document.documentElement

**What:** A zero-render React component (returns `null`) whose sole purpose is running a `useEffect` that syncs Zustand `darkMode` → `document.documentElement.classList`.

**Why a component, not inline in App:** Keeps App.tsx clean. The `useEffect` depends only on `darkMode` — isolating it prevents re-renders of layout children.

**Critical invariant:** `document.documentElement` is `<html>` — the element outside React's render tree. Setting `.classList` on it directly is safe and is the correct Tailwind v4 pattern for class-based dark mode.

```typescript
// src/components/layout/ThemeSync.tsx
import { useEffect } from 'react'
import { useAppStore } from '../../store/store'

export function ThemeSync() {
  const darkMode = useAppStore((s) => s.darkMode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return null
}
```

**Initialization edge case:** When the page loads cold, Zustand `persist` rehydrates `darkMode` from localStorage before first render. The `useEffect` fires after the first paint, which means a brief flash of the wrong theme is possible on slow devices. To prevent this, add a blocking `<script>` in `index.html` BEFORE React loads:

```html
<!-- index.html — inside <head>, before any script -->
<script>
  (function() {
    try {
      var stored = JSON.parse(localStorage.getItem('finance-dashboard-store') || '{}');
      if (stored.state && stored.state.darkMode === true) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
</script>
```

This inline script runs synchronously before React hydrates, eliminating the flash-of-wrong-theme (FOWT) entirely.

---

### Pattern 3: CSS Variables in Recharts SVG Elements

**What:** SVG's `fill` and `stroke` presentation attributes resolve CSS `var()` at paint time. Pass CSS variable references directly as strings.

**Verified:** SVG attributes (not CSS properties) resolve CSS custom properties in all modern browsers. Recharts renders SVG; its `fill` prop maps to the SVG `fill` attribute. This works without any special workaround.

```tsx
// Recharts Cell with CSS variable fill — works in all modern browsers
import { PieChart, Pie, Cell } from 'recharts'

const data = [
  { name: 'Housing', value: 1200 },
  { name: 'Food', value: 850 },
]

// Reference CSS variables defined in :root / html.dark
const CHART_COLORS = [
  'var(--chart-color-1)',
  'var(--chart-color-2)',
  'var(--chart-color-3)',
  // ...
]

function CategoryChart() {
  return (
    <PieChart width={300} height={300}>
      <Pie data={data} dataKey="value">
        {data.map((_, index) => (
          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  )
}
```

**Dark mode behavior:** When `html.dark` is set, the CSS variables update to their dark palette values. Because the variables are resolved at paint time, SVG elements automatically repaint with the new colors. No JavaScript color-switching logic is needed inside chart components.

**Limitation:** The `fill` prop in Recharts maps correctly to SVG `fill` attribute for `Cell`, `Bar`, `Area`, `Line`, and `Dot` components. For `XAxis`/`YAxis` tick colors and `CartesianGrid` stroke, use `tick={{ fill: 'var(--chart-color-text)' }}` prop or add CSS variable overrides like `--chart-color-text` for text elements.

---

### Pattern 4: Role Switcher Component

**What:** A `<select>` dropdown in the header that calls `setRole` from the Zustand store. A static disclaimer text is rendered adjacent to the control.

**Disclaimer placement:** Render as a `<span>` or `<p>` immediately below or beside the role selector. It must be visible without hovering (not a tooltip). The text: "UI simulation — no backend authentication".

```tsx
// src/components/layout/Header.tsx (excerpt)
import { useAppStore } from '../../store/store'
import type { Role } from '../../store/uiSlice'

function RoleSwitcher() {
  const role = useAppStore((s) => s.role)
  const setRole = useAppStore((s) => s.setRole)

  return (
    <div className="flex flex-col items-end gap-0.5">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="rounded border border-gray-300 bg-white px-2 py-1 text-sm
                   dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        aria-label="Switch role"
      >
        <option value="Viewer">Viewer</option>
        <option value="Admin">Admin</option>
      </select>
      <span className="text-xs text-yellow-600 dark:text-yellow-400">
        UI simulation — no backend authentication
      </span>
    </div>
  )
}
```

---

### Pattern 5: Dark Mode Toggle Button

**What:** A button with a Sun/Moon icon that reads `darkMode` from the store and calls `setDarkMode(!darkMode)`. Icons from `lucide-react`.

```tsx
// src/components/layout/Header.tsx (excerpt)
import { Sun, Moon } from 'lucide-react'
import { useAppStore } from '../../store/store'

function DarkModeToggle() {
  const darkMode = useAppStore((s) => s.darkMode)
  const setDarkMode = useAppStore((s) => s.setDarkMode)

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className="rounded-md p-2 text-gray-600 hover:bg-gray-100
                 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
```

---

### Pattern 6: Sidebar + Main Layout with Responsive Collapse

**What:** Flex-row layout at desktop, collapsed sidebar hidden at mobile. No third-party layout library. Pure Tailwind v4 utilities.

**Approach:** Use flexbox (`flex flex-col md:flex-row`) at the root. Sidebar uses `w-64 shrink-0 hidden md:flex`. On mobile, a hamburger button sets a `sidebarOpen` boolean via `useState` in `AppLayout`, and the sidebar renders with conditional classes.

```tsx
// src/components/layout/AppLayout.tsx (structure outline)
function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar: hidden on mobile, visible on md+ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 flex-col bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-700
          transition-transform md:static md:translate-x-0
          ${sidebarOpen ? 'flex translate-x-0' : '-translate-x-full hidden md:flex'}
        `}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </aside>

      {/* Overlay on mobile when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

### Pattern 7: React Router v7 Library Mode

**What:** Wrap the app in `<BrowserRouter>` from `react-router-dom` and use `<Routes>` + `<Route>` for Dashboard and Transactions pages.

**Library mode vs framework mode:** Library mode is `react-router-dom` used exactly as React Router v6 — no Vite plugin, no file-system routing, no SSR. This is appropriate for this SPA.

```tsx
// src/App.tsx — Phase 3 replacement
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ThemeSync } from './components/layout/ThemeSync'
import { DashboardPage } from './pages/DashboardPage'
import { TransactionsPage } from './pages/TransactionsPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeSync />
      <AppLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
```

---

### Pattern 8: Shared UI Primitives

**What:** Typed, Tailwind-styled components with `dark:` variants. No state, no store imports. Receive everything via props.

**Strategy:** Inline Tailwind utilities only. Do NOT use `@layer components` with `@apply` for these — Tailwind v4 has breaking changes with `@apply` inside `@layer components` for variant support. Keep all styles as className strings in JSX.

**Button:**
```tsx
// src/components/ui/Button.tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
  ghost:     'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  danger:    'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium
                  transition-colors disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

**Card, Badge, Input, Select:** Follow the same pattern — typed props, conditional className string construction, `dark:` variants for background/border/text. Each file stays under 80 lines.

**Modal (uses @headlessui/react Dialog):**
```tsx
// src/components/ui/Modal.tsx
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl
                                dark:bg-gray-800 dark:shadow-gray-900/50">
          <DialogTitle className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </DialogTitle>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
```

---

### Anti-Patterns to Avoid

- **Omitting `@custom-variant dark (...)` from index.css:** This is the most common Tailwind v4 mistake. Without it, `dark:` utility classes compile but never activate, even if `html.dark` is present. The symptom: dark mode toggle changes the class in DevTools but UI does not change.
- **Setting `darkMode: 'class'` in tailwind.config.js:** There is no `tailwind.config.js` in v4. The only config is in CSS using `@custom-variant`. Do not create a config file for this.
- **Toggling `dark` class on the React app root `<div id="root">` instead of `<html>`:** Tailwind v4's `@custom-variant dark (&:where(.dark, .dark *))` works by checking ancestors. The `<html>` element is the conventional root. Putting the class on `#root` works technically but breaks `<head>`-level CSS variable overrides for `html.dark`.
- **Using `@apply` inside `@layer components` for shared component styles:** In Tailwind v4, `@apply` inside `@layer components` breaks variant support and may produce "Cannot apply unknown utility" errors. Keep styles as inline className strings in JSX.
- **Hardcoding hex colors in Recharts props:** Colors in chart components must reference CSS variables (`var(--chart-color-1)`), not hardcoded hex. Hardcoded hex ignores the dark palette entirely.
- **Importing `motion/react` before installing the `motion` package:** The `motion` package is not yet installed. Phase 3 installs it but should only use it minimally (the groundwork confirmation). Heavy animation is Phase 6.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal focus-trap | Custom `onKeyDown` Tab-intercept + `aria-modal` | `@headlessui/react Dialog` | Focus trap has ~12 browser-specific edge cases (Safari, Firefox, shadow DOM, nested portals). headlessui handles all of them. |
| Icon library | SVG inline in JSX files | `lucide-react` | Consistent sizing, strokeWidth, and accessibility props. ~1.5KB per icon, tree-shaken. |
| Page routing | `useState` active page flag | `react-router-dom` v7 | URL-based navigation is required for browser back/forward, bookmarking, and Phase 5 deep-link to specific transaction. |
| CSS variable fallback | JavaScript color-switching in chart components | CSS variable inheritance | SVG resolves `var()` at paint time. No JS needed to change chart colors on theme switch — just update the class on `<html>`. |
| Flash-of-wrong-theme prevention | React state initialization | Inline `<script>` in `index.html` | React renders after the document loads. Only a synchronous blocking script before React boots can prevent FOWT. |

**Key insight:** Phase 3's most complex problems (modal accessibility, icon consistency, routing) are already solved by small, focused libraries. The custom work in Phase 3 is assembling layout structure, which is plain Tailwind — no library needed for that.

---

## Common Pitfalls

### Pitfall 1: `@custom-variant dark` Missing from index.css
**What goes wrong:** Developer installs Tailwind v4, uses `dark:` classes, sees them compile without errors, but the UI never switches to dark mode when `html.dark` is set.
**Why it happens:** Tailwind v4 defaults to `prefers-color-scheme` media query for the `dark:` variant. The `@custom-variant` declaration is required to override this default to class-based toggling.
**How to avoid:** The very first line after `@import "tailwindcss"` must be `@custom-variant dark (&:where(.dark, .dark *));`. Add a comment: `/* REQUIRED for class-based dark mode toggle */`.
**Warning signs:** Dark mode class toggles in DevTools but CSS does not change; `dark:bg-gray-800` is in the stylesheet but computed styles show `bg-white`.

### Pitfall 2: Zustand Persist Rehydration Race (Flash of Wrong Theme)
**What goes wrong:** On page load, the app briefly renders in light mode before switching to dark mode, producing a visible flash.
**Why it happens:** React renders before Zustand persist finishes reading localStorage. The first render uses the default `darkMode: false` from the store initial state. The `useEffect` in `ThemeSync` fires after paint, adding `html.dark` too late.
**How to avoid:** Add the inline blocking script in `index.html` (see Pattern 2 above). This script reads `localStorage` synchronously before any JS module loads and pre-applies `html.dark` if needed.
**Warning signs:** Brief white flash on page load when dark mode is saved.

### Pitfall 3: Tailwind v4 `@apply` Broken in `@layer components`
**What goes wrong:** Developer extracts component styles to `@layer components` and uses `@apply` for convenience, then discovers `dark:` variants inside the `@apply` chain don't work.
**Why it happens:** Tailwind v4 no longer hijacks native CSS `@layer`. Custom classes defined in `@layer components` are not registered as Tailwind utilities, so variant processing doesn't apply.
**How to avoid:** Keep all Tailwind utility styles as `className` strings in JSX. If a pattern must be in CSS, use `@utility` directive for custom utilities (not `@layer components`).
**Warning signs:** `dark:text-white` inside an `@apply` produces no output; removing the component class and inlining the classes directly works.

### Pitfall 4: Recharts `fill` with CSS Variables Not Updating on Theme Switch
**What goes wrong:** Chart colors defined via CSS variables don't update when dark mode toggles, even though the variables are redefined under `html.dark`.
**Why it happens:** The CSS variable definitions are placed under `.dark` instead of `html.dark`. When the class is on `<html>`, the `:root` selector refers to `<html>`. The `.dark` selector matches the element with class `dark`, but the CSS variable override needs to be on `<html>` specifically to replace the `:root` values.
**How to avoid:** Use `html.dark { --chart-color-1: ...; }` not `.dark { --chart-color-1: ...; }` for the variable overrides in index.css.
**Warning signs:** CSS variables update correctly for backgrounds (`dark:bg-gray-800`) but chart fill colors remain the same in both modes.

### Pitfall 5: React Router v7 BrowserRouter 404 on Vite Dev Refresh
**What goes wrong:** Navigating to `/transactions` works, but refreshing the page at that URL returns a 404 from the Vite dev server.
**Why it happens:** The Vite dev server serves `index.html` only for `/`. Navigating to `/transactions` returns a 404 because no file exists at that path.
**How to avoid:** Add `historyApiFallback` to `vite.config.ts`:
```typescript
export default defineConfig({
  server: { historyApiFallback: true },
  // ...
})
```
**Warning signs:** Works in dev when navigating via sidebar links, fails on hard refresh at a non-root route.

### Pitfall 6: `motion` Import Before Install
**What goes wrong:** Phase 3 plan adds groundwork for motion animations but `motion` is not yet in `node_modules`, causing import errors in Vite.
**How to avoid:** Install `motion` in the Phase 3 install step even if actual animation code is Phase 6. A no-op import confirmation test ensures the package resolves.
**Warning signs:** `Cannot find module 'motion/react'` at build time.

---

## Code Examples

### Tailwind v4 Installation Verification

```bash
# After npm install, verify the vite plugin is discoverable
node -e "require('@tailwindcss/vite')" && echo "plugin OK"
```

```tsx
// Smoke test: dark: utility works
// In any component, add:
<div className="bg-white dark:bg-gray-900 text-black dark:text-white p-4">
  Theme test
</div>
// Toggle html.dark in DevTools — colors should switch
```

### ThemeSync with FOWT Prevention

```html
<!-- index.html — add BEFORE </head>, BEFORE any <script type="module"> -->
<script>
  (function() {
    try {
      var stored = JSON.parse(localStorage.getItem('finance-dashboard-store') || '{}');
      if (stored && stored.state && stored.state.darkMode === true) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
</script>
```

### CSS Variable Chart Color Usage (Recharts)

```tsx
// Source: Recharts docs + MDN SVG fill specification
// SVG fill attribute resolves CSS var() at paint time
const CHART_VAR_COLORS = Array.from({ length: 11 }, (_, i) => `var(--chart-color-${i + 1})`)

// Use in Recharts Cell:
<Cell fill={CHART_VAR_COLORS[index]} />

// Use in Recharts Bar:
<Bar dataKey="expenses" fill="var(--chart-color-6)" />

// Use in Recharts Line:
<Line type="monotone" dataKey="balance" stroke="var(--chart-color-1)" />
```

### React Router v7 Library Mode

```tsx
// Source: https://reactrouter.com/start/library/installation
// Library mode = same API as React Router v6, no Vite plugin, no SSR
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'

// NavLink applies aria-current="page" automatically:
<NavLink
  to="/"
  className={({ isActive }) =>
    `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors
     ${isActive
       ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
       : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
     }`
  }
>
  Dashboard
</NavLink>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` with `darkMode: 'class'` | `@custom-variant dark (...)` in CSS | Tailwind v4.0 (Jan 2025) | No JS config file needed; dark mode is pure CSS |
| `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` | Tailwind v4.0 (Jan 2025) | Single import line; PostCSS no longer required |
| PostCSS plugin (`tailwindcss` in `postcss.config.js`) | `@tailwindcss/vite` Vite plugin | Tailwind v4.0 (Jan 2025) | Faster HMR; no PostCSS pipeline |
| `framer-motion` package, import from `framer-motion` | `motion` package, import from `motion/react` | mid-2025 | Package renamed; API identical; React 19 supported |
| `recharts` 2.x with react-is override | `recharts` 3.x (peerDeps approach) | Recharts 3.0+ | React-is override no longer needed |
| `@layer components` + `@apply` for shared styles | Inline Tailwind className strings | Tailwind v4.0 (Jan 2025) | `@apply` in `@layer components` breaks variant support in v4 |

**Deprecated/outdated:**
- `darkMode: 'class'` in tailwind.config.js: Config file does not exist in v4. Use `@custom-variant` in CSS.
- PostCSS + autoprefixer for Tailwind: Replaced by `@tailwindcss/vite`. Do not install `postcss` or `autoprefixer`.
- `framer-motion` import path: Use `motion/react` exclusively.

---

## Open Questions

1. **Recharts 3.x install with React 19 — peer dep warnings**
   - What we know: Recharts 3.x moved react/react-dom/react-is to peerDependencies (confirmed May 2025 discussion). npm 8+ should auto-install peer deps without `--legacy-peer-deps`.
   - What's unclear: Whether the exact released version (3.8.1) has this peerDep configuration or if it still ships with everything in `dependencies`.
   - Recommendation: Run `npm install recharts` and check for errors. If peer dep conflict appears, add to `package.json`: `"overrides": { "react-is": "^19.0.0" }`.

2. **`@headlessui/react` v2.x peer dependency for React 19**
   - What we know: v2.2.0+ explicitly supports React 19 (confirmed per npm page).
   - What's unclear: Whether `npm install @headlessui/react` resolves to 2.2.9 without flags.
   - Recommendation: Pin to `@headlessui/react@^2.2` in the install command to ensure a React 19 compatible version.

3. **Vite `historyApiFallback` option in Vite 8**
   - What we know: Vite 5/6 supported `server.historyApiFallback`. Vite 8 may have renamed or restructured this.
   - What's unclear: Exact Vite 8 API for SPA fallback routing.
   - Recommendation: Check `vite.config.ts` `server` options at implementation time. Alternative: configure it as `server: { historyApiFallback: { index: '/index.html' } }`.

---

## Validation Architecture

> `nyquist_validation` is `true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + @testing-library/react 16.x |
| Config file | `vitest.config.ts` (exists, `environment: 'jsdom'`) |
| Quick run command | `npx vitest run src/components` |
| Full suite command | `npx vitest run --coverage` |

### Realistic Assessment: What Can and Cannot Be Automated

Most of Phase 3 is visual. Be honest about test boundaries:

| Test Category | Automatable? | Why |
|---------------|-------------|-----|
| ThemeSync applies `dark` class to `document.documentElement` | YES | jsdom supports `document.documentElement.classList`; can assert after store update |
| Role switcher renders both options | YES | React renders `<select>` with options; `screen.getByRole('combobox')` |
| Role switcher calls `setRole` on change | YES | `fireEvent.change` + spy on store |
| Disclaimer text is present | YES | `screen.getByText(...)` |
| Dark mode toggle button renders Sun/Moon | YES | Conditional render based on store state |
| Button renders all 4 variants | YES | Render each variant, assert className includes correct Tailwind classes |
| Card, Badge, Input, Select render without errors | YES | Smoke render tests |
| Modal opens/closes via `open` prop | YES | headlessui Dialog renders/unmounts |
| Sidebar NavLink applies active style | YES | Render with MemoryRouter at matching route, assert aria-current |
| Dark mode visual appearance | NO — manual only | CSS variables and `dark:` classes require a real browser or Playwright |
| Responsive sidebar collapse at 375px | NO — manual only | jsdom does not support CSS media queries or layout |
| Flash-of-wrong-theme prevention | NO — manual only | Requires real browser with slow network throttling |
| Chart CSS variables update on theme switch | NO — manual only | SVG paint resolution is not emulated in jsdom |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ROLE-01 | Role switcher renders with Viewer/Admin options | Unit | `npx vitest run src/components/layout` | Wave 0 |
| ROLE-01 | Selecting Admin calls setRole('Admin') | Unit | `npx vitest run src/components/layout` | Wave 0 |
| ROLE-01 | Disclaimer text "UI simulation" is visible | Unit | `npx vitest run src/components/layout` | Wave 0 |
| UX-01 | ThemeSync adds `dark` class to documentElement when darkMode=true | Unit | `npx vitest run src/components/layout` | Wave 0 |
| UX-01 | ThemeSync removes `dark` class when darkMode=false | Unit | `npx vitest run src/components/layout` | Wave 0 |
| UX-01 | Dark toggle button renders Moon icon when darkMode=false | Unit | `npx vitest run src/components/layout` | Wave 0 |
| UX-01 | Dark toggle button renders Sun icon when darkMode=true | Unit | `npx vitest run src/components/layout` | Wave 0 |
| UX-01 | Dark toggle button calls setDarkMode(!current) on click | Unit | `npx vitest run src/components/layout` | Wave 0 |
| UX-01 | Dark mode persists across refresh | Manual | Verify in browser: set dark → F5 → still dark | N/A |
| UX-02 | CSS variables defined under :root | Manual / visual | Verify in DevTools: --chart-color-1 resolves in :root | N/A |
| UX-02 | html.dark overrides CSS variables | Manual / visual | Verify in DevTools with html.dark: --chart-color-1 changes | N/A |
| UX-02 | Button renders in both light and dark | Unit (smoke) | `npx vitest run src/components/ui` | Wave 0 |
| UX-02 | Card renders in both light and dark | Unit (smoke) | `npx vitest run src/components/ui` | Wave 0 |
| UX-02 | Modal opens/closes correctly | Unit | `npx vitest run src/components/ui` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run src/components`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** All automated tests green + manual browser verification checklist passed before Phase 4 begins

### Wave 0 Gaps (must exist before implementation tasks)

- [ ] `src/components/layout/__tests__/ThemeSync.test.tsx` — covers UX-01 DOM class assertions
- [ ] `src/components/layout/__tests__/Header.test.tsx` — covers ROLE-01 role switcher + disclaimer + dark toggle
- [ ] `src/components/ui/__tests__/Button.test.tsx` — covers UX-02 primitive render
- [ ] `src/components/ui/__tests__/Card.test.tsx` — covers UX-02 primitive render
- [ ] `src/components/ui/__tests__/Badge.test.tsx` — covers UX-02 primitive render
- [ ] `src/components/ui/__tests__/Modal.test.tsx` — covers UX-02 modal open/close
- [ ] `src/components/layout/__tests__/Sidebar.test.tsx` — covers NavLink active state

**Note:** No framework changes to `vitest.config.ts` are needed — `environment: 'jsdom'` is already set from Phase 2.

### Manual Verification Checklist (Phase Gate)

The following cannot be unit-tested and must be verified in the browser before Phase 4:

- [ ] Dark mode toggles correctly: entire UI (header, sidebar, cards, body) switches
- [ ] Dark mode persists: set dark → F5 → still dark; set light → F5 → still light
- [ ] No flash of wrong theme on page load (especially when dark is saved)
- [ ] CSS variables change in DevTools when `html.dark` is toggled
- [ ] Recharts Cell fill colors update when theme switches (verify in Phase 4 charts, but confirm pattern works with a manual test div using `background: var(--chart-color-1)`)
- [ ] Sidebar collapses at 375px (hamburger visible, sidebar hidden)
- [ ] Sidebar opens via hamburger, overlay dismisses it
- [ ] Role disclaimer is visible without any hover interaction

---

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS Dark Mode Docs](https://tailwindcss.com/docs/dark-mode) — `@custom-variant dark` syntax confirmed
- [Tailwind CSS v4.0 Announcement Blog](https://tailwindcss.com/blog/tailwindcss-v4) — v4 architecture, CSS-first config, `@import "tailwindcss"` syntax
- [Tailwind CSS Adding Custom Styles Docs](https://tailwindcss.com/docs/adding-custom-styles) — `@layer components`, `@apply` behavior in v4, `@utility` directive
- [Tailwind CSS Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide) — `@apply` in `@layer components` breaking change confirmed
- [Motion (framer-motion) Installation Docs](https://motion.dev/docs/react-installation) — `npm install motion`, `import from 'motion/react'`, React 18.2+ requirement confirmed
- [Recharts React 19 Issue #4558](https://github.com/recharts/recharts/issues/4558) — closed/resolved; react-is override needed for 2.x, planned removal in 3.x
- [Recharts peerDep Discussion #5701](https://github.com/recharts/recharts/discussions/5701) — confirmed 3.x moves react/react-dom/react-is to peerDependencies

### Secondary (MEDIUM confidence)
- [Tailwind v4 Dark Mode Fix Article](https://medium.com/@balpetekserhat/how-i-fixed-tailwind-css-v4-dark-mode-not-working-in-a-vite-react-project-d7f0b3a31184) — confirmed @custom-variant requirement; tailwind.config.js mention is irrelevant for v4 CSS-first setup
- [Dark Theme in React 19 + Zustand Article](https://imrankhani.medium.com/dark-theme-in-react-19-and-typescript-with-zustand-55a4cc40ee84) — useEffect + document.documentElement pattern confirmed
- [headlessui/react npm page](https://www.npmjs.com/package/@headlessui/react) — v2.2.9 latest, React 19 compatible
- [React Router Library Installation](https://reactrouter.com/start/library/installation) — library mode (no framework mode) for plain SPA confirmed
- [lucide-react npm page](https://www.npmjs.com/package/lucide-react) — v1.7.0, React 19 web version compatible

### Tertiary (LOW confidence — noted for validation)
- Multiple DEV Community articles on Tailwind v4 + React dark mode (consistent with official docs; no contradictions found)
- Recharts GitHub releases page — v3.8.1 latest as of search date (2026-04-04)

---

## Metadata

**Confidence breakdown:**
- Tailwind v4 dark mode: HIGH — official docs confirm `@custom-variant` syntax; multiple independent articles corroborate
- CSS variables in Recharts SVG: HIGH — SVG spec behavior; multiple verified sources; confirmed works in modern browsers
- React Router v7 library mode: HIGH — official docs confirm library mode is identical to v6 API
- headlessui/react React 19 compat: HIGH — npm page shows v2.2.9 as latest with React 19 fix
- motion package: HIGH — official docs confirm package rename and `motion/react` import path
- Recharts 3.x + React 19: MEDIUM — issue closed as resolved, but peer dep strategy is still being finalized per May 2025 discussion; may need `react-is` override fallback
- Flash-of-wrong-theme prevention: MEDIUM — pattern is well-established; `index.html` inline script approach is standard

**Research date:** 2026-04-04
**Valid until:** 2026-07-04 (90 days — Tailwind v4 is stable; only fast-moving item is recharts 3.x peer dep strategy)
