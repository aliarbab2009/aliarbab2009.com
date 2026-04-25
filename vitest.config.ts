import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Vitest config.
 *
 * Default environment: "node". Pure-function tests stay fast — no DOM
 * shim, no global window/document.
 *
 * Component tests opt in per-file via a top-of-file directive:
 *   // @vitest-environment happy-dom
 *
 * This keeps the 100+ pure-function tests off happy-dom's startup cost
 * while letting client-component tests (ResumeActions, CommandPalette,
 * NowBar, LiveCountdown) get the DOM they need.
 *
 * The "@/" alias mirrors tsconfig.json so test files can import the
 * same paths source files do.
 *
 * setupFiles loads @testing-library/jest-dom matchers globally so
 * components tests can use toBeInTheDocument(), toHaveAttribute(), etc.
 * without per-file imports.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "_archive", "_repos"],
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    reporters: ["default"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
