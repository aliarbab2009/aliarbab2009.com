"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * <MaglockParticleField /> — ports the Flutter app's ambient particle
 * background (lib/widgets/particle_background.dart) to a HTML canvas.
 *
 * What renders, in order, every frame:
 *   1. Radial gradient bg from upper-left (#07070F → #030306)
 *   2. Grid: 20 vertical + 35 horizontal cells at green@3% opacity,
 *      plus 4 thirds-lines at green@6% (matches the "HUD lines" feel
 *      of the Flutter source)
 *   3. 40 particles drifting at vx ±0.00006, vy ±0.00004 per frame,
 *      bouncing off walls. 4-colour palette weighted ~50% green / 25%
 *      cyan / 25% purple-ish (the Flutter source uses #C77DFF; we
 *      collapse to var(--color-secondary) cyan since the brutalist
 *      site doesn't expose purple). Each particle has a soft glow via
 *      ctx.shadowBlur.
 *   4. Vertical scan-line band, 80px tall, sweeping top→bottom every
 *      ~3s. Subtle (linear gradient transparent → green@8% → transparent).
 *
 * Reduced-motion handling (NEW vs Flutter, which had none):
 *   - Drops particle count to 15
 *   - Disables the scan-line sweep entirely
 *   - Renders one static frame and stops the rAF loop
 *
 * Mount as `position: absolute; inset: 0` behind hero/section content.
 * Always render `aria-hidden="true"` — purely decorative.
 */

type Particle = {
  x: number; // normalized [0, 1]
  y: number;
  vx: number;
  vy: number;
  size: number; // px
  opacity: number; // 0..1
  hue: "green" | "cyan" | "purple" | "green-dim";
};

const PARTICLE_COUNT = 40;
const REDUCED_MOTION_PARTICLE_COUNT = 15;
const SCAN_LINE_HEIGHT_PX = 80;
const SCAN_LINE_PERIOD_MS = 3000;

// Hue mapping at the source-level (independent of the data-theme flip,
// since maglock-themed surfaces stay dark-only via design choice).
const HUE_HEX: Record<Particle["hue"], string> = {
  green: "rgb(0, 255, 157)", // --color-primary
  cyan: "rgb(0, 212, 255)", // --color-secondary
  purple: "rgb(199, 125, 255)", // --color-accent-purple (not in tokens; literal)
  "green-dim": "rgb(0, 200, 130)", // dimmer green
};

function pickHue(): Particle["hue"] {
  // Roughly: 50% green, 25% cyan, 15% purple, 10% green-dim.
  const r = Math.random();
  if (r < 0.5) return "green";
  if (r < 0.75) return "cyan";
  if (r < 0.9) return "purple";
  return "green-dim";
}

function makeParticle(): Particle {
  return {
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00012, // ± 0.00006 per frame
    vy: (Math.random() - 0.5) * 0.00008, // ± 0.00004 per frame
    size: 0.5 + Math.random() * 2.5,
    opacity: 0.2 + Math.random() * 0.6,
    hue: pickHue(),
  };
}

export function MaglockParticleField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = reducedMotion ? REDUCED_MOTION_PARTICLE_COUNT : PARTICLE_COUNT;
    particlesRef.current = Array.from({ length: count }, makeParticle);

    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const drawBg = () => {
      // Radial gradient from upper-left
      const grad = ctx.createRadialGradient(
        width * 0.2,
        height * 0.2,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.9,
      );
      grad.addColorStop(0, "#07070F");
      grad.addColorStop(1, "#030306");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    };

    const drawGrid = () => {
      // Fine grid at green@3% opacity, 20 cols × 35 rows
      ctx.strokeStyle = "rgba(0, 255, 157, 0.03)";
      ctx.lineWidth = 0.5;
      const cols = 20;
      const rows = 35;
      for (let i = 1; i < cols; i += 1) {
        const x = (width * i) / cols;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let j = 1; j < rows; j += 1) {
        const y = (height * j) / rows;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Thirds lines at green@6%, 1px
      ctx.strokeStyle = "rgba(0, 255, 157, 0.06)";
      ctx.lineWidth = 1;
      [width / 3, (2 * width) / 3].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      });
      [height / 3, (2 * height) / 3].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      });
    };

    const drawParticles = () => {
      for (const p of particlesRef.current) {
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        // Wall bounce
        if (p.x <= 0 || p.x >= 1) p.vx = -p.vx;
        if (p.y <= 0 || p.y >= 1) p.vy = -p.vy;
        p.x = Math.max(0, Math.min(1, p.x));
        p.y = Math.max(0, Math.min(1, p.y));

        const px = p.x * width;
        const py = p.y * height;
        ctx.save();
        ctx.fillStyle = HUE_HEX[p.hue];
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = 4;
        ctx.shadowColor = HUE_HEX[p.hue];
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const drawScanLine = (now: number) => {
      const t = ((now - startTimeRef.current) % SCAN_LINE_PERIOD_MS) / SCAN_LINE_PERIOD_MS;
      const y = t * (height + SCAN_LINE_HEIGHT_PX) - SCAN_LINE_HEIGHT_PX;
      const grad = ctx.createLinearGradient(0, y, 0, y + SCAN_LINE_HEIGHT_PX);
      grad.addColorStop(0, "rgba(0, 255, 157, 0)");
      grad.addColorStop(0.5, "rgba(0, 255, 157, 0.08)");
      grad.addColorStop(1, "rgba(0, 255, 157, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, y, width, SCAN_LINE_HEIGHT_PX);
    };

    const tick = (now: number) => {
      drawBg();
      drawGrid();
      drawParticles();
      if (!reducedMotion) drawScanLine(now);
      rafRef.current = requestAnimationFrame(tick);
    };

    if (reducedMotion) {
      // Single static frame, no rAF loop.
      drawBg();
      drawGrid();
      drawParticles();
    } else {
      startTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("h-full w-full", className)}
      style={{ pointerEvents: "none" }}
    />
  );
}
