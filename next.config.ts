import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

/**
 * Comprehensive Permissions-Policy. Block-by-default for every browser
 * feature we don't need. Per-feature documentation:
 *   - clipboard-write (self) — for any future copy-to-clipboard UI
 *   - fullscreen (self)      — for video demos in project case studies
 *   - web-share (self)       — for share-this-page UI
 *   - picture-in-picture     — allowed inside StockSaathi/BolHisaab iframes
 *   - everything else        — blocked
 */
const PERMISSIONS_POLICY = [
  "accelerometer=()",
  "ambient-light-sensor=()",
  "autoplay=()",
  "battery=()",
  "browsing-topics=()", // Chrome Topics API — privacy block
  "camera=()",
  "clipboard-read=()",
  "clipboard-write=(self)",
  "cross-origin-isolated=()",
  "display-capture=()",
  "document-domain=()",
  "encrypted-media=()",
  "execution-while-not-rendered=()",
  "execution-while-out-of-viewport=()",
  "fullscreen=(self)",
  "geolocation=()",
  "gyroscope=()",
  "hid=()",
  "identity-credentials-get=()",
  "idle-detection=()",
  "interest-cohort=()", // legacy FLoC kill
  "keyboard-map=()",
  "magnetometer=()",
  "microphone=()",
  "midi=()",
  "navigation-override=()",
  "otp-credentials=()",
  "payment=()",
  "picture-in-picture=(self https://stocksaathi.co.in https://bolhisaab.in)",
  "publickey-credentials-create=()",
  "publickey-credentials-get=()",
  "screen-wake-lock=()",
  "serial=()",
  "storage-access=()",
  "sync-xhr=()",
  "unload=()",
  "usb=()",
  "web-share=(self)",
  "window-management=()",
  "xr-spatial-tracking=()",
].join(", ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: PERMISSIONS_POLICY },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // COEP require-corp intentionally omitted — would break the
  // StockSaathi + BolHisaab iframe embeds. We don't need
  // SharedArrayBuffer.
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Hide source maps from public clients. Sentry has them via the
  // build-time upload (configured in withSentryConfig below) so it
  // can resolve minified stack traces server-side; visitors don't.
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "stocksaathi.co.in" },
      { protocol: "https", hostname: "bolhisaab.in" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  typedRoutes: true,
  // Expose Vercel build env to client bundle so sentry.client.config.ts
  // can tag events with the right environment + release SHA.
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // OG images WANT to be embedded by external sites (LinkedIn,
        // Twitter, Slack, Discord) when our URL is shared. Override
        // CORP to cross-origin for these routes only.
        source: "/:path*/opengraph-image",
        headers: [{ key: "Cross-Origin-Resource-Policy", value: "cross-origin" }],
      },
      {
        source: "/opengraph-image",
        headers: [{ key: "Cross-Origin-Resource-Policy", value: "cross-origin" }],
      },
    ];
  },
};

/**
 * withSentryConfig wraps the Next config to inject the @sentry/webpack-plugin
 * during build. It uploads source maps to Sentry tagged with the git SHA,
 * then strips them from the public output (hideSourceMaps: true).
 *
 * silent: !process.env.CI keeps local builds quiet; Vercel builds run with
 * CI=true so the upload logs there. authToken is only set on Vercel (via
 * SENTRY_AUTH_TOKEN env var); without it, the plugin no-ops gracefully.
 */
const sentryConfig = {
  org: process.env.SENTRY_ORG ?? "ali-arbab",
  project: process.env.SENTRY_PROJECT ?? "aliarbab2009-com",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  tunnelRoute: "/api/monitoring",
  automaticVercelMonitors: false,
};

export default withSentryConfig(config, sentryConfig);
