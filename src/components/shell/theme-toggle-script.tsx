import { headers } from "next/headers";

/**
 * Inline-script body for the ThemeToggle button.
 *
 * Plain string at module scope so <ThemeToggleScript /> below can stamp
 * it inside <script dangerouslySetInnerHTML> with a per-request CSP
 * nonce. Keeping the actual click-flip logic as a string makes it easy
 * to grep + audit independently of the component plumbing.
 *
 * What the script does at runtime:
 *   1. Locates the button via document.currentScript.previousElementSibling
 *      — the button is rendered immediately before this <script> tag, and
 *      currentScript is non-null while the inline script is executing
 *      synchronously during HTML parse.
 *   2. Binds a click handler that reads :root[data-theme] live, flips,
 *      writes back via setAttribute, forces a synchronous style recalc
 *      via `void document.body.offsetHeight`, persists to localStorage,
 *      and dispatches a "themechange" CustomEvent so the command palette
 *      stays in sync.
 *   3. Subscribes to "themechange" + "storage" events so palette-driven
 *      flips and cross-tab flips both keep this button's aria-label fresh.
 *   4. Calls syncLabel() once on bind so the aria-label specialises
 *      ("Switch to dark mode" / "Switch to light mode") immediately.
 *
 * The whole thing runs the moment the parser reaches the script — no
 * React, no hydration window, no first-click race.
 */
export const THEME_TOGGLE_SCRIPT = `(function(){
  var btn = document.currentScript && document.currentScript.previousElementSibling;
  if (!btn || !btn.matches || !btn.matches('[data-theme-toggle]')) return;
  function label(t) {
    return t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  }
  function syncLabel() {
    var t = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    btn.setAttribute('aria-label', label(t));
    btn.setAttribute('title', label(t));
  }
  function flip() {
    var root = document.documentElement;
    var current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    // Force synchronous style recalc — defeats any browser recalc-skip
    // when only an attribute on <html> changes and consumers read via
    // var() inside arbitrary-value Tailwind classes.
    void document.body.offsetHeight;
    try { localStorage.setItem('theme', next); } catch (e) {}
    window.dispatchEvent(new Event('themechange'));
    syncLabel();
  }
  btn.addEventListener('click', flip);
  window.addEventListener('themechange', syncLabel);
  window.addEventListener('storage', function(e){
    if (e.key === 'theme') syncLabel();
  });
  syncLabel();
})();`;

/**
 * <ThemeToggleScript /> — server component that emits the inline
 * <script> tag stamped with the per-request CSP nonce from middleware.
 *
 * Must be rendered IMMEDIATELY AFTER a <button data-theme-toggle> in the
 * DOM tree — the inline script binds to the script's
 * previousElementSibling. Render order matters; do not interleave other
 * elements between the button and this component.
 *
 * Reads the nonce the same way <ThemeScript> does. Strict CSP allows
 * nonce-attributed inline scripts via 'strict-dynamic' + 'nonce-...'
 * source expressions in middleware.ts.
 */
export async function ThemeToggleScript() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_TOGGLE_SCRIPT }} />;
}
