import * as Sentry from "@sentry/nextjs";

/**
 * Sentry — Edge runtime configuration.
 *
 * Edge runs:
 *   - src/middleware.ts (CSP nonce generation)
 *   - src/app/api/csp-report/route.ts
 *   - src/app/(*)/opengraph-image.tsx (next/og ImageResponse)
 *
 * No native Node APIs available; Sentry SDK is a smaller subset.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled:
    process.env.NODE_ENV === "production" && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.VERCEL_ENV ?? "development",
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  tracesSampleRate: 0.1,
  sendDefaultPii: false,

  beforeSend(event) {
    if (event.request?.url) {
      try {
        const u = new URL(event.request.url);
        u.search = "";
        event.request.url = u.toString();
      } catch {
        delete event.request.url;
      }
    }
    if (event.request?.headers) delete event.request.headers;
    if (event.request?.cookies) delete event.request.cookies;
    delete event.user;
    return event;
  },
});
