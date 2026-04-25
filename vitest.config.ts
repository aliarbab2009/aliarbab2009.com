import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest config — scoped to pure-function unit tests for now.
 *
 * No DOM environment yet (happy-dom/jsdom skipped) since the only
 * tests are for src/lib/time.ts and friends — pure TypeScript.
 * When component tests arrive, swap `environment: "node"` for
 * `environment: "happy-dom"` and add @testing-library/react.
 *
 * The "@/" alias mirrors tsconfig.json so test files can import the
 * same paths source files do.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "_archive", "_repos"],
    globals: false, // explicit `import { describe, expect, it } from "vitest"`
    reporters: ["default"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
