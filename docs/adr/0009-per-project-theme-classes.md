# ADR 0009: Per-project theme classes scope tokens, not separate components

**Status:** accepted · **Date:** 2026-04-25

## Context

Three project worlds (StockSaathi, BolHisaab, MagLock Protocol) each have a distinct color palette, but use the same primitives — `<Button>`, `<Card>`, `<Badge>`, `<Tabs>`. Two ways to scope the visual difference:

1. **Component variants per project.** `<StockSaathiButton>`, `<BolHisaabButton>`, etc. Each variant hard-codes the project's colors via Tailwind classes.
2. **Theme classes that override CSS custom properties.** A single `<Button>` reads `bg-primary` → `var(--color-primary)`. The project page's `<main className="theme-stocksaathi">` redefines `--color-primary` to teal. Same component, different paint.

## Decision

Use approach 2. Three classes live in `src/app/globals.css`: `.theme-stocksaathi` (teal on deep-black), `.theme-bolhisaab` (indigo on cream), `.theme-maglock` (neon green on pure black). Project detail pages (`/projects/<slug>`) wrap their `<main>` in the matching class.

## Consequences

**Pros:**

- One set of primitives — single source of truth for accessibility, focus rings, sizing, hover states.
- Adding a fourth project world = one CSS block + one route — zero component duplication.
- Site shell (nav, footer) stays on the brutalist tokens — visitor feels "inside Ali's site but in a project's world."

**Cons:**

- The cascade has to win. We use `:where(.theme-x)` selectors with the same specificity as the root tokens so theme classes override but don't fight inline `style` attributes.

## Tested by

Manual: visit `/projects/stocksaathi`, confirm teal accent on the `<Button>`. Automated visual coverage deferred to Phase 4 Playwright + Percy.
