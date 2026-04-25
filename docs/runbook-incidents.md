# Incident runbook

What to do when a thing goes wrong.

## Privacy leak detected on the deployed site

A name, school, city, or any forbidden token is visible on `aliarbab2009.com`.

1. **Immediate:** revert the offending commit on `main`. Push.
2. **Verify:** wait for the Vercel re-deploy (~90s). Hit the affected URL with `curl -s | grep -i '<token>'` to confirm the leak is gone.
3. **Cache:** Vercel CDN purges automatically on deploy, but Cloudflare or external caches may still hold the old response. Run a manual purge from the Cloudflare dashboard if it's wired up.
4. **Search engines:** if the leaked token had been indexed, file a removal request via Google Search Console (URL Removal tool).
5. **Post-mortem:** add a Vitest regex guard for the specific pattern that slipped through. Re-run `scripts/privacy-audit.mjs` against the failed deploy artifact to confirm the new gate would have caught it.

## CSP report storm

`/api/csp-report` is logging an unusual volume of reports.

1. **Triage:** SSH into Vercel logs, look at the redacted directives. If they're all the same directive + same blocked URL, there's a single misconfiguration to fix.
2. **Common cause:** a third-party script (analytics, embed) loaded a new subresource hash. Update the CSP allowlist in `next.config.mjs`'s `headers()` block.
3. **Re-deploy.** The CSP report rate should fall to baseline within minutes.

## Contact form silently failing

Form submits return success but no email arrives.

1. **Check Vercel env:** `RESEND_API_KEY` set? Production env, not preview.
2. **Check Resend dashboard:** any emails actually sent? Bounces?
3. **Check `siteConfig.email`:** is it the right address? Was it changed in a recent commit?
4. **Test the endpoint directly:**
   ```bash
   curl -X POST https://aliarbab2009.com/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"test","email":"test@example.com","message":"runbook test message ten chars","company":""}'
   ```
   503 → `RESEND_API_KEY` missing. 502 → Resend API rejected the call. 200 → email path is healthy; check spam folders.

## AP-countdown shows wrong number

The `<NowBar>` or `<LiveCountdown>` displays an unexpected value.

1. **Confirm the user's clock.** Most "wrong countdown" reports are clock-skew on the visitor's machine. The hover tooltip shows the absolute target date.
2. **Check `src/config/milestones.ts`.** Was a date edited recently? Run `pnpm test src/config/milestones.test.ts` — the 10 tests should fail if the May 2026 window is broken.
3. **Service-worker cache.** If a user is seeing a stale bundle, the new ISO won't reach them until the SW updates. Bump the SW version or hard-refresh.
