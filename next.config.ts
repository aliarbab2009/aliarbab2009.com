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
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "stocksaathi.co.in" },
      { protocol: "https", hostname: "bolhisaab.in" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
  typedRoutes: true,
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

export default config;
