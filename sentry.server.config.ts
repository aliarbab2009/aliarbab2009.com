import * as Sentry from "@sentry/nextjs";

/**
 * Sentry — Node.js server runtime configuration.
 *
 * Server errors come from Server Components, Route Handlers, Server
 * Actions, generateMetadata/sitemap/robots, and the OG ImageResponse
 * routes. Replays don't apply server-side. We strip headers + query
 * strings just like the client config — these errors might include
 * the inbound request's URL.
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

  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === "console" && breadcrumb.level === "log") return null;
    if (breadcrumb.category === "console" && breadcrumb.level === "info") return null;
    return breadcrumb;
  },

  ignoreErrors: [
    /NEXT_NOT_FOUND/,
    /NEXT_REDIRECT/,
    /^canceled$/i,
  ],
});
