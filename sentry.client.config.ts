import * as Sentry from "@sentry/nextjs";

/**
 * Sentry — client (browser) configuration.
 *
 * Privacy mandate (per CLAUDE.md):
 *   - No session replays (would capture contact-form input)
 *   - No URL query strings (could leak forbidden tokens)
 *   - No request headers (cookies, auth)
 *   - No ui.input breadcrumbs (form values)
 *   - No console.log/info breadcrumbs (might dump local state)
 *   - sendDefaultPii: false + Sentry project setting
 *     "Prevent Storing of IP Addresses" must also be ON
 *
 * Bundle cost: ~50 KB gz. Lazy-loading is a Phase 5 optimization;
 * for now we accept the cost in exchange for visibility.
 *
 * Goes live the moment NEXT_PUBLIC_SENTRY_DSN is set on Vercel.
 * No-ops in development and on Vercel previews/production until then.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  enabled:
    process.env.NODE_ENV === "production" && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),

  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // 10% of transactions traced. Bump only if free-tier quota allows.
  tracesSampleRate: 0.1,

  // Replays — OFF. Would capture form input on /contact.
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 0.0,

  // Belt + braces: tell Sentry not to attach default PII.
  sendDefaultPii: false,

  beforeSend(event) {
    // Strip query strings — they could carry tokens, search text, anything.
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
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.filter((b) => b.category !== "ui.input");
    }
    delete event.user;
    return event;
  },

  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === "console" && breadcrumb.level === "log") return null;
    if (breadcrumb.category === "console" && breadcrumb.level === "info") return null;
    if (breadcrumb.category === "ui.input") return null;
    return breadcrumb;
  },

  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications.",
    "Non-Error promise rejection captured",
    /^canceled$/i,
    /AbortError: The user aborted a request/i,
    "Failed to fetch",
    "Load failed",
    "NetworkError when attempting to fetch resource.",
    /Minified React error #418/,
    /Minified React error #423/,
    /Minified React error #425/,
  ],

  denyUrls: [
    /chrome-extension:\/\//,
    /^moz-extension:\/\//,
    /^safari-extension:\/\//,
    /^safari-web-extension:\/\//,
    /\/api\/monitoring/,
  ],
});
