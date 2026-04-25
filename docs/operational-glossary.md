# Operational glossary

Short definitions for terms that show up in commits, ADRs, and runbooks.

| Term                        | Definition                                                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Brutalist**               | The site's default aesthetic: 12-col mono-grid, hairline off-white borders on near-black, Space Grotesk + JetBrains Mono, single cobalt accent.     |
| **College-agnostic**        | Site invariant: never names a target institution. Shareable with any AO at any school.                                                              |
| **Forbidden token**         | Any string that must NEVER appear in the deployed bundle: city, school, phone, timezone, raw Gmail, specific college name, EA/RA, etc.              |
| **HIGH/MEDIUM/LOW (audit)** | Severity tiers in `scripts/privacy-audit.mjs`. HIGH always fails CI; MEDIUM fails when `STRICT_PRIVACY=1`; LOW reports without failing.             |
| **JSON-LD negative space**  | Tests that walk every emitted structured-data payload and assert the absence of forbidden keys (`address`, `telephone`, `birthDate`, etc.).         |
| **Honeypot field**          | A form input named `company` that humans never see (CSS-hidden) but bots fill. Filled honeypot → silent 200 (bot thinks it succeeded).              |
| **Live countdown stack**    | `milestones.ts` + `time.ts#timeUntil()` + `<LiveCountdown>` + `<NowBar>`. Privacy-load-bearing — see ADR 0003.                                      |
| **Project world**           | One of three: StockSaathi (teal), BolHisaab (indigo), MagLock (neon green). Each has a `.theme-<slug>` CSS block and a `/projects/<slug>` route.    |
| **Route group**             | Next.js parens-folder for grouping pages without affecting URL. We use `(marketing)` and `(dev)`.                                                   |
| **Score-release upgrade**   | The `Milestone.score?` field that flips a countdown into a "Score N" badge once AP scores release in July 2026. No other code change needed.        |
| **Velite**                  | The MDX content pipeline used in Phase 1+. Not yet in `package.json` — see ADR 0007.                                                                |
