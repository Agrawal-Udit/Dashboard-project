---
phase: 3
slug: layout-shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-04
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x + @testing-library/react 16.x |
| **Config file** | `vitest.config.ts` (exists, `environment: 'jsdom'`) |
| **Quick run command** | `npx vitest run src/components` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/components`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Realistic Assessment: What Can and Cannot Be Automated

Most of Phase 3 is visual. The following distinguishes automatable from manual-only behaviors:

| Test Category | Automatable? | Why |
|---------------|-------------|-----|
| ThemeSync applies `dark` class to `document.documentElement` | YES | jsdom supports `document.documentElement.classList` |
| Role switcher renders Viewer/Admin options | YES | React renders `<select>` with options |
| Role switcher calls `setRole` on change | YES | `fireEvent.change` + store spy |
| Disclaimer text present | YES | `screen.getByText(...)` |
| Dark mode toggle renders Sun/Moon icon | YES | Conditional render based on store state |
| Button/Card/Badge/Input/Select smoke renders | YES | No-crash assertion |
| Modal opens/closes via `open` prop | YES | headlessui Dialog renders/unmounts |
| Dark mode visual appearance | NO — manual | CSS variables + `dark:` classes require real browser |
| Responsive sidebar collapse at 375px | NO — manual | jsdom has no CSS media query support |
| Flash-of-wrong-theme prevention | NO — manual | Requires real browser with throttling |
| Chart CSS variables update on theme switch | NO — manual | SVG paint resolution not emulated in jsdom |

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 0 | ROLE-01, UX-01, UX-02 | setup | `npm run build` (zero errors) | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 0 | ROLE-01, UX-01 | unit stub | `npx vitest run src/components/layout` | ❌ W0 | ⬜ pending |
| 3-01-03 | 01 | 0 | UX-02 | unit stub | `npx vitest run src/components/ui` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 1 | UX-01, UX-02 | unit | `npx vitest run src/components/layout` | ❌ W0 | ⬜ pending |
| 3-02-02 | 02 | 1 | UX-02 | unit | `npx vitest run src/components/ui` | ❌ W0 | ⬜ pending |
| 3-03-01 | 03 | 2 | ROLE-01, UX-01 | unit | `npx vitest run src/components/layout` | ❌ W0 | ⬜ pending |
| 3-03-02 | 03 | 2 | UX-01, UX-02 | manual | Browser: set dark → F5 → still dark | N/A | ⬜ pending |
| 3-03-03 | 03 | 2 | UX-02 | manual | DevTools: `--chart-color-1` resolves in `:root` and `html.dark` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install: `npm install tailwindcss @tailwindcss/vite` — Tailwind CSS v4 not yet in node_modules
- [ ] Install: `npm install react-router-dom lucide-react recharts motion @headlessui/react`
- [ ] `src/index.css` — `@import "tailwindcss"` + `@custom-variant dark` + CSS variable palette + `html.dark` overrides
- [ ] `vite.config.ts` — add `@tailwindcss/vite` plugin
- [ ] `src/components/layout/__tests__/ThemeSync.test.tsx` — failing stubs: dark class applied/removed
- [ ] `src/components/layout/__tests__/Header.test.tsx` — failing stubs: role switcher, disclaimer, dark toggle
- [ ] `src/components/ui/__tests__/primitives.test.tsx` — failing smoke stubs: Button, Card, Badge, Modal

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark mode visual appearance (colors, backgrounds, text) | UX-01 | CSS variables + `dark:` classes require real browser render | Open app, toggle dark, inspect all surfaces change correctly |
| Responsive sidebar collapses at 375px | UX-01 | jsdom has no media query support | DevTools → 375px width → sidebar collapses or hides |
| Flash-of-wrong-theme prevented on reload | UX-01 | Requires real browser with cache cleared | Hard-refresh (Ctrl+Shift+R), observe no light flash before dark loads |
| CSS variable palette resolves in DevTools | UX-02 | SVG paint resolution not in jsdom | DevTools → Elements → `:root` → confirm `--chart-color-1` through `--chart-color-6` exist |
| Chart colors change in `html.dark` | UX-02 | Visual SVG rendering | Toggle dark mode → CSS variables change → charts use new colors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
