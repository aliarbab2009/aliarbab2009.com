"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * <MaglockCameraFeed /> — ports the Flutter app's MJPEG camera-feed
 * widget (lib/widgets/camera_feed_widget.dart) to a React TSX
 * component. Standalone client component, no network calls.
 *
 * Visual structure (left → right inside the panel):
 *   - Feed area: black bg, cyan@35% border, sweeping scan-line,
 *     CRT-scanline overlay, four corner brackets, top status row
 *     (dot + label + last-snap name + camIp), bottom controls
 *     (flash toggle, snapshot button, fullscreen toggle, refresh).
 *   - Vertical flash slider on the right edge (only shown when
 *     status === "connected"), 0–100%, amber thumb + amber track,
 *     value label below.
 *   - Decorative resize handle pill below the panel.
 *
 * State machine:
 *   - status: connecting | connected | offline | error
 *     (default "connected" so the demo shows the cyan/scanline life)
 *   - flashLevel: 0–1
 *   - flashOn: bool
 *   - expanded: bool (fullscreen toggle multiplies panel height ×1.8)
 *   - takingSnap: bool (flash overlay + spinner replaces snap button)
 *   - lastSnap: string | null (filename appears in top-right)
 *
 * Snapshot button simulates a flash + adds a "snap_<HH-MM-SS>.jpg"
 * filename to the top row. Pure local state, no network.
 *
 * No real MJPEG stream — we render an SVG poster (a stylised door
 * silhouette in the cyberpunk palette) as the static frame. When
 * Ali ever ports a real ESP32-CAM screenshot, drop it at
 * /projects/maglock/camera-poster.jpg and pass it via posterSrc.
 */

type Status = "connecting" | "connected" | "offline" | "error";

type Props = {
  defaultStatus?: Status;
  camIp?: string;
  posterSrc?: string;
};

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function nowSnapName(): string {
  const d = new Date();
  return `snap_${pad2(d.getHours())}-${pad2(d.getMinutes())}-${pad2(d.getSeconds())}.jpg`;
}

const STATUS_LABEL: Record<Status, string> = {
  connecting: "CONNECTING…",
  connected: "● LIVE",
  offline: "OFFLINE",
  error: "ERROR",
};

const STATUS_COLOR: Record<Status, string> = {
  connecting: "var(--color-warning)",
  connected: "var(--color-primary)",
  offline: "var(--color-danger)",
  error: "var(--color-danger)",
};

