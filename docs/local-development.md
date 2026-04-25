# Local development

## Setup

```bash
git clone git@github.com:aliarbab2009/aliarbab2009.com.git
cd aliarbab2009.com
pnpm install
pnpm dev
```

Site runs at `http://localhost:3000`. Hot reload via Next.js + Turbopack.

## Required env

Nothing for the static site. The contact form needs:

- `RESEND_API_KEY` — production-only. Without it, `/api/contact` returns 503 + mailto fallback. That's the intended local-dev posture.
- `RESEND_FROM_EMAIL` — defaults to `noreply@aliarbab2009.com`.
- `CONTACT_TO_EMAIL` — defaults to `siteConfig.email`.

Drop these in `.env.local` (gitignored).

## Common commands

| Command                   | Purpose                                              |
| ------------------------- | ---------------------------------------------------- |
| `pnpm dev`                | Local dev server with HMR                            |
| `pnpm build`              | Production build to `.next/`                         |
| `pnpm start`              | Serve the production build locally                   |
| `pnpm test`               | Vitest, full suite                                   |
| `pnpm test --watch`       | Vitest in watch mode                                 |
| `pnpm typecheck`          | `tsc --noEmit` over the whole project                |
| `pnpm lint`               | ESLint with `--max-warnings=0`                       |
| `pnpm privacy-audit`      | Build then scan `.next/` for forbidden tokens        |

## Pre-commit

Husky runs `lint-staged` (prettier + eslint), `pnpm typecheck`, and `pnpm test` on every `git commit`. Average ~30s overhead. Don't `--no-verify` unless explicitly authorized.

## Pre-push

The `privacy-audit` script also runs in CI. Run it locally before pushing if you've touched any user-facing content:

```bash
pnpm build && pnpm privacy-audit
```

## Reference clones

`_repos/StockSaathi/` and `_repos/BolHisaab/` are gitignored reference clones for case-study material. Read them; don't depend on them at build time. Likewise `maglock_protocol/` for the embedded firmware.
