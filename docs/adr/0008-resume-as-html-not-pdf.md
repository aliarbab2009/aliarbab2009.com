# ADR 0008: Resume as HTML-first, PDF as exported artifact

**Status:** accepted · **Date:** 2026-04-25

## Context

Recruiters and admissions officers expect a downloadable PDF resume. The portfolio also wants a screen-readable resume page (`/resume`) that:

- Renders quickly without a PDF viewer round-trip.
- Stays accessible (semantic HTML, screen readers, copy-paste).
- Stays themeable (dark mode, print stylesheet).
- Stays auditable (privacy-audit can scan the rendered HTML).

## Decision

The resume is **HTML-first**: a typed `<ResumeBody>` component reading from `src/config/resume.ts`. The PDF is an **exported artifact** generated from the HTML page via `print-to-PDF`, scrubbed of metadata, and dropped at `public/resume/aliarbab-resume.pdf` when ready.

Until the PDF lands, the `/resume` page surfaces a "PDF download — coming soon" notice and a Print button (`window.print()`) that produces an instantly-usable PDF via the OS print dialog. `src/config/resume.ts#hasPDF` flips to `true` once the artifact is committed.

## Consequences

**Pros:**

- Screen experience always works, even before the PDF exists.
- HTML resume is what crawlers (LLM included) read for SEO / structured data.
- Print stylesheet is the source of the eventual PDF — same content, no drift.
- JSON-LD `Person.knowsAbout` + `DigitalDocument` payload reads from the same TS schema → JSON-LD stays consistent with what's visible.

**Cons:**

- Recruiters who want a one-click PDF currently get the print fallback. Acceptable: the PDF lands within Phase 2.

## Tested by

- `src/config/resume.test.ts` — schema shape + privacy regex
- `src/components/resume/resume-actions.test.tsx` — Print button wiring, PDF gating, mailto fallback
- Privacy: when the PDF does land, `scripts/privacy-audit.mjs` runs `pdftotext` + `exiftool` to confirm zero metadata leakage.
