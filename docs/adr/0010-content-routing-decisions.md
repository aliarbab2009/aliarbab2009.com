# ADR 0010: Content routing under `(marketing)` + `(dev)` route groups

**Status:** accepted · **Date:** 2026-04-25

## Context

The Next.js App Router uses route groups (parens) to group pages without affecting the URL. We have two distinct concerns in this site:

1. **Marketing surfaces** — public-facing pages with the brutalist nav, footer, sitemap entries, OG images, JSON-LD.
2. **Dev surfaces** — internal-ish pages: `/healthz`, sandbox routes, future preview deploys with debug overlays.

## Decision

Route groups split the two:

- `src/app/(marketing)/` — `/`, `/about`, `/projects`, `/projects/<slug>`, `/resume`, `/contact`, etc.
- `src/app/(dev)/` — anything that should NOT appear in `sitemap.xml`, NOT receive marketing analytics, NOT be indexed.

`src/app/sitemap.ts` and `src/app/robots.ts` import from `(marketing)` exclusively.

## Consequences

**Pros:**

- Adding a debug route never accidentally pollutes sitemap or production analytics.
- `(marketing)` layout owns the nav + footer + theme toggle; `(dev)` can opt out for chromeless sandboxes.
- `app/api/` lives outside both groups (it's not a page), and `app/_archive/` (currently `_archive/` at repo root) is also excluded.

**Cons:**

- Mild cognitive overhead: editors must remember which group a route belongs to. Mitigated by the fact that `(dev)` is rare.

## Tested by

- `src/app/sitemap.test.ts` — 8 tests, asserts only marketing routes appear
- `src/app/robots.test.ts` — 7 tests, asserts AI-bot allowlist + sitemap reference
