"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

/**
 * Toggle button for switching between dark + light brutalist modes.
 *
 * Design history — why this is plain & static:
 *   v1: useState<Theme | null>(null) + placeholder span pre-mount.
 *       Result: hydration mismatch (<span> server, <button> client) +
 *       race window where the first click landed during the swap and
 *       silently no-op'd. User saw "needs 2 clicks to flip themes."
 *   v2 (this version): button always renders, both icons always in
 *       the DOM, CSS shows the right one based on :root[data-theme].
 *       No placeholder, no React state for theme — flip is a pure
 *       attribute write + localStorage persist + custom event so any
 *       sibling toggle (command palette) re-reads. The button is
 *       interactive from first paint, no hydration race possible.
 *
 * Behaviour:
 *   - Reads :root[data-theme] live at click time (set pre-paint by
 *     <ThemeScript>); flips, writes back, persists to localStorage.
 *   - Forces a synchronous style recalc (`void body.offsetHeight`)
 *     after the attribute write to defeat any browser recalc-skip
 *     when the only change is a single attribute on <html> consumed
 *     via var() in arbitrary-value Tailwind classes.
 *   - Dispatches a "themechange" event so the command palette's
 *     theme command stays in sync with this button's aria-label.
 *   - aria-label is generic on first paint ("Toggle theme") and
 *     specialises post-mount via useEffect — accessibility loses
 *     nothing (still labelled) and we avoid any hydration mismatch.
 */
export function ThemeToggle() {
  const [label, setLabel] = useState("Toggle theme");

  useEffect(() => {
    const sync = () => {
      const current: Theme =
        document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      setLabel(current === "dark" ? "Switch to light mode" : "Switch to dark mode");
    };
    sync();
    window.addEventListener("themechange", sync);
    // Catch other tabs flipping localStorage too — admissions officers
    // sometimes have multiple windows open while skimming portfolios.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme") sync();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("themechange", sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const current: Theme = root.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next: Theme = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    // Force synchronous style recalc — defeats Chromium's "skip recalc
    // until next interaction" optimisation for var()-driven token flips.
    void document.body.offsetHeight;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* localStorage may be disabled — ignore */
    }
    // Notify any sibling toggle (command palette) to re-read state.
    window.dispatchEvent(new Event("themechange"));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      data-theme-toggle
      className={cn(
        "no-print",
        "relative inline-flex h-8 w-8 items-center justify-center",
        "border border-[var(--color-border)]",
        "bg-transparent text-[var(--color-fg)]",
        "transition-colors hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-fg)]",
      )}
    >
      {/* Sun — visible only when :root[data-theme="dark"]. CSS in
          globals.css handles the show/hide so first paint is correct
          regardless of when JS hydrates. */}
      <svg
        data-theme-toggle-sun
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      {/* Moon — visible only when :root[data-theme="light"]. */}
      <svg
        data-theme-toggle-moon
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
