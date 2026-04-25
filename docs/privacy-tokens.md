# Forbidden token reference

Authoritative list of strings that must NEVER appear in the deployed bundle. `scripts/privacy-audit.mjs` enforces this; this file is the human-readable companion.

## HIGH severity (always fails CI)

These leak Ali's identity, location, or institution and can never be cached anywhere.

- Specific city names (the regex list lives in `scripts/privacy-audit.mjs`)
- School name (any specific school Ali attends or attended)
- Phone numbers (any digit pattern matching common phone formats)
- Raw personal Gmail (the literal address pattern; site uses `siteConfig.email` instead)
- Specific college names (any institution, regardless of country or tier)
- "EA" / "early action" / "RA" / "regular action" / "ED" / "early decision" / "rolling admission"
- "Admissions committee" (signals to a specific institution)

## MEDIUM severity (fails when STRICT_PRIVACY=1)

Things that reveal less but still narrow the audience.

- Timezone strings (any IANA zone or named offset that narrows location)
- Specific country (only "Earth" / no country is the rule for the deployed surface)
- Internal application deadline dates (Nov 2026, Jan 2027, etc.)

## LOW severity (warn-only)

Stylistic / consistency.

- Lowercase `apple` when meaning "Apple Inc."
- Trailing whitespace in user-facing strings
- ASCII-only quotes in long-form prose (we prefer typographic quotes)

## Where these get checked

| Layer                       | What it scans                                                       |
| --------------------------- | ------------------------------------------------------------------- |
| `scripts/privacy-audit.mjs` | Final `.next/server`, `.next/static`, and `public/` bundle output   |
| `src/lib/json-ld.test.ts`   | Every JSON-LD payload, recursively, for forbidden keys/values       |
| Per-config Vitest tests     | The string contents of typed config arrays, regex by category       |
| `src/config/site.test.ts`   | `siteConfig.shortDescription` + `longDescription` against geo names |
| `src/app/robots.test.ts`    | The robots policy itself + AI-bot allowlist invariant               |

## Where these are allowed

- `PRIVATE_CALENDAR.md` — gitignored, never committed
- This file (`docs/privacy-tokens.md`) — discusses categories; gives no actual values
- Local `.env.local` — gitignored
- Slack/Discord/email between Ali and collaborators — not the deployed surface

## Adding a new forbidden token

1. Add the regex to the appropriate severity tier in `scripts/privacy-audit.mjs`.
2. Add a Vitest regression in the closest test file (e.g. `src/config/site.test.ts` for site descriptions).
3. Run `pnpm privacy-audit` against an old build to verify the gate would've caught the leak.