export function MaglockCameraFeed({
  defaultStatus = "connected",
  camIp = "192.168.4.1",
  posterSrc,
}: Props = {}) {
  const [status, setStatus] = useState<Status>(defaultStatus);
  const [flashLevel, setFlashLevel] = useState(0);
  const [flashOn, setFlashOn] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [takingSnap, setTakingSnap] = useState(false);
  const [lastSnap, setLastSnap] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Periodic flicker like the Flutter app's 8s reconnect dance — only
  // when the demo is in "connected" state and reduced-motion isn't set.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!mountedRef.current) return;
      setStatus((prev) => (prev === "connected" ? "connecting" : prev));
      window.setTimeout(() => {
        if (!mountedRef.current) return;
        setStatus("connected");
      }, 600);
    }, 9000);
    return () => window.clearInterval(id);
  }, []);

  const onSnap = useCallback(() => {
    if (status !== "connected" || takingSnap) return;
    setTakingSnap(true);
    window.setTimeout(() => {
      if (!mountedRef.current) return;
      setTakingSnap(false);
      setLastSnap(nowSnapName());
    }, 350);
  }, [status, takingSnap]);

  const onRefresh = useCallback(() => {
    if (status === "connected") return;
    setStatus("connecting");
    window.setTimeout(() => {
      if (!mountedRef.current) return;
      setStatus("connected");
    }, 1200);
  }, [status]);

  const panelHeight = expanded ? 504 : 280;
  const accent = STATUS_COLOR[status];

  return (
    <div data-maglock-camera-feed className="flex flex-col">
      <div className="flex items-stretch gap-2" style={{ height: panelHeight }}>
        {/* FEED PANEL */}
        <div
          className="relative flex-1 overflow-hidden bg-black"
          style={{
            border: `1px solid color-mix(in srgb, ${accent} 35%, transparent)`,
            boxShadow:
              status === "connected"
                ? `0 0 18px color-mix(in srgb, var(--color-secondary) 22%, transparent)`
                : "none",
            transition: "border-color 240ms ease, box-shadow 240ms ease",
          }}
        >
          {/* Poster image OR placeholder door silhouette */}
          {posterSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterSrc}
              alt="ESP32-CAM static poster frame"
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />
          ) : (
            <DoorPosterPlaceholder />
          )}

          {/* CRT scan-lines overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0) 0 2px, rgba(0,0,0,0.15) 2px 3px)",
              mixBlendMode: "multiply",
            }}
          />

          {/* Animated horizontal scan sweep (only while connected) */}
          {status === "connected" && (
            <div
              aria-hidden
              data-maglock-camera-sweep
              className="pointer-events-none absolute inset-x-0 h-1"
              style={{
                background: `linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-secondary) 50%, transparent), transparent)`,
              }}
            />
          )}

          {/* Snapshot flash */}
          {takingSnap && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: "rgba(255,255,255,0.22)" }}
            />
          )}

          {/* Corner brackets */}
          <CornerBrackets accent={accent} />

          {/* TOP STATUS ROW */}
          <div className="absolute inset-x-2 top-2 flex items-center gap-2">
            <span
              data-maglock-pulse={status === "connected" ? "" : undefined}
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background: accent,
                boxShadow: status === "connected" ? `0 0 6px ${accent}` : "none",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-orbitron), var(--font-display)",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.25em",
                color: accent,
                textTransform: "uppercase",
              }}
            >
              {STATUS_LABEL[status]}
            </span>
            <span className="ml-auto" />
            {lastSnap && (
              <span
                style={{
                  fontFamily: "var(--font-vt323), var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.05em",
                  color: "var(--color-secondary)",
                }}
              >
                ▷ {lastSnap}
              </span>
            )}
            <span
              style={{
                fontFamily: "var(--font-vt323), var(--font-mono)",
                fontSize: "12px",
                letterSpacing: "0.05em",
                color: "var(--color-secondary)",
              }}
            >
              {camIp}:80
            </span>
          </div>

          {/* BOTTOM CONTROLS */}
          <div className="absolute inset-x-2 bottom-2 flex items-center gap-2">
            <IconControl
              label="Flash"
              onClick={() => setFlashOn((v) => !v)}
              active={flashOn}
              activeColor="var(--color-warning)"
              icon={<FlashIcon />}
            />
            <IconControl
              label={takingSnap ? "Capturing" : "Snapshot"}
              onClick={onSnap}
              active={takingSnap}
              activeColor="var(--color-secondary)"
              icon={takingSnap ? <Spinner /> : <CameraIcon />}
              disabled={status !== "connected" || takingSnap}
            />
            <span className="ml-auto" />
            {status === "offline" && (
              <IconControl
                label="Refresh"
                onClick={onRefresh}
                activeColor="var(--color-secondary)"
                icon={<RefreshIcon />}
              />
            )}
            <IconControl
              label={expanded ? "Minimize" : "Fullscreen"}
              onClick={() => setExpanded((v) => !v)}
              activeColor="var(--color-secondary)"
              icon={expanded ? <MinimizeIcon /> : <MaximizeIcon />}
            />
          </div>
        </div>

        {/* VERTICAL FLASH SLIDER (only when connected) */}
        {status === "connected" && (
          <div className="flex w-12 flex-col items-center justify-center gap-2 px-1">
            <FlashIcon
              style={{
                color: flashLevel > 0 ? "var(--color-warning)" : "var(--color-muted)",
                width: 12,
                height: 12,
              }}
            />
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(flashLevel * 100)}
              onChange={(e) => setFlashLevel(Number(e.target.value) / 100)}
              aria-label="ESP32-CAM flash brightness"
              data-maglock-camera-flash-slider
              style={{
                writingMode: "vertical-lr",
                direction: "rtl",
                width: 6,
                height: "60%",
                accentColor: "var(--color-warning)",
                background: "transparent",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-vt323), var(--font-mono)",
                fontSize: "11px",
                color: flashLevel > 0 ? "var(--color-warning)" : "var(--color-muted)",
                letterSpacing: "0.05em",
              }}
            >
              {Math.round(flashLevel * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Decorative resize handle */}
      <div className="flex h-4 items-center justify-center">
        <span
          aria-hidden
          className="block h-1 w-12"
          style={{ background: "var(--color-border)" }}
        />
      </div>
    </div>
  );
}

