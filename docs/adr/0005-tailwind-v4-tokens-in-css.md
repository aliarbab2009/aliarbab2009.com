# ADR 0005: Tailwind v4 tokens in `@theme`, no `tailwind.config.ts`

**Status:** accepted · **Date:** 2026-04-25

## Context

Tailwind v4 (released stable in early 2025) replaces the JS config file with a CSS-native `@theme` directive. Tokens live as CSS custom properties; the v4 engine reads them at parse time. A JS config file is still permitted (for plugins, content paths in legacy setups), but no longer required.

## Decision

No `tailwind.config.ts` in this repo. All tokens — colors, spacing, fonts, radius, motion timing — live in `src/app/globals.css` inside the `@theme` block. Per-project worlds (`.theme-stocksaathi`, `.theme-bolhisaab`, `.theme-maglock`) override these custom properties via class scoping.

## Consequences

**Pros:**

- Single source of truth: `globals.css`. No JS↔CSS round-trip.
- Theme overrides work via cascade — same mechanism as the dark/light toggle.
- `class-variance-authority` reads `bg-primary` which resolves to `var(--color-primary)` — the project theme class re-binds that variable, the component re-paints. No `<StockSaathiButton>` variants needed.

**Cons:**

- If we ever need a Tailwind plugin (e.g. `@tailwindcss/typography`), we re-introduce a config file for plugins only and keep tokens in CSS.
- Editor IntelliSense for theme tokens depends on the v4-aware Tailwind extension. Older extensions show empty autocomplete.

## Tested by

`src/components/seo/json-ld.test.tsx` and `src/components/resume/resume-actions.test.tsx` indirectly verify that components render expected classes. Visual / token-level coverage is deferred to Playwright e2e + Percy snapshot in Phase 4.
