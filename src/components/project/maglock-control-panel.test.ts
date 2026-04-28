import { describe, expect, it } from "vitest";

import {
  AUTO_LOCK_DEFAULT_SECONDS,
  AUTO_LOCK_MAX_SECONDS,
  AUTO_LOCK_MIN_SECONDS,
  INITIAL_STATE,
  reducer,
} from "./maglock-control-panel";

/**
 * Reducer-level tests for <MagLockControlPanel>.
 *
 * The reducer is the source of truth for the door state machine; the
 * effects in the component just dispatch into it. These tests lock in
 * the contract that fixed the "door froze in TRANSITIONING forever"
 * bug — specifically that BEGIN_TRANSITION stores the target in
 * pending, and FINISH_TRANSITION reads it back.
 */
describe("maglock reducer — transition pipeline", () => {
  it("BEGIN_TRANSITION moves door to transitioning + records target in pending", () => {
    const next = reducer(INITIAL_STATE, {
      type: "BEGIN_TRANSITION",
      door: 1,
      target: "unlocked",
    });
    expect(next.door1).toBe("transitioning");
    expect(next.pending1).toBe("unlocked");
    // Door 2 untouched.
    expect(next.door2).toBe("locked");
    expect(next.pending2).toBeNull();
  });

  it("FINISH_TRANSITION resolves to whatever was pending", () => {
    const mid = reducer(INITIAL_STATE, {
      type: "BEGIN_TRANSITION",
      door: 1,
      target: "unlocked",
    });
    const next = reducer(mid, { type: "FINISH_TRANSITION", door: 1 });
    expect(next.door1).toBe("unlocked");
    expect(next.pending1).toBeNull();
    expect(next.countdown1).toBe(AUTO_LOCK_DEFAULT_SECONDS);
  });

  it("FINISH_TRANSITION on lock target zeroes countdown + writes log", () => {
    const unlocked = reducer(
      reducer(INITIAL_STATE, { type: "BEGIN_TRANSITION", door: 1, target: "unlocked" }),
      { type: "FINISH_TRANSITION", door: 1 },
    );
    const locking = reducer(unlocked, {
      type: "BEGIN_TRANSITION",
      door: 1,
      target: "locked",
    });
    const locked = reducer(locking, { type: "FINISH_TRANSITION", door: 1 });
    expect(locked.door1).toBe("locked");
    expect(locked.countdown1).toBe(0);
    expect(locked.log[0]?.text).toBe("DOOR 1 LOCKED");
  });

  it("FINISH_TRANSITION with no pending is a safe no-op (race after unmount)", () => {
    // Pending null shouldn't blow up — should return state unchanged.
    const next = reducer(INITIAL_STATE, { type: "FINISH_TRANSITION", door: 1 });
    expect(next).toEqual(INITIAL_STATE);
  });

  it("regression: full unlock -> auto-lock cycle ends in locked, not stuck transitioning", () => {
    // Click unlock
    const a = reducer(INITIAL_STATE, {
      type: "BEGIN_TRANSITION",
      door: 1,
      target: "unlocked",
    });
    const b = reducer(a, { type: "FINISH_TRANSITION", door: 1 });
    expect(b.door1).toBe("unlocked");
    expect(b.countdown1).toBe(AUTO_LOCK_DEFAULT_SECONDS);

    // Auto-lock trigger fires: BEGIN_TRANSITION with target=locked
    const c = reducer(b, { type: "BEGIN_TRANSITION", door: 1, target: "locked" });
    expect(c.door1).toBe("transitioning");
    expect(c.pending1).toBe("locked");

    // Resolver effect's FINISH_TRANSITION fires
    const d = reducer(c, { type: "FINISH_TRANSITION", door: 1 });
    expect(d.door1).toBe("locked");
    expect(d.pending1).toBeNull();
    expect(d.countdown1).toBe(0);
  });
});

describe("maglock reducer — autoLockSeconds slider", () => {
  it("SET_AUTO_LOCK_SECONDS updates state", () => {
    const next = reducer(INITIAL_STATE, { type: "SET_AUTO_LOCK_SECONDS", value: 45 });
    expect(next.autoLockSeconds).toBe(45);
  });

  it("clamps below MIN to MIN", () => {
    const next = reducer(INITIAL_STATE, { type: "SET_AUTO_LOCK_SECONDS", value: -10 });
    expect(next.autoLockSeconds).toBe(AUTO_LOCK_MIN_SECONDS);
  });

  it("clamps above MAX to MAX", () => {
    const next = reducer(INITIAL_STATE, { type: "SET_AUTO_LOCK_SECONDS", value: 9999 });
    expect(next.autoLockSeconds).toBe(AUTO_LOCK_MAX_SECONDS);
  });

  it("rounds fractional values", () => {
    const next = reducer(INITIAL_STATE, { type: "SET_AUTO_LOCK_SECONDS", value: 12.6 });
    expect(next.autoLockSeconds).toBe(13);
  });

  it("default is 10 (matches Flutter app)", () => {
    expect(INITIAL_STATE.autoLockSeconds).toBe(10);
    expect(AUTO_LOCK_DEFAULT_SECONDS).toBe(10);
  });

  it("range matches Flutter app: 3-120", () => {
    expect(AUTO_LOCK_MIN_SECONDS).toBe(3);
    expect(AUTO_LOCK_MAX_SECONDS).toBe(120);
  });

  it("countdown after unlock uses the latest autoLockSeconds (not a stale closure)", () => {
    // Set custom timer
    const customTimer = reducer(INITIAL_STATE, {
      type: "SET_AUTO_LOCK_SECONDS",
      value: 60,
    });
    // Unlock door 1
    const begun = reducer(customTimer, {
      type: "BEGIN_TRANSITION",
      door: 1,
      target: "unlocked",
    });
    const finished = reducer(begun, { type: "FINISH_TRANSITION", door: 1 });
    expect(finished.countdown1).toBe(60);
  });
});

describe("maglock reducer — countdown ticking", () => {
  it("TICK_COUNTDOWN decrements but clamps at 0", () => {
    const at5 = { ...INITIAL_STATE, countdown1: 5 };
    const at4 = reducer(at5, { type: "TICK_COUNTDOWN", door: 1 });
    expect(at4.countdown1).toBe(4);
    const at0 = { ...INITIAL_STATE, countdown1: 0 };
    const stillZero = reducer(at0, { type: "TICK_COUNTDOWN", door: 1 });
    expect(stillZero.countdown1).toBe(0);
  });

  it("TICK_COUNTDOWN only affects the addressed door", () => {
    const start = { ...INITIAL_STATE, countdown1: 10, countdown2: 20 };
    const ticked = reducer(start, { type: "TICK_COUNTDOWN", door: 1 });
    expect(ticked.countdown1).toBe(9);
    expect(ticked.countdown2).toBe(20);
  });
});

describe("maglock reducer — connection status", () => {
  it("SET_CONNECTION updates only the connection field", () => {
    const next = reducer(INITIAL_STATE, {
      type: "SET_CONNECTION",
      status: "connecting",
    });
    expect(next.connection).toBe("connecting");
    expect(next.door1).toBe("locked");
    expect(next.door2).toBe("locked");
  });
});
