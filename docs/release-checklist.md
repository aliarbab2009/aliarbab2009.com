# Release checklist

Before merging to `main` (which auto-deploys to production via Vercel):

## Pre-merge

- [ ] `pnpm typecheck` clean
- [ ] `pnpm lint` clean (`--max-warnings=0`)
- [ ] `pnpm test` green (all 200+ tests passing)
- [ ] `pnpm build` succeeds
- [ ] `pnpm privacy-audit` reports no HIGH or MEDIUM findings
- [ ] If touching content: re-read the diff for forbidden tokens before pushing
- [ ] If touching media: ran `scripts/scrub-metadata.mjs` on every new image
- [ ] If touching `next.config.mjs` headers: smoke-tested locally that pages still render under the new CSP

## Post-deploy

- [ ] Hit `https://aliarbab2009.com/healthz` (200 OK)
- [ ] Spot-check the home page, a project page, `/about`, `/resume`, `/contact`
- [ ] If touching countdowns: verify `<NowBar>` shows expected next AP and ticks live
- [ ] If touching JSON-LD: validate via `https://validator.schema.org/`
- [ ] If touching SEO: re-validate via `https://search.google.com/test/rich-results`

## When the AP exam window closes (mid-May 2026)

- [ ] Confirm `<NowBar>` flips to "✓ all four sat" on May 16
- [ ] No code change required — the calendar branches are wired

## When AP scores release (early July 2026)

- [ ] Edit `src/config/milestones.ts` — add `score: N` to each entry as scores arrive
- [ ] Verify `/about` § 02 academic snapshot updates automatically
- [ ] Consider a "Class of 2027 — AP results" /now post

## When the resume PDF lands

- [ ] Drop the file at `public/resume/aliarbab-resume.pdf`
- [ ] Run `scripts/scrub-metadata.mjs` on the PDF
- [ ] `pdftotext` + `exiftool` audit (no Author, no GPS, no serials)
- [ ] Flip `RESUME.hasPDF` to `true` in `src/config/resume.ts`
- [ ] Verify the Print fallback notice disappears from `/resume` and the Download PDF link renders
