/**
 * ThemeScript — inline blocking script that sets data-theme on <html>
 * BEFORE any CSS paints. Prevents FOUC when user's preferred theme
 * differs from the server-rendered default.
 *
 * Order of preference, first match wins:
 *   1. localStorage.theme === "light" | "dark"
 *   2. window.matchMedia("(prefers-color-scheme: light)").matches → light
 *   3. default → dark
 *
 * Stringified + inlined so it runs synchronously. No network hop.
 *
 * IMPORTANT — why this is sync, not async:
 * The previous version was an async server component that called
 * `await headers()` itself to read the per-request nonce. Async server
 * components in Next.js 15 / React 19 stream their output via RSC
 * (`self.__next_f.push(...)`) — which means the inline script ends up
 * encoded as JSON inside an RSC payload and only executes AFTER
 * hydration completes, NOT pre-paint. That defeats the entire purpose
 * of an FOUC-prevention script. Cold loads of `/` would land with
 * `data-theme=null` because the script hadn't run yet.
 *
 * Fix: this component is synchronous and accepts `nonce` as a prop.
 * The async `await headers()` happens once at the root layout (which
 * naturally awaits at the top of the tree); the resolved nonce is
 * passed down. The <script> tag is then emitted in the initial HTML
 * stream as a real executable element, not an RSC payload string.
 */
const INLINE_SCRIPT = `
(() => {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      document.documentElement.dataset.theme = stored;
      return;
    }
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    document.documentElement.dataset.theme = prefersLight ? "light" : "dark";
  } catch (_) {
    document.documentElement.dataset.theme = "dark";
  }
})();
`;

export function ThemeScript({ nonce }: { nonce?: string }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: INLINE_SCRIPT }} />;
}
