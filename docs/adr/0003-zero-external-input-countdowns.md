# ADR 0003: Live countdowns with zero external input

**Status:** accepted · **Date:** 2026-04-25

## Context

The site shows live countdowns to four AP exam dates in May 2026.
Countdowns appear in two places:

- The home page `<NowBar>` ("Next AP: AP Calculus BC in 16 days")
- The `/about` § 02 academic snapshot (per-exam table)

Common patterns for live countdowns:

1. Fetch authoritative time from a server on first paint, then tick
   from `Date.now()` deltas.
2. Compute purely from the client's `new Date()` against a baked-in
   ISO string.
3. Use a third-party service / API (timeapi.io, World Time API, etc.)

## Decision

Use pattern 2: pure client-local computation. ISO dates live in
`src/config/milestones.ts` and are baked into the JavaScript bundle
at build time. The `<LiveCountdown>` client component reads the ISO
on mount and ticks every 1000ms (60000ms under
`prefers-reduced-motion`) via `setInterval`, calling
`timeUntil(iso, new Date())` from `src/lib/time.ts`.

**No fetches. No server round-trips. No third-party.**

## Why this matters (privacy posture)

This is a privacy-load-bearing architectural decision, not just a
performance one. Several attack / leak surfaces are eliminated:

- **No clock-skew side channel.** The site never tells the client
  "the server thinks it's 14:32 UTC" — that would be a tiny but real
  signal about the deploy region or the build pipeline's tz.
- **No timezone inference from headers.** We never call
  `Intl.DateTimeFormat({ timeZone: ... })` with a server-side guess
  about where the user might be. Browser interprets offset-naive
  `T08:00:00` as local time — "8 a.m. wherever you are" semantics
  match how the College Board administers the exams anyway.
- **Works offline.** After first page load, the service-worker
  cache + the bundled ISO are sufficient to keep the countdown
  ticking. A user reading the site on a long flight gets the same
  experience as one with full bandwidth.
- **Auditable.** `timeUntil()` is a pure function of `(iso, now)`.
  17 unit tests in `src/lib/time.test.ts` lock that contract: same
  input → same output, no Date.now() side-channel.

## Consequences

**Pros:** Privacy invariant holds end-to-end. Bundle stays small (no
date library — `Intl.DateTimeFormat` only used for the absolute-date
hover tooltip). Component tests are trivial via fake timers.

**Cons:** A user with a wildly incorrect system clock sees a wildly
incorrect countdown. Acceptable: the same is true of every CSS
animation, every `setTimeout`, every `<input type="datetime-local">`
default. The hover tooltip on every countdown shows the absolute
date so a user can verify.

## Score-release upgrade path

When AP scores release in July 2026, the file ships an optional
`score?: 1|2|3|4|5` field on the Milestone type. Editing
`milestones.ts` to add `score: 5` to a single entry replaces that
entry's countdown with a "Score 5" badge on `/about` and a "Score N"
chip on the resume embed automatically — no other code change.

## Tested by

- `src/lib/time.test.ts` — 17 tests: pure-math correctness, past
  flip, decomposition, target==now boundary, purity, offset-naive
  ISO local-time semantics.
- `src/config/milestones.test.ts` — 10 tests: data integrity,
  chronological ordering, May 11–15 2026 window.
- `src/components/shell/live-countdown.test.tsx` — 6 tests: render
  shape, ticking via fake timers, ✓ on past, seconds={false}.
- `src/components/home/now-bar.test.tsx` — 6 tests: school-year
  label, Next AP rendering, walks past each exam, "all four sat"
  fallback after May 15.
