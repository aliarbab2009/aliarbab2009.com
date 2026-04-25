## Summary

<!-- What changed and why. Link any plan section or P-number. -->

## Privacy check

- [ ] No college names, city names, school names, phone numbers, raw Gmail, or timezone strings added
- [ ] `pnpm privacy-audit` passes locally with 0 high + 0 medium hits

## Dependency review (skip if no `package.json` change)

- [ ] No new `dependencies` added, OR each new dep reviewed via `pnpm why <name>` and `npm view <name>` (publish date, weekly downloads, maintainer count)
- [ ] No new `postinstall` / `preinstall` / `prepare` scripts in added packages (or scrutinized + documented in the PR body)
- [ ] Lockfile diff matches the intent: only the package(s) you added/updated changed
- [ ] `pnpm audit --prod --audit-level=moderate` clean

## Test plan

<!-- Browser / mobile / lighthouse / a11y / privacy checks you ran locally. -->

## Screenshots / GIFs

<!-- For any visual change. Drop them here so reviewers don't have to pull and run. -->