/* ─────────────────── Sub-components ─────────────────── */

function CornerBrackets({ accent }: { accent: string }) {
  const len = 18;
  const w = 2;
  const c = `color-mix(in srgb, ${accent} 60%, transparent)`;
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* top-left */}
      <span
        className="absolute"
        style={{ top: 6, left: 6, width: len, height: w, background: c }}
      />
      <span
        className="absolute"
        style={{ top: 6, left: 6, width: w, height: len, background: c }}
      />
      {/* top-right */}
      <span
        className="absolute"
        style={{ top: 6, right: 6, width: len, height: w, background: c }}
      />
      <span
        className="absolute"
        style={{ top: 6, right: 6, width: w, height: len, background: c }}
      />
      {/* bottom-left */}
      <span
        className="absolute"
        style={{ bottom: 6, left: 6, width: len, height: w, background: c }}
      />
      <span
        className="absolute"
        style={{ bottom: 6, left: 6, width: w, height: len, background: c }}
      />
      {/* bottom-right */}
      <span
        className="absolute"
        style={{ bottom: 6, right: 6, width: len, height: w, background: c }}
      />
      <span
        className="absolute"
        style={{ bottom: 6, right: 6, width: w, height: len, background: c }}
      />
    </div>
  );
}

type IconControlProps = {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  active?: boolean;
  activeColor: string;
  disabled?: boolean;
};

function IconControl({
  label,
  onClick,
  icon,
  active = false,
  activeColor,
  disabled = false,
}: IconControlProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex h-7 w-7 items-center justify-center"
      style={{
        border: `1px solid ${active ? activeColor : "color-mix(in srgb, var(--color-border) 80%, transparent)"}`,
        background: "rgba(10, 10, 21, 0.85)",
        color: active ? activeColor : "var(--color-muted)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "color 200ms ease, border-color 200ms ease",
      }}
    >
      {icon}
    </button>
  );
}

function DoorPosterPlaceholder() {
  // Stylised "ESP32-CAM looking at a door" silhouette so the demo
  // has something to look at without a real MJPEG frame.
  return (
    <svg
      aria-hidden
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="maglock-cam-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0a15" />
          <stop offset="1" stopColor="#02020a" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#maglock-cam-floor)" />
      {/* floor line */}
      <line x1="0" y1="240" x2="400" y2="240" stroke="rgba(0,255,157,0.2)" strokeWidth="1" />
      {/* door frame */}
      <rect
        x="155"
        y="60"
        width="90"
        height="180"
        fill="none"
        stroke="rgba(0,212,255,0.4)"
        strokeWidth="2"
      />
      {/* door panel */}
      <rect
        x="160"
        y="65"
        width="80"
        height="170"
        fill="rgba(10,10,21,0.6)"
        stroke="rgba(0,255,157,0.25)"
        strokeWidth="1"
      />
      {/* knob */}
      <circle cx="232" cy="155" r="3" fill="rgba(0,212,255,0.7)" />
      {/* corner reflection */}
      <line x1="160" y1="65" x2="180" y2="85" stroke="rgba(0,255,157,0.2)" strokeWidth="0.5" />
    </svg>
  );
}

/* ─────────────────── Inline icons ─────────────────── */

function FlashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function CameraIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function MaximizeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function MinimizeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="14" y1="10" x2="21" y2="3" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 animate-spin border-2 border-current border-t-transparent"
      style={{ borderRadius: "50%" }}
    />
  );
}
