import { NextResponse } from "next/server";

/**
 * CSP violation report sink.
 *
 * Two report formats arrive here:
 *   1. Legacy `report-uri` POSTs with Content-Type: application/csp-report
 *      Body: { "csp-report": { ... } }
 *   2. Modern `report-to` POSTs with Content-Type: application/reports+json
 *      Body: [{ "type": "csp-violation", "body": { ... } }, ...]
 *
 * Privacy posture (per CLAUDE.md):
 *   - Strip query strings from URLs before logging — they may carry
 *     forbidden tokens or user-typed input
 *   - Don't persist user-agent or IP addresses
 *   - Cap `sample` (the violating script fragment) at 80 chars
 *
 * Rate limit: in-memory token bucket, 60 reports / IP / minute.
 * Best-effort across edge instances; prevents log floods from a
 * misbehaving browser or a malicious flooder.
 */
export const runtime = "edge";
export const dynamic = "force-dynamic";

type CspViolationBody = {
  documentURL?: string;
  documentURI?: string;
  blockedURL?: string;
  "blocked-uri"?: string;
  effectiveDirective?: string;
  "effective-directive"?: string;
  violatedDirective?: string;
  "violated-directive"?: string;
  disposition?: "enforce" | "report";
  statusCode?: number;
  lineNumber?: number;
  columnNumber?: number;
  sourceFile?: string;
  "source-file"?: string;
  sample?: string;
  originalPolicy?: string;
};

const buckets = new Map<string, { count: number; reset: number }>();
const LIMIT_PER_MIN = 60;

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.reset < now) {
    buckets.set(ip, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (b.count >= LIMIT_PER_MIN) return false;
  b.count += 1;
  return true;
}

function stripQuery(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return undefined;
  }
}

function redact(b: CspViolationBody) {
  return {
    documentURL: stripQuery(b.documentURL ?? b.documentURI),
    blockedURL: stripQuery(b.blockedURL ?? b["blocked-uri"]),
    effectiveDirective:
      b.effectiveDirective ??
      b["effective-directive"] ??
      b.violatedDirective ??
      b["violated-directive"],
    disposition: b.disposition,
    statusCode: b.statusCode,
    sourceFile: stripQuery(b.sourceFile ?? b["source-file"]),
    lineNumber: b.lineNumber,
    columnNumber: b.columnNumber,
    sample: b.sample ? b.sample.slice(0, 80) : undefined,
  };
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (!rateLimitOk(ip)) {
    return new NextResponse(null, { status: 429 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let normalized: ReturnType<typeof redact>[] = [];

  try {
    if (contentType.includes("application/csp-report")) {
      const body = (await request.json()) as { "csp-report": CspViolationBody };
      normalized = [redact(body["csp-report"])];
    } else if (
      contentType.includes("application/reports+json") ||
      contentType.includes("application/json")
    ) {
      const body = (await request.json()) as Array<{ type: string; body: CspViolationBody }>;
      normalized = (Array.isArray(body) ? body : [])
        .filter((r) => r.type === "csp-violation")
        .map((r) => redact(r.body));
    } else {
      return new NextResponse(null, { status: 415 });
    }
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  for (const r of normalized) {
    console.warn("[csp]", JSON.stringify(r));
  }

  return new NextResponse(null, { status: 204 });
}

export function GET() {
  return new NextResponse(null, { status: 405 });
}
