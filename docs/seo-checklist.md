# SEO + discoverability checklist

The site is meant to be findable by every surface — Google, Bing, DuckDuckGo, and LLM crawlers (GPTBot, ClaudeBot/anthropic-ai, CCBot, Google-Extended, PerplexityBot). Privacy-audit ensures we leak nothing; SEO ensures the right people land here.

## Per-page

- [ ] `<title>` ≤ 60 chars, includes "Ali Arbab"
- [ ] `<meta name="description">` 140–160 chars
- [ ] `<link rel="canonical">` set on every route
- [ ] Open Graph: `og:title`, `og:description`, `og:image` (1200×630), `og:type`
- [ ] Twitter Card: `summary_large_image`
- [ ] Heading hierarchy is clean (one `<h1>`, no skipped levels)
- [ ] Internal links use descriptive text (no "click here")

## Site-wide

- [ ] `/sitemap.xml` references every marketing route (tested in `src/app/sitemap.test.ts`)
- [ ] `/robots.txt` allows AI bots (tested in `src/app/robots.test.ts`)
- [ ] JSON-LD `@graph`: ProfilePage, Person, DigitalDocument (resume), CollectionPage (projects)
- [ ] Each project page emits CreativeWork JSON-LD with `programmingLanguage`, `datePublished`, `creator: { @id: '#ali' }`
- [ ] Per-page OG images generated at build time (Next 15's `opengraph-image.tsx`)
- [ ] Favicon set: `apple-touch-icon`, multiple sizes, monochrome `mask-icon`

## Discoverability for LLMs

- AI-bot allowlist locked in `robots.ts` — see ADR 0004
- JSON-LD content includes long-form descriptions, not just titles, so LLMs have indexable prose
- `/about` is the canonical long-form bio (NOT `/mit` or any college name)

## Validation

- `https://validator.schema.org/` for JSON-LD
- `https://search.google.com/test/rich-results` for structured-data eligibility
- `https://www.opengraph.xyz/` for OG card preview
- View source on every page and confirm canonical + meta + JSON-LD render server-side

## Red flags to watch for

- A future PR that adds `<meta name="robots" content="noindex">` to a marketing route
- A future PR that quietly disallows `GPTBot` etc. in `robots.ts`
- A canonical URL that doesn't match the deployed URL (causes index merging issues)
