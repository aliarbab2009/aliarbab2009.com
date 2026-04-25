import { NextResponse, type NextRequest } from "next/server";

/**
 * Phase 4.12 — strict CSP via per-request nonce.
 *
 * Static security headers (X-Content-Type-Options, X-Frame-Options,
 * Permissions-Policy, HSTS, COOP, CORP, etc.) live in next.config.ts
 * because they're response-static and benefit from the edge cache.
 *
 * THIS file only handles per-request CSP + Report-To headers. The
 * nonce is (a) stamped on the request via x-nonce so RSCs can read
 * it via headers().get('x-nonce') and apply it to inline <script>
 * tags, (b) stamped on the response via the CSP header so the
 * browser enforces the same value.
 *
 * IMPORTANT — runtime: Edge middleware in Next 15 runs on the Web
 * standards runtime. Use crypto.getRandomValues (Web Crypto), NOT
 * node:crypto.randomBytes which won't bundle on Edge.
 *
 * Ramp: ENFORCE_CSP starts false so the policy ships as
 * Content-Security-Policy-Report-Only for a week. Watch the
 * /api/csp-report logs; once clean, flip to true.
 */

const ENFORCE_CSP = false;

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function buildCsp(nonce: string): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://va.vercel-scripts.com`,
    `script-src-elem 'self' 'nonce-${nonce}' 'strict-dynamic' https://va.vercel-scripts.com`,
    // style-src KEEPS 'unsafe-inline' — JSX `style={{...}}` props compile to
    // inline style="" attributes which would break under a nonce-only policy.
    "style-src 'self' 'unsafe-inline'",
    "style-src-attr 'unsafe-inline'",
    "style-src-elem 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://avatars.githubusercontent.com https://*.public.blob.vercel-storage.com",
    "font-src 'self' data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'self' https://stocksaathi.co.in https://bolhisaab.in",
    "child-src 'self' https://stocksaathi.co.in https://bolhisaab.in",
    "connect-src 'self' https://api.github.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
    "manifest-src 'self'",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "upgrade-insecure-requests",
    "report-uri /api/csp-report",
    "report-to csp-endpoint",
  ];
  return directives.join("; ");
}

export function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const csp = buildCsp(nonce);

  // Pass nonce to RSCs via request header so server components can
  // read it with headers().get('x-nonce'). Next 15 also auto-adds
  // the nonce to its own injected scripts when this header is set.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set(
    ENFORCE_CSP ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
    csp,
  );

  // Reporting endpoints — both standards. report-to is the modern
  // (Chrome 96+); report-uri is the legacy (Firefox + older Chrome).
  response.headers.set(
    "Report-To",
    JSON.stringify({
      group: "csp-endpoint",
      max_age: 86400,
      endpoints: [{ url: "/api/csp-report" }],
      include_subdomains: true,
    }),
  );
  response.headers.set("Reporting-Endpoints", 'csp-endpoint="/api/csp-report"');

  return response;
}

export const config = {
  // Match every request EXCEPT /api/* (no HTML, no inline scripts),
  // _next/static/* (immutable hashed assets), _next/image* (optimizer),
  // and common static files.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|otf|eot|mp4|webm|pdf)$).*)",
  ],
};
