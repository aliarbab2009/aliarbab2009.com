# ADR 0007: Defer Velite + MDX until Phase 1

**Status:** accepted · **Date:** 2026-04-25

## Context

The plan file mentions case-study MDX for the three project worlds — long-form posts at `content/projects/<slug>/index.mdx` rendered via Velite. Phase 0 ships the brutalist shell + "coming soon" stubs.

## Decision

Phase 0 ships zero MDX. The `content/` directory does not yet exist. `velite` is not in `package.json`. Project detail pages are typed React components reading from `src/config/projects.ts`.

## Why

- Phase 0 priority is **deploy-ready, privacy-audited, college-agnostic shell**. Adding the MDX pipeline is dependent on Phase 1 case-study writing.
- Velite + MDX adds ~10 deps, a build-time step, and a velite-output watch path. Worth it once the case studies exist; wasted complexity until then.
- Type-guarded config files (ADR 0006) cover the project-detail tabular needs (stats, links, tech tags) without MDX.

## When this flips

Phase 1 case studies will:

1. Add `velite` + `velite.config.ts` to the build.
2. Add `content/projects/<slug>/{index.mdx, challenges.mdx, architecture.mdx, why-i-built.mdx}`.
3. Wire MDX components in `src/components/mdx/` (Callout, PullQuote, Figure).
4. Project detail pages read from velite output instead of `src/config/projects.ts` for body content.

## Tested by

N/A in Phase 0 — nothing to test until the pipeline lands. Phase 1 will add `content/projects/<slug>/meta.test.ts` schema gates.
