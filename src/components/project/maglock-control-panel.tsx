"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * <MagLockControlPanel /> — interactive client-only mockup of the MagLock
 * Flutter app's door control surface. Hoisted above the fold on the
 * /projects/maglock page so visitors immediately see the system "do
 * something" rather than reading nine sections about it first.
 *
 * Mirrors the actual app's behaviour for show, not the wire protocol:
 *   - Two doors with locked / unlocked / transitioning tri-state.
 *   - 30s auto-lock countdown that decrements every second while
 *     unlocked, and snaps the door back to locked at zero.
 *   - 300ms transition window between states (hardware relay debounce
 *     expressed at the UI layer — same pattern as the real app's
 *     800ms refractory period, halved for snappier demo feel).
 *   - Activity log strip that tails the last five events, one line each,
 *     timestamped HH:MM:SS in VT323.
 *   - Connection-status bar that blinks "RECONNECTING…" amber for 800ms
 *     every 8s — pure visual life, never disconnects in the demo.
 *
 * No network calls, ever. Pure local state. The component is safe to
 * import from any server component because of the "use client" directive
 * at the top — Next renders the surrounding section on the server and
 * hydrates this island.
 */

type DoorState = "locked" | "unlocked" | "transitioning";
type ConnectionStatus = "connected" | "connecting" | "disconnected";

type DoorId = 1 | 2;

type LogEntry = {
  id: number;
  timestamp: string;
  text: string;
};

type State = {
  door1: DoorState;
  door2: DoorState;
  countdown1: number;
  countdown2: number;
  connection: ConnectionStatus;
  log: LogEntry[];
  logCounter: number;
};

type Action =
  | { type: "BEGIN_TRANSITION"; door: DoorId }
  | { type: "FINISH_TRANSITION"; door: DoorId; nextState: "locked" | "unlocked" }
  | { type: "TICK_COUNTDOWN"; door: DoorId }
  | { type: "SET_CONNECTION"; status: ConnectionStatus };

const AUTO_LOCK_SECONDS = 30;
const TRANSITION_MS = 300;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function nowHHMMSS(): string {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function pushLog(state: State, text: string): State {
  const entry: LogEntry = {
    id: state.logCounter + 1,
    timestamp: nowHHMMSS(),
    text,
  };
  const next = [entry, ...state.log].slice(0, 5);
  return { ...state, log: next, logCounter: state.logCounter + 1 };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "BEGIN_TRANSITION": {
      if (action.door === 1) return { ...state, door1: "transitioning" };
      return { ...state, door2: "transitioning" };
    }
    case "FINISH_TRANSITION": {
      const isUnlock = action.nextState === "unlocked";
      const text = `DOOR ${action.door} ${isUnlock ? "UNLOCKED" : "LOCKED"}`;
      const updated = pushLog(state, text);
      if (action.door === 1) {
        return {
          ...updated,
          door1: action.nextState,
          countdown1: isUnlock ? AUTO_LOCK_SECONDS : 0,
        };
      }
      return {
        ...updated,
        door2: action.nextState,
        countdown2: isUnlock ? AUTO_LOCK_SECONDS : 0,
      };
    }
    case "TICK_COUNTDOWN": {
      if (action.door === 1) {
        const next = Math.max(0, state.countdown1 - 1);
        return { ...state, countdown1: next };
      }
      const next = Math.max(0, state.countdown2 - 1);
      return { ...state, countdown2: next };
    }
    case "SET_CONNECTION": {
      return { ...state, connection: action.status };
    }
  }
}

const INITIAL_STATE: State = {
  door1: "locked",
  door2: "locked",
  countdown1: 0,
  countdown2: 0,
  connection: "connected",
  log: [],
  logCounter: 0,
};

