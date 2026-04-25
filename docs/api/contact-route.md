# `/api/contact` — contact form sink

Receives POST submissions from the `<ContactForm>` on `/contact`. Five-layer defense, gated on `RESEND_API_KEY`.

## Defense layers (cheapest first)

1. **Origin allowlist** — `403` on unknown origins. Same-site, canonical site URL, and `*.vercel.app` previews allowed. Empty origin (no-cors fetch / same-origin) allowed.
2. **Content-Type** — `415` if the request isn't `application/json`. Form-encoded payloads from cross-origin sites can't reach the handler.
3. **Zod schema** — `400` on shape mismatch. `name` 2–100 chars, `email` valid + ≤254 chars, `message` 10–5000 chars, `company` honeypot must be empty.
4. **Honeypot** — silent `200` if `company` is filled (bots think they won, real humans never see the hidden field).
5. **Resend delivery** — `502` on Resend API failure, `503` if `RESEND_API_KEY` not set. Both responses include the `siteConfig.email` mailto fallback.

## Stretch (not yet wired)

Phase 4.17 stretch goals:

6. **Rate limit** — Upstash Redis sliding window, 3/hour 20/day per IP
7. **Cloudflare Turnstile** — invisible CAPTCHA token verification

Both gated on env-var presence so the route still works in dev without these services.

## Privacy posture

- Message bodies NEVER persist anywhere on the site. They go straight to Resend → `siteConfig.email` and that's it.
- IP is read from `x-forwarded-for` only for the future rate-limit window. Auto-expires when added; never logged otherwise.
- Reply-To is set to the submitter's email so Ali can reply directly without exposing his actual inbox to the page.
- `RESEND_FROM_EMAIL` defaults to `noreply@aliarbab2009.com` — generic from-address, no leakage.

## Tested by

`src/app/api/contact/route.test.ts` — 13 tests covering each layer (origin, content-type, JSON parse, Zod, honeypot, Resend gating). Tests use native `Request` objects so the route handler runs verbatim — no framework mocking.

## Curl smoke test

```bash
curl -X POST https://aliarbab2009.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Smoke Test","email":"smoke@example.com","message":"smoke test message ten chars","company":""}'
```

Expected: `{"ok":true}` if `RESEND_API_KEY` set, `{"error":"...mailto..."}` 503 otherwise.
