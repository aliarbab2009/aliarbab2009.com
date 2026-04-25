import { describe, expect, it } from "vitest";

import sitemap from "./sitemap";
import { PROJECTS } from "@/config/projects";
import { siteConfig } from "@/config/site";

/**
 * The sitemap is what Google sees first. A regression here is invisible
 * in the UI and shows up weeks later as 'why did our index coverage
 * drop?'. Tests verify every page that exists on disk has a sitemap
 * entry, and every entry's URL is well-formed.
 */

describe("sitemap()", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("includes every static marketing route", () => {
    const expected = ["/", "/projects", "/about", "/resume", "/contact"];
    for (const path of expected) {
      const url = path === "/" ? `${siteConfig.url}/` : `${siteConfig.url}${path}`;
      expect(urls).toContain(url);
    }
  });

  it("includes a per-project URL for each entry in PROJECTS", () => {
    for (const p of PROJECTS) {
      expect(urls).toContain(`${siteConfig.url}/projects/${p.slug}`);
    }
  });

  it("every URL is absolute (starts with the site url)", () => {
    for (const u of urls) {
      expect(u.startsWith(siteConfig.url)).toBe(true);
    }
  });

  it("home page has the highest priority (1.0)", () => {
    const home = entries.find((e) => e.url === `${siteConfig.url}/`);
    expect(home?.priority).toBe(1.0);
  });

  it("every entry has a lastModified ISO date", () => {
    for (const e of entries) {
      expect(e.lastModified).toBeDefined();
      // accept Date objects or ISO strings
      const asString = typeof e.lastModified === "string" ? e.lastModified : e.lastModified?.toISOString();
      expect(asString).toMatch(/^\d{4}-\d{2}-\d{2}/);
    }
  });

  it("every priority is in [0, 1]", () => {
    for (const e of entries) {
      expect(e.priority).toBeGreaterThanOrEqual(0);
      expect(e.priority).toBeLessThanOrEqual(1);
    }
  });

  it("changeFrequency is a documented value", () => {
    const valid = new Set([
      "always",
      "hourly",
      "daily",
      "weekly",
      "monthly",
      "yearly",
      "never",
    ]);
    for (const e of entries) {
      if (e.changeFrequency !== undefined) {
        expect(valid.has(e.changeFrequency)).toBe(true);
      }
    }
  });

  it("contains no duplicate URLs", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });
});
