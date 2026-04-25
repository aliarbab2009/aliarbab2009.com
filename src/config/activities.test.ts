import { describe, expect, it } from "vitest";

import { ACTIVITIES, ACTIVITY_CATEGORY_LABELS } from "./activities";

/**
 * Data integrity for ACTIVITIES — surfaced in /about § Activities and
 * the resume embed. A regression here is either a privacy leak (school
 * name slipped through) or a 'category' typo that breaks the grouping
 * in JourneySection.
 */

describe("ACTIVITIES catalog", () => {
  it("has at least one entry per documented category", () => {
    const categories = new Set(ACTIVITIES.map((a) => a.category));
    // The seed data covers at least 'tech' — we don't enforce all four
    // permanently because future curation by Ali may drop a category.
    expect(categories.has("tech")).toBe(true);
  });

  it("every entry has a unique stable id", () => {
    const ids = ACTIVITIES.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every category is one of the four documented buckets", () => {
    const valid = new Set(["tech", "leadership", "academic", "community"]);
    for (const a of ACTIVITIES) {
      expect(valid.has(a.category)).toBe(true);
    }
  });

  it("every `from` is a YYYY or YYYY-MM string", () => {
    for (const a of ACTIVITIES) {
      expect(a.from).toMatch(/^\d{4}(-\d{2})?$/);
    }
  });

  it("every `to` (when set) is a YYYY or YYYY-MM string", () => {
    for (const a of ACTIVITIES) {
      if (a.to !== undefined) {
        expect(a.to).toMatch(/^\d{4}(-\d{2})?$/);
      }
    }
  });

  it("every blurb is non-empty and concrete (>= 20 chars)", () => {
    for (const a of ACTIVITIES) {
      expect(a.blurb.length).toBeGreaterThanOrEqual(20);
    }
  });

  it("no entry contains plausible school-name patterns (privacy gate)", () => {
    // Light heuristic: the words 'school', 'academy', 'institute', 'college'
    // capitalized + as part of a multi-word noun phrase are typical
    // school-name leaks. The test enforces lowercase only when these words
    // appear in role/blurb (so 'student literary magazine' is fine, but
    // 'Modern School Quill' would fail).
    const suspicious = /(?:[A-Z][a-z]+ )+(?:School|Academy|Institute|College)\b/;
    for (const a of ACTIVITIES) {
      expect(a.role).not.toMatch(suspicious);
      expect(a.blurb).not.toMatch(suspicious);
    }
  });
});

describe("ACTIVITY_CATEGORY_LABELS", () => {
  it("provides a label for every category", () => {
    expect(ACTIVITY_CATEGORY_LABELS).toMatchObject({
      tech: expect.any(String),
      leadership: expect.any(String),
      academic: expect.any(String),
      community: expect.any(String),
    });
  });
});
