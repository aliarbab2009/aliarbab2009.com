import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatDateRange } from "./format-date-range";

/**
 * formatDateRange depends on `new Date().getFullYear()` for the
 * "ongoing matches current year" branch. Tests freeze the clock with
 * vi.useFakeTimers so results stay deterministic regardless of when
 * the test runs.
 */

describe("formatDateRange", () => {
  beforeEach(() => {
    // Freeze "now" to a known date inside 2026 for the duration of each test.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-25T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'from–to' when both endpoints provided", () => {
    expect(formatDateRange("2024", "2025")).toBe("2024–2025");
  });

  it("preserves YYYY-MM granularity in both endpoints", () => {
    expect(formatDateRange("2024-09", "2025-06")).toBe("2024-09–2025-06");
  });

  it("returns bare year when ongoing AND from matches current year", () => {
    expect(formatDateRange("2026")).toBe("2026");
  });

  it("returns 'from–present' when ongoing AND from is a past year", () => {
    expect(formatDateRange("2024")).toBe("2024–present");
  });

  it("returns 'from–present' even when from is YYYY-MM in a past year", () => {
    expect(formatDateRange("2024-09")).toBe("2024-09–present");
  });

  it("does not throw on identical from/to", () => {
    expect(formatDateRange("2025", "2025")).toBe("2025–2025");
  });

  it("treats undefined `to` the same as omitted `to`", () => {
    expect(formatDateRange("2026", undefined)).toBe("2026");
  });
});
