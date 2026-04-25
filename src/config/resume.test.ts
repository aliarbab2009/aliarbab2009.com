import { describe, expect, it } from "vitest";

import { RESUME } from "./resume";

/**
 * RESUME holds the prose-y bits of the resume that don't already live
 * in milestones/projects/activities/awards. ResumeEmbed assembles
 * everything; tests here protect the shape of THIS file.
 */

describe("RESUME content", () => {
  it("summary is a non-empty 1-3-sentence pitch", () => {
    expect(RESUME.summary.length).toBeGreaterThan(50);
    expect(RESUME.summary.length).toBeLessThan(500);
  });

  it("coursework is at least one line of substance", () => {
    expect(RESUME.coursework.length).toBeGreaterThan(0);
    for (const line of RESUME.coursework) {
      expect(line.length).toBeGreaterThan(20);
    }
  });

  it("has at least 3 skill groups (covers Languages + Frameworks + at least one more)", () => {
    expect(RESUME.skillGroups.length).toBeGreaterThanOrEqual(3);
  });

  it("every skill group has a non-empty label and at least one item", () => {
    for (const g of RESUME.skillGroups) {
      expect(g.label.length).toBeGreaterThan(0);
      expect(g.items.length).toBeGreaterThan(0);
    }
  });

  it("hasPDF is a boolean and pdfFilename is a non-empty .pdf path", () => {
    expect(typeof RESUME.hasPDF).toBe("boolean");
    expect(RESUME.pdfFilename).toMatch(/\.pdf$/);
    expect(RESUME.pdfFilename.length).toBeGreaterThan(4); // longer than just '.pdf'
  });

  it("no skill item is suspiciously long (resume pills must fit one line)", () => {
    for (const g of RESUME.skillGroups) {
      for (const item of g.items) {
        expect(item.length).toBeLessThanOrEqual(50);
      }
    }
  });

  it("no entry contains plausible school-name patterns (privacy gate)", () => {
    const suspicious = /(?:[A-Z][a-z]+ )+(?:School|Academy|Institute|College)\b/;
    expect(RESUME.summary).not.toMatch(suspicious);
    for (const line of RESUME.coursework) {
      expect(line).not.toMatch(suspicious);
    }
  });
});
