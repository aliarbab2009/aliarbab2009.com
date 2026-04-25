import { describe, expect, it } from "vitest";

import { PROJECTS } from "./projects";
import { WHY_I_BUILT } from "./why-i-built";

/**
 * WHY_I_BUILT joins to PROJECTS by slug. Tests verify both data shape
 * + the join integrity (every entry's slug resolves to a real project).
 */

describe("WHY_I_BUILT", () => {
  it("has one entry per project", () => {
    expect(WHY_I_BUILT).toHaveLength(PROJECTS.length);
  });

  it("every slug resolves to a known project", () => {
    const projectSlugs = new Set(PROJECTS.map((p) => p.slug));
    for (const e of WHY_I_BUILT) {
      expect(projectSlugs.has(e.slug)).toBe(true);
    }
  });

  it("every entry has problem/why/learned each meeting the documented length floor", () => {
    for (const e of WHY_I_BUILT) {
      // Spec says ~60-80 words; floor at ~40 words ≈ 200 chars to give
      // editors room without becoming a one-liner.
      expect(e.problem.length).toBeGreaterThanOrEqual(150);
      expect(e.why.length).toBeGreaterThanOrEqual(150);
      expect(e.learned.length).toBeGreaterThanOrEqual(150);
    }
  });

  it("every pull-quote (when set) is one resonant line, not a full paragraph", () => {
    for (const e of WHY_I_BUILT) {
      if (e.pullQuote !== undefined) {
        // Pull-quotes should fit comfortably on a card — under ~30 words ≈ 200 chars
        expect(e.pullQuote.length).toBeLessThanOrEqual(200);
      }
    }
  });

  it("no slug appears more than once", () => {
    const slugs = WHY_I_BUILT.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("no entry contains plausible school-name patterns (privacy gate)", () => {
    const suspicious = /(?:[A-Z][a-z]+ )+(?:School|Academy|Institute|College)\b/;
    for (const e of WHY_I_BUILT) {
      expect(e.problem).not.toMatch(suspicious);
      expect(e.why).not.toMatch(suspicious);
      expect(e.learned).not.toMatch(suspicious);
      if (e.pullQuote) expect(e.pullQuote).not.toMatch(suspicious);
    }
  });
});
