# Performance budget

Targets enforced via Lighthouse + `next build`'s page-size report. Measured on a mid-tier mobile device over 4G.

## Targets

| Metric                         | Target        | Why                                          |
| ------------------------------ | ------------- | -------------------------------------------- |
| Largest Contentful Paint (LCP) | ≤ 2.0s        | First impression; brutalist text + grid only |
| First Input Delay (FID)        | ≤ 100ms       | Below human-perceivable input lag            |
| Cumulative Layout Shift (CLS)  | ≤ 0.05        | No content jump after fonts load             |
| Time to Interactive (TTI)      | ≤ 3.0s        | Site usable on a laptop tethered to phone    |
| Initial JS bundle (per-route)  | ≤ 150 KB gzip | Brutalist routes are mostly RSC              |
| Initial CSS                    | ≤ 30 KB gzip  | Single Tailwind v4 stylesheet, tokens inline |
| First fonts paint              | ≤ 1.0s        | `next/font/google` self-hosts; preload first |

## Budget enforcement

- `next build` prints per-route bundle sizes; reviewed every PR
- Visual regressions caught by Phase 4 Lighthouse-CI gate (planned)
- Heavy components (3D canvases, large images) live behind `next/dynamic` with SSR off

## Things that would blow the budget

| Don't                                    | Instead                                                   |
| ---------------------------------------- | --------------------------------------------------------- |
| Add Framer Motion route transitions      | Native CSS view transitions (ADR 0002)                    |
| Add Radix UI for one dialog              | Native `<dialog>` (ADR 0001)                              |
| Add a date library (`date-fns`, `luxon`) | `Intl.DateTimeFormat` + pure helpers in `src/lib/time.ts` |
| Embed unoptimized hero images            | `next/image` with explicit `width`/`height` + `priority`  |
| Load 4+ font families                    | Two: Space Grotesk + JetBrains Mono (CLAUDE.md gotcha)    |

## Measure locally

```bash
pnpm build          # see per-route sizes
pnpm start          # serve production
# Then Chrome DevTools → Lighthouse → mobile, throttled
```
