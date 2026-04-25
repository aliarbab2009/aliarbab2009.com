/**
 * Next.js instrumentation hook — bootstraps Sentry per runtime.
 *
 * Next 15 calls register() once per server runtime. We import the
 * matching config file based on the runtime so each gets the right
 * SDK + filters.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

/**
 * onRequestError — called for any unhandled error in a Server Component,
 * Route Handler, Server Action, or Middleware. Re-export Sentry's helper.
 */
export { captureRequestError as onRequestError } from "@sentry/nextjs";
