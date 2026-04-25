import { describe, expect, it } from "vitest";

import robots from "./robots";
import { siteConfig } from "@/config/site";

/**
 * robots.txt is the first thing crawlers fetch. Mistakes here can
 * silently de-list the entire site (an accidental Disallow: /) or
 * leak preview routes into search results.
 */

describe("robots()", () => {
  const r = robots();

  it("exposes a single rule (the catch-all '*')", () => {
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    expect(rules).toHaveLength(1);
  });

  it("allows '/' for the catch-all user-agent", () => {
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rule.userAgent).toBe("*");
    expect(rule.allow).toBe("/");
  });

  it("disallows non-content paths (api / dev / _next / private)", () => {
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
    expect(disallow).toContain("/api/");
    expect(disallow).toContain("/dev/");
    expect(disallow).toContain("/_next/");
    expect(disallow).toContain("/private/");
  });

  it("does NOT disallow '/' (catastrophic de-listing protection)", () => {
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow];
    expect(disallow).not.toContain("/");
  });

  it("does NOT block AI crawlers (GPTBot/CCBot/anthropic-ai stay allowed)", () => {
    // Policy decision (see file docstring): AI surfaces should index
    // the portfolio. This test catches a future PR that quietly adds
    // an AI-bot block.
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    const aiBots = ["GPTBot", "CCBot", "anthropic-ai", "Google-Extended"];
    for (const bot of aiBots) {
      const blocked = rules.some(
        (rule) =>
          rule.userAgent === bot &&
          (Array.isArray(rule.disallow) ? rule.disallow.includes("/") : rule.disallow === "/"),
      );
      expect(blocked).toBe(false);
    }
  });

  it("points sitemap at the absolute /sitemap.xml URL", () => {
    expect(r.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
  });

  it("declares the canonical host", () => {
    expect(r.host).toBe(siteConfig.url);
  });
});