export default function MagLockControlPanel() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Track mount for cleanup of timeouts so we don't dispatch after unmount.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Detect reduced-motion preference for the lock-icon morph + connection
  // flicker. We don't disable interactivity, just tone down the motion.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto-lock countdown ticker — one shared 1s interval that decrements
  // any door currently unlocked. Cheaper than two intervals and avoids
  // any drift between them.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!mountedRef.current) return;
      // We dispatch one tick per door each second; the reducer clamps at 0.
      dispatch({ type: "TICK_COUNTDOWN", door: 1 });
      dispatch({ type: "TICK_COUNTDOWN", door: 2 });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Auto-lock trigger — when an unlocked door's countdown hits 0, queue
  // the relock transition. Done as an effect on the state so we react
  // exactly once per zero-crossing and not on every tick.
  useEffect(() => {
    if (state.door1 === "unlocked" && state.countdown1 === 0) {
      dispatch({ type: "BEGIN_TRANSITION", door: 1 });
      const t = window.setTimeout(() => {
        if (!mountedRef.current) return;
        dispatch({ type: "FINISH_TRANSITION", door: 1, nextState: "locked" });
      }, TRANSITION_MS);
      return () => window.clearTimeout(t);
    }
  }, [state.door1, state.countdown1]);

  useEffect(() => {
    if (state.door2 === "unlocked" && state.countdown2 === 0) {
      dispatch({ type: "BEGIN_TRANSITION", door: 2 });
      const t = window.setTimeout(() => {
        if (!mountedRef.current) return;
        dispatch({ type: "FINISH_TRANSITION", door: 2, nextState: "locked" });
      }, TRANSITION_MS);
      return () => window.clearTimeout(t);
    }
  }, [state.door2, state.countdown2]);

  // Connection flicker — every 8s, dip to "connecting" amber for 800ms
  // then back to "connected" green. Pure visual life. Skipped under
  // reduced-motion to avoid colour churn.
  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      if (!mountedRef.current) return;
      dispatch({ type: "SET_CONNECTION", status: "connecting" });
      window.setTimeout(() => {
        if (!mountedRef.current) return;
        dispatch({ type: "SET_CONNECTION", status: "connected" });
      }, 800);
    }, 8000);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  const click1 = useCallback(() => {
    if (state.door1 === "transitioning") return;
    const target: "locked" | "unlocked" = state.door1 === "locked" ? "unlocked" : "locked";
    dispatch({ type: "BEGIN_TRANSITION", door: 1 });
    window.setTimeout(() => {
      if (!mountedRef.current) return;
      dispatch({ type: "FINISH_TRANSITION", door: 1, nextState: target });
    }, TRANSITION_MS);
  }, [state.door1]);

  const click2 = useCallback(() => {
    if (state.door2 === "transitioning") return;
    const target: "locked" | "unlocked" = state.door2 === "locked" ? "unlocked" : "locked";
    dispatch({ type: "BEGIN_TRANSITION", door: 2 });
    window.setTimeout(() => {
      if (!mountedRef.current) return;
      dispatch({ type: "FINISH_TRANSITION", door: 2, nextState: target });
    }, TRANSITION_MS);
  }, [state.door2]);

  const connectionLabel = useMemo(() => {
    if (state.connection === "connecting") return "MAGLOCK //RECONNECTING…";
    if (state.connection === "disconnected") return "MAGLOCK //DISCONNECTED";
    return "MAGLOCK //CONNECTED";
  }, [state.connection]);

  const connectionColor =
    state.connection === "connecting"
      ? "var(--color-warning)"
      : state.connection === "disconnected"
        ? "var(--color-danger)"
        : "var(--color-primary)";

  return (
    <div
      data-maglock-brackets
      className="w-full border-2 bg-black"
      style={{
        borderColor: "var(--color-primary)",
        boxShadow: "var(--glow-green)",
      }}
      aria-label="MagLock interactive door control panel"
    >
      {/* Connection status bar */}
      <div
        className="flex items-center justify-between border-b-2 px-4 py-3"
        style={{
          borderColor: "color-mix(in srgb, var(--color-primary) 40%, transparent)",
        }}
      >
        <span
          className="flex items-center gap-2"
          style={{
            fontFamily: "var(--font-orbitron), var(--font-display)",
            fontSize: "12px",
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: connectionColor,
            transition: "color 240ms ease",
          }}
        >
          <span
            data-maglock-pulse={state.connection === "connected" ? "" : undefined}
            aria-hidden
            className="inline-block h-2 w-2 rounded-full"
            style={{
              background: connectionColor,
              boxShadow: `0 0 8px ${connectionColor}`,
              transition: "background 240ms ease, box-shadow 240ms ease",
            }}
          />
          {connectionLabel}
        </span>
        <span
          style={{
            fontFamily: "var(--font-vt323), var(--font-mono)",
            fontSize: "16px",
            color: "var(--color-secondary)",
            letterSpacing: "0.05em",
          }}
        >
          192.168.4.100:80
        </span>
      </div>

      {/* Two door cards */}
      <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
        <DoorCard
          id={1}
          state={state.door1}
          countdown={state.countdown1}
          onToggle={click1}
          reducedMotion={reducedMotion}
          isFirst
        />
        <DoorCard
          id={2}
          state={state.door2}
          countdown={state.countdown2}
          onToggle={click2}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Activity log strip */}
      <div
        className="border-t-2 px-4 py-2"
        style={{
          borderColor: "color-mix(in srgb, var(--color-primary) 40%, transparent)",
          background: "color-mix(in srgb, var(--color-primary) 4%, transparent)",
          minHeight: "92px",
        }}
        aria-live="polite"
        aria-label="Recent door activity"
      >
        {state.log.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-vt323), var(--font-mono)",
              fontSize: "14px",
              color: "color-mix(in srgb, var(--color-primary) 50%, var(--color-muted))",
              letterSpacing: "0.05em",
            }}
          >
            ▷ idle — tap a door to begin
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {state.log.map((entry) => (
              <li
                key={entry.id}
                style={{
                  fontFamily: "var(--font-vt323), var(--font-mono)",
                  fontSize: "14px",
                  color: "color-mix(in srgb, var(--color-primary) 80%, var(--color-fg))",
                  letterSpacing: "0.05em",
                }}
              >
                <span aria-hidden>▷ </span>
                {entry.timestamp} — {entry.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type DoorCardProps = {
  id: DoorId;
  state: DoorState;
  countdown: number;
  onToggle: () => void;
  reducedMotion: boolean;
  isFirst?: boolean;
};

function DoorCard({ id, state, countdown, onToggle, reducedMotion, isFirst }: DoorCardProps) {
  const isUnlocked = state === "unlocked";
  const isTransitioning = state === "transitioning";
  // Visual state for the data-attribute cascade: while transitioning,
  // we render in the "connecting" amber palette to show in-flight work.
  const visualState: "locked" | "unlocked" | "connecting" = isTransitioning
    ? "connecting"
    : isUnlocked
      ? "unlocked"
      : "locked";

  const accent =
    visualState === "unlocked"
      ? "var(--color-primary)"
      : visualState === "connecting"
        ? "var(--color-warning)"
        : "var(--color-danger)";

  const bgRadialColor =
    visualState === "unlocked"
      ? "var(--color-primary)"
      : visualState === "connecting"
        ? "var(--color-warning)"
        : "var(--color-danger)";

  const stateLabel = isTransitioning ? "TRANSITIONING…" : isUnlocked ? "UNLOCKED" : "LOCKED";

  const buttonLabel = isTransitioning ? "…" : isUnlocked ? "LOCK NOW" : "UNLOCK";

  return (
    <div
      data-maglock-state={visualState}
      data-maglock-brackets
      className={cn(
        "flex flex-col items-center gap-3 p-5 transition-colors duration-300",
        isFirst ? "border-b-2 sm:border-r-2 sm:border-b-0" : "",
      )}
      style={{
        borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
        background: `radial-gradient(circle at 50% 30%, color-mix(in srgb, ${bgRadialColor} 8%, transparent), transparent 70%)`,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-orbitron), var(--font-display)",
          fontSize: "20px",
          fontWeight: 700,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: accent,
          transition: "color 240ms ease",
        }}
      >
        DOOR {id}
      </p>

      <LockIcon state={visualState} reducedMotion={reducedMotion} />

      <p
        className="flex items-center gap-2"
        style={{
          fontFamily: "var(--font-orbitron), var(--font-display)",
          fontSize: "13px",
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: accent,
          transition: "color 240ms ease",
        }}
      >
        <span
          data-maglock-pulse={isUnlocked ? "" : undefined}
          aria-hidden
          className="inline-block h-2 w-2 rounded-full"
          style={{
            background: accent,
            boxShadow: isUnlocked ? `0 0 8px ${accent}` : "none",
            opacity: isUnlocked ? 1 : 0.7,
          }}
        />
        {stateLabel}
      </p>

      <p
        style={{
          fontFamily: "var(--font-vt323), var(--font-mono)",
          fontSize: "14px",
          color: "color-mix(in srgb, var(--color-primary) 70%, var(--color-muted))",
          letterSpacing: "0.1em",
          minHeight: "1.2em",
          opacity: isUnlocked && countdown > 0 ? 1 : 0,
          transition: "opacity 240ms ease",
        }}
        aria-hidden={!(isUnlocked && countdown > 0)}
      >
        AUTO-LOCK IN {countdown}s
      </p>

      <button
        type="button"
        onClick={onToggle}
        disabled={isTransitioning}
        className="mt-1 px-4 py-2 transition-colors duration-300"
        style={{
          fontFamily: "var(--font-orbitron), var(--font-display)",
          fontSize: "11px",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          border: `2px solid ${accent}`,
          color: accent,
          background: "transparent",
          boxShadow: `inset 0 0 8px color-mix(in srgb, ${accent} 25%, transparent)`,
          cursor: isTransitioning ? "wait" : "pointer",
          opacity: isTransitioning ? 0.6 : 1,
        }}
        aria-label={`${buttonLabel} door ${id}`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

type LockIconProps = {
  state: "locked" | "unlocked" | "connecting";
  reducedMotion: boolean;
};

/**
 * Three concentric circles surround a padlock body. The shackle path
 * morphs between a closed "U" (locked) and a tilted/raised "U" (unlocked)
 * via a CSS transform on the inner <g>. Reduced-motion users get the
 * snap-to-state version with no transition.
 */
function LockIcon({ state, reducedMotion }: LockIconProps) {
  const accent =
    state === "unlocked"
      ? "var(--color-primary)"
      : state === "connecting"
        ? "var(--color-warning)"
        : "var(--color-danger)";

  const isUnlocked = state === "unlocked";

  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      aria-hidden
      fill="none"
      stroke="currentColor"
      style={{
        color: accent,
        transition: "color 300ms ease",
      }}
    >
      <circle
        cx="36"
        cy="36"
        r="32"
        strokeWidth="1.5"
        opacity="0.4"
        className={isUnlocked && !reducedMotion ? "animate-pulse" : ""}
      />
      <circle cx="36" cy="36" r="22" strokeWidth="2" opacity="0.7" />
      {/* Padlock body — same in both states. */}
      <rect x="26" y="32" width="20" height="16" strokeWidth="2" rx="0" />
      {/* Shackle — morphs via transform-origin pivot at base-right of the
         arc. Closed (locked): bottom of "U" sits flush with body top.
         Open (unlocked): rotate the shackle 18° + lift 2px so the left
         leg lifts off the body. Pure CSS transform — no Framer needed. */}
      <g
        style={{
          transformOrigin: "42px 32px",
          transform: isUnlocked ? "rotate(-18deg) translateY(-2px)" : "rotate(0deg)",
          transition: reducedMotion ? "none" : "transform 300ms ease",
        }}
      >
        <path
          d="M30 32 V24 a6 6 0 0 1 12 0 V32"
          strokeWidth="2"
          strokeLinecap="square"
          fill="none"
        />
      </g>
      <line x1="36" y1="38" x2="36" y2="44" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}
