# ADR 0002: CSS-only View Transitions, no Framer Motion route shim

**Status:** accepted · **Date:** 2026-04-25

## Context

The plan file called for "smooth route transitions" between marketing
pages. Several patterns are common:

1. **Framer Motion `<AnimatePresence>` wrapping the route tree.**
   Adds ~30 KB minified, requires the entire app shell to be a
   client component (kills RSC streaming).
2. **Next.js `unstable_ViewTransition` + the new React 19 API.**
   Still flagged unstable; ergonomics evolving.
3. **Native `@view-transition` CSS rule.** Browser-managed; works at
   the document level; zero JS; gracefully no-ops in unsupporting
   browsers.

The brutalist aesthetic also constrains the answer: this isn't a site
that wants slide-in / scale / parallax. The right route transition
here is a plain crossfade — content swaps, the grid stays still.

## Decision

Use the native CSS `@view-transition { navigation: auto }` rule plus
a pair of `::view-transition-old(root)` / `::view-transition-new(root)`
keyframes. Pure CSS. No JS, no library, no React API.

Implementation lives in `src/app/globals.css`. Timing tokens
(`--motion-base`, `--motion-ease`) are reused from the existing
`@theme` block so the route fade matches every other transition on
the site.

## Consequences

**Pros:**

- Zero JS / zero new deps / zero bundle impact.
- Route transitions stay correct under SSR; no client-component
  upgrade ripple through the app shell.
- Browser handles the snapshot capture + paint scheduling; we just
  declare the animation.
- Graceful no-op in browsers without support (Firefox at time of
  writing) — instant route changes, no broken UI.

**Cons:**

- Cross-document transitions only ship in Chromium 126+ / WebKit 18+.
  Firefox users get a hard cut. Acceptable: the site is readable
  either way.
- Per-element `view-transition-name` choreography (the "shared
  element" pattern) requires more setup. We don't currently use it;
  the brutalist aesthetic prefers the unified-fade approach anyway.

## Reduced motion

`@media (prefers-reduced-motion: reduce)` already collapses
`transition-duration` to 0.01ms across the site, but
view-transition pseudos render via CSS animation (not transition),
so they need an explicit `animation: none !important` opt-out. Added.

## Tested by

Manual: navigate between routes in Chrome 126+, observe crossfade.
Automated coverage deferred to Playwright e2e — DOM-level testing of
cross-document transitions in happy-dom is unreliable.
