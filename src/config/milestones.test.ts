import { describe, expect, it } from "vitest";

import { MILESTONES, getNextMilestone } from "./milestones";

/**
 * MILESTONES is the single source of truth for public academic dates
 * on the site. Tests verify the integrity of the data + correctness of
 * getNextMilestone() which the home NowBar depends on.
 */

describe("MILESTONES", () => {
  it("contains exactly the four AP exams in May 2026", () => {
    expect(MILESTONES).toHaveLength(4);
    expect(MILESTONES.map((m) => m.id)).toEqual([
      "ap-calc-bc",
      "ap-phys-c-mech",
      "ap-eng-lang",
      "ap-csa",
    ]);
  });

  it("uses offset-naive ISO strings (browser-local time)", () => {
    // The architecture rule: ISO strings have NO trailing Z or +offset.
    // Browser interprets them as local time → "8 a.m. wherever you are".
    for (const m of MILESTONES) {
      expect(m.at).not.toMatch(/Z$/);
      expect(m.at).not.toMatch(/[+-]\d{2}:\d{2}$/);
      expect(m.at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    }
  });

  it("has dates in chronological order", () => {
    const times = MILESTONES.map((m) => new Date(m.at).getTime());
    const sorted = [...times].sort((a, b) => a - b);
    expect(times).toEqual(sorted);
  });

  it("falls within the published College Board AP window May 11-15, 2026", () => {
    for (const m of MILESTONES) {
      const date = new Date(m.at);
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(4); // 0-indexed: May
      expect(date.getDate()).toBeGreaterThanOrEqual(11);
      expect(date.getDate()).toBeLessThanOrEqual(15);
    }
  });
});

describe("getNextMilestone", () => {
  it("returns the soonest future milestone when several are upcoming", () => {
    const now = new Date("2026-04-25T08:00:00");
    const next = getNextMilestone(now);
    expect(next?.id).toBe("ap-calc-bc"); // earliest of the four
  });

  it("skips past milestones and returns the next remaining one", () => {
    const now = new Date("2026-05-12T08:00:00"); // after Calc BC
    const next = getNextMilestone(now);
    expect(next?.id).toBe("ap-phys-c-mech"); // May 13 morning
  });

  it("walks correctly past midday boundaries", () => {
    const now = new Date("2026-05-13T10:00:00"); // after Phys C 8am, before Eng Lang 12pm
    const next = getNextMilestone(now);
    expect(next?.id).toBe("ap-eng-lang");
  });

  it("returns null when all four exams are in the past", () => {
    const now = new Date("2026-05-16T00:00:00"); // day after final exam
    const next = getNextMilestone(now);
    expect(next).toBeNull();
  });

  it("returns null exactly at the moment past the last milestone", () => {
    const now = new Date("2026-05-15T12:00:01"); // 1s after CSA start
    const next = getNextMilestone(now);
    expect(next).toBeNull();
  });

  it("uses default `now` when not provided (smoke check)", () => {
    // Don't assert specific value — just verify the function runs.
    // Result depends on when the test runs; pre-May 2026 all four
    // are upcoming, post-May 2026 none are.
    expect(() => getNextMilestone()).not.toThrow();
  });
});
