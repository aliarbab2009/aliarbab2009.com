# ADR 0006: Type-guarded config files over MDX frontmatter

**Status:** accepted · **Date:** 2026-04-25

## Context

Site content (activities, awards, courses, timeline, why-I-built blocks, resume entries) needs to live somewhere editable. Two patterns common in personal sites:

1. **MDX with frontmatter.** Each entry is a markdown file with YAML at the top.
2. **Typed `.ts` config files.** Each entry is an object in an exported array, typed via a Zod-or-TS schema.

## Decision

Use typed `.ts` files in `src/config/`. Each file exports a `readonly` array of objects validated by a TS interface. Examples: `src/config/activities.ts`, `src/config/awards.ts`, `src/config/timeline.ts`, `src/config/resume.ts`.

## Why

- **TypeScript catches mistakes at edit time.** Adding a new activity that's missing a `tag` field fails `tsc --noEmit` immediately.
- **Refactoring is mechanical.** Renaming `Activity.role` to `Activity.title` is a single TS rename; an MDX-frontmatter rename would touch every file.
- **Tests can import the data directly.** `src/config/activities.test.ts` imports the array and asserts shape + privacy invariants in pure TS — no MDX parser needed.
- **The volume is small.** ~50 entries total across all surfaces. MDX would be appropriate for case-study long-form prose (Phase 1+); for tabular data, MDX is overkill.

## Consequences

**Pros:** Type-safe, test-friendly, editor-friendly.

**Cons:** Non-developers can't edit `.ts` files comfortably. Acceptable: only Ali edits content.

## Tested by

Per-config Vitest files: `activities.test.ts`, `awards.test.ts`, `coursework.test.ts`, `milestones.test.ts`, `projects.test.ts`, `resume.test.ts`, `site.test.ts`, `timeline.test.ts`, `why-i-built.test.ts`. Each enforces schema shape + privacy regex guards.
