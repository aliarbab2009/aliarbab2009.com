/**
 * Privacy-audit pattern source — example / placeholder.
 *
 * `scripts/privacy-audit.mjs` reads the real list from a sibling file
 * `scripts/.privacy-patterns.local.mjs` (gitignored — never published).
 * If that file doesn't exist, the audit falls back to this example file
 * with a loud warning + non-zero exit so CI fails until the local file
 * is provided.
 *
 * To populate locally:
 *   cp scripts/privacy-patterns.example.mjs scripts/.privacy-patterns.local.mjs
 *   # then edit the local copy and add the real regex patterns
 *
 * For CI: pre-build step decodes a `PRIVACY_PATTERNS_BASE64` GitHub
 * Actions secret into `scripts/.privacy-patterns.local.mjs` before
 * `pnpm privacy-audit`. Rotate by re-running:
 *   base64 -w0 scripts/.privacy-patterns.local.mjs
 * and pasting the output into the secret.
 *
 * Each entry shape:
 *   { pattern: <RegExp>, severity: "high"|"medium"|"low", category: <string> }
 *
 *   - HIGH   → audit always fails (process.exit 1)
 *   - MEDIUM → audit fails when STRICT_PRIVACY=1
 *   - LOW    → reported but never fails
 *
 *   Categories are free-form labels for grouping in the report output.
 */

export const FORBIDDEN = [
  // Replace with real patterns in scripts/.privacy-patterns.local.mjs.
  // The example below uses a placeholder string so the audit is wired
  // end-to-end but trips on nothing real.
  { pattern: /\b__REPLACE_WITH_REAL_FORBIDDEN_TOKENS__\b/g, severity: "high", category: "example" },
];
