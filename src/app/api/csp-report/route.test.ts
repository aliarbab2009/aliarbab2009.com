import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "./route";

/**
 * /api/csp-report — accepts CSP violation reports in two formats:
 *   1. Legacy report-uri: Content-Type: application/csp-report
 *   2. Modern report-to:  Content-Type: application/reports+json
 *
 * Tests verify the handler accepts both, rejects unknown content
 * types, doesn't crash on malformed JSON, and rate-limits per IP.
 */

function makeReq(opts: {
  contentType?: string;
  body?: unknown;
  rawBody?: string;
  ip?: string;
}): Request {
  const headers = new Headers();
  if (opts.contentType) headers.set("content-type", opts.contentType);
  if (opts.ip) headers.set("x-forwarded-for", opts.ip);
  return new Request("https://aliarbab2009.com/api/csp-report", {
    method: "POST",
    headers,
    body: opts.rawBody ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
  });
}

describe("/api/csp-report", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe("GET", () => {
    it("returns 405 — POST-only route", () => {
      const res = GET();
      expect(res.status).toBe(405);
    });
  });

  describe("Content-Type routing", () => {
    it("accepts legacy application/csp-report and returns 204", async () => {
      const res = await POST(
        makeReq({
          contentType: "application/csp-report",
          body: {
            "csp-report": {
              "document-uri": "https://aliarbab2009.com/about",
              "violated-directive": "script-src",
              "blocked-uri": "https://evil.example.com/x.js",
            },
          },
          ip: "1.2.3.4",
        }),
      );
      expect(res.status).toBe(204);
    });

    it("accepts modern application/reports+json and returns 204", async () => {
      const res = await POST(
        makeReq({
          contentType: "application/reports+json",
          body: [
            {
              type: "csp-violation",
              body: {
                documentURL: "https://aliarbab2009.com/",
                effectiveDirective: "img-src",
                blockedURL: "https://evil.example.com/x.png",
              },
            },
          ],
          ip: "5.6.7.8",
        }),
      );
      expect(res.status).toBe(204);
    });

    it("rejects unknown content-types with 415", async () => {
      const res = await POST(
        makeReq({
          contentType: "text/plain",
          rawBody: "lol",
          ip: "9.9.9.9",
        }),
      );
      expect(res.status).toBe(415);
    });

    it("rejects malformed JSON with 400", async () => {
      const res = await POST(
        makeReq({
          contentType: "application/csp-report",
          rawBody: "{not valid json",
          ip: "10.10.10.10",
        }),
      );
      expect(res.status).toBe(400);
    });
  });

  describe("Modern report filtering", () => {
    it("ignores reports whose type is not 'csp-violation'", async () => {
      const res = await POST(
        makeReq({
          contentType: "application/reports+json",
          body: [
            {
              type: "deprecation",
              body: {
                /* not a CSP violation */
              },
            },
            { type: "intervention", body: {} },
          ],
          ip: "11.11.11.11",
        }),
      );
      expect(res.status).toBe(204);
      // Nothing logged since both reports were filtered out
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("logs only csp-violation reports from a mixed batch", async () => {
      const res = await POST(
        makeReq({
          contentType: "application/reports+json",
          body: [
            { type: "deprecation", body: {} },
            {
              type: "csp-violation",
              body: { violatedDirective: "script-src", blockedURL: "https://x.com/y.js" },
            },
            { type: "intervention", body: {} },
          ],
          ip: "12.12.12.12",
        }),
      );
      expect(res.status).toBe(204);
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Rate limit", () => {
    it("returns 429 after exceeding the 60-per-minute cap from one IP", async () => {
      const ip = "100.100.100.100";
      // Burn through 60 successful requests
      for (let i = 0; i < 60; i++) {
        const res = await POST(
          makeReq({
            contentType: "application/csp-report",
            body: { "csp-report": { "violated-directive": "script-src" } },
            ip,
          }),
        );
        expect(res.status).toBe(204);
      }
      // 61st should rate-limit
      const limited = await POST(
        makeReq({
          contentType: "application/csp-report",
          body: { "csp-report": { "violated-directive": "script-src" } },
          ip,
        }),
      );
      expect(limited.status).toBe(429);
    });
  });
});
