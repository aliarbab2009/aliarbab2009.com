/**
 * Vitest setup — loaded by every test file via vitest.config.ts
 * setupFiles. Scoped to environment-agnostic test infrastructure.
 *
 * @testing-library/jest-dom registers DOM matchers (toBeInTheDocument,
 * toHaveAttribute, etc.) on Vitest's `expect`. Safe to load in node
 * environment too — the matchers no-op when there's no DOM, but most
 * of them check element presence which is meaningless without happy-dom
 * anyway. Component tests opt into happy-dom per-file.
 */
import "@testing-library/jest-dom/vitest";
