#!/usr/bin/env node
/**
 * Privacy audit — CI gate for aliarbab2009.com.
 *
 * Recursively scans built `.next` output + `public/` + OG image source TSX
 * for forbidden tokens. Three severity tiers:
 *   - HIGH: always fails CI
 *   - MEDIUM: fails only when STRICT_PRIVACY=1
 *   - LOW: never fails — reports only
 *
 * The actual forbidden-token regex list lives in a gitignored sibling file
 * `scripts/.privacy-patterns.local.mjs` so this public script contains zero
 * literal tokens. CI gets the file via the PRIVACY_PATTERNS_BASE64 GitHub
 * Actions secret (decoded at workflow start before `pnpm privacy-audit`).
 * If neither the local file nor the example file is found, the audit fails
 * loudly with instructions.
 *
 * Optional binaries (auto-detected, skipped silently if absent):
 *   - pdftotext (poppler-utils) → scans public/resume/*.pdf text
 *   - exiftool (libimage-exiftool-perl) → scans EXIF GPS / Author / serials
 *
 * Usage:
 *   pnpm build && pnpm privacy-audit
 *   STRICT_PRIVACY=1 pnpm privacy-audit:strict
 */

import { exec } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";

const execp = promisify(exec);
const ROOT = resolve(process.cwd());
const STRICT = process.env.STRICT_PRIVACY === "1";

// ── Load forbidden patterns from the gitignored local file ────────────────
// Falls back to the tracked example with a loud warning + non-zero exit.
const LOCAL_PATTERNS = join(ROOT, "scripts", ".privacy-patterns.local.mjs");
const EXAMPLE_PATTERNS = join(ROOT, "scripts", "privacy-patterns.example.mjs");

async function loadForbidden() {
  if (existsSync(LOCAL_PATTERNS)) {
    const mod = await import(pathToFileURL(LOCAL_PATTERNS).href);
    if (!Array.isArray(mod.FORBIDDEN)) {
      console.error(
        "\x1b[31m✗ scripts/.privacy-patterns.local.mjs must export a FORBIDDEN array.\x1b[0m",
      );
      process.exit(2);
    }
    return { patterns: mod.FORBIDDEN, source: "local" };
  }
  if (existsSync(EXAMPLE_PATTERNS)) {
    console.error(
      "\x1b[31m✗ scripts/.privacy-patterns.local.mjs not found.\x1b[0m\n" +
        "  The audit needs the real pattern list to do its job.\n" +
        "  Local dev: cp scripts/privacy-patterns.example.mjs scripts/.privacy-patterns.local.mjs\n" +
        "             then add the real regex patterns from the project owner.\n" +
        "  CI:        the workflow must decode PRIVACY_PATTERNS_BASE64 into\n" +
        "             scripts/.privacy-patterns.local.mjs before running this script.\n",
    );
    process.exit(2);
  }
  console.error(
    "\x1b[31m✗ Neither scripts/.privacy-patterns.local.mjs nor scripts/privacy-patterns.example.mjs found.\x1b[0m",
  );
  process.exit(2);
}

// Directories to scan (relative to repo root)
const SCAN_DIRS = [".next/server", ".next/static", "public"];

// File extensions we care about
const TEXT_EXTS = new Set([
  ".html",
  ".js",
  ".mjs",
  ".cjs",
  ".css",
  ".txt",
  ".md",
  ".json",
  ".xml",
  ".svg",
  ".rsc",
  ".ts",
  ".tsx",
  ".mdx",
  ".map",
]);

const MAX_FILE_BYTES = 5 * 1024 * 1024;

// FORBIDDEN is loaded dynamically from scripts/.privacy-patterns.local.mjs
// (gitignored). See loadForbidden() above. Severity tiers:
//   HIGH   → always fails CI (process.exit 1)
//   MEDIUM → fails only when STRICT_PRIVACY=1
//   LOW    → reports but never fails
let FORBIDDEN = [];

// Allowlist patterns over the surrounding LINE. If any matches, skip the hit.
const ALLOWED_CONTEXTS = [
  /MIT\s+License/i, // Next/React/Tailwind ship MIT license headers
  /MIT-licensed/i,
  /SPDX-License-Identifier:\s*MIT/i,
  /@license\s+MIT/i,
  /"license"\s*:\s*"MIT"/i,
  /\blicense[:=]\s*["']?MIT/i,
];

function isAllowedLine(line) {
  return ALLOWED_CONTEXTS.some((re) => re.test(line));
}

function locate(content, offset) {
  let line = 1;
  let lastNL = -1;
  for (let i = 0; i < offset; i++) {
    if (content.charCodeAt(i) === 10) {
      line++;
      lastNL = i;
    }
  }
  return { line, col: offset - lastNL };
}

const allHits = [];

function record(file, content, lineNo, col, match, meta) {
  const lines = content.split("\n");
  const lineText = lines[lineNo - 1] ?? "";
  if (isAllowedLine(lineText)) return;
  allHits.push({
    file,
    line: lineNo,
    col,
    token: match,
    severity: meta.severity,
    category: meta.category,
    context: lineText.trim().slice(0, 120),
  });
}

function scanText(file, content) {
  for (const meta of FORBIDDEN) {
    const re = new RegExp(meta.pattern.source, meta.pattern.flags);
    let m;
    while ((m = re.exec(content)) !== null) {
      const { line, col } = locate(content, m.index);
      record(file, content, line, col, m[0], meta);
      if (!re.global) break;
    }
  }
}

async function scanFile(path) {
  const rel = relative(ROOT, path);
  const ext = extname(path).toLowerCase();
  if (!TEXT_EXTS.has(ext)) return;
  let size;
  try {
    size = statSync(path).size;
  } catch {
    return;
  }
  if (size > MAX_FILE_BYTES) return;
  let content;
  try {
    content = readFileSync(path, "utf8");
  } catch {
    return;
  }
  scanText(rel, content);
}

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) await walk(p);
    else if (entry.isFile()) await scanFile(p);
  }
}

async function hasBinary(name) {
  try {
    const cmd = process.platform === "win32" ? `where ${name}` : `command -v ${name}`;
    await execp(cmd);
    return true;
  } catch {
    return false;
  }
}

async function scanPDFs() {
  if (!(await hasBinary("pdftotext"))) {
    console.log("  (skipping PDF scan — pdftotext not installed)");
    return;
  }
  const pdfs = [];
  async function findPdfs(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) await findPdfs(p);
      else if (e.isFile() && extname(e.name).toLowerCase() === ".pdf") pdfs.push(p);
    }
  }
  await findPdfs(join(ROOT, "public"));

  for (const pdf of pdfs) {
    const rel = relative(ROOT, pdf);
    try {
      const { stdout } = await execp(`pdftotext "${pdf}" -`, { maxBuffer: 10 * 1024 * 1024 });
      scanText(`${rel} (PDF text)`, stdout);
    } catch (e) {
      console.warn(`  ! could not extract PDF: ${rel} — ${e.message}`);
    }
  }
}

async function scanImageMetadata() {
  if (!(await hasBinary("exiftool"))) {
    console.log("  (skipping EXIF scan — exiftool not installed)");
    return;
  }
  const imgExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".tiff", ".heic"]);
  const images = [];
  async function findImgs(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) await findImgs(p);
      else if (e.isFile() && imgExts.has(extname(e.name).toLowerCase())) images.push(p);
    }
  }
  await findImgs(join(ROOT, "public"));

  for (const img of images) {
    const rel = relative(ROOT, img);
    try {
      const { stdout } = await execp(
        `exiftool -j -GPSLatitude -GPSLongitude -Author -Creator -Artist -Copyright -SerialNumber -OwnerName -CameraOwnerName "${img}"`,
      );
      const parsed = JSON.parse(stdout);
      const meta = Array.isArray(parsed) ? (parsed[0] ?? {}) : {};
      if (meta.GPSLatitude || meta.GPSLongitude) {
        allHits.push({
          file: rel,
          line: 0,
          col: 0,
          token: `GPS ${meta.GPSLatitude ?? "?"}, ${meta.GPSLongitude ?? "?"}`,
          severity: "high",
          category: "image-exif-gps",
          context: "(image metadata)",
        });
      }
      for (const field of [
        "Author",
        "Creator",
        "Artist",
        "OwnerName",
        "CameraOwnerName",
        "Copyright",
        "SerialNumber",
      ]) {
        if (meta[field]) {
          allHits.push({
            file: rel,
            line: 0,
            col: 0,
            token: `${field}: ${String(meta[field]).slice(0, 60)}`,
            severity: field === "SerialNumber" ? "high" : "medium",
            category: `image-exif-${field.toLowerCase()}`,
            context: "(image metadata)",
          });
        }
      }
    } catch {
      // exiftool refused or no metadata — skip silently.
    }
  }
}

function sevIcon(s) {
  return s === "high"
    ? "\x1b[31m●\x1b[0m"
    : s === "medium"
      ? "\x1b[33m●\x1b[0m"
      : "\x1b[90m●\x1b[0m";
}

async function main() {
  console.log("🔒 Privacy audit — scanning built output...\n");

  const { patterns, source } = await loadForbidden();
  FORBIDDEN = patterns;
  console.log(
    `  pattern source: ${source} (${FORBIDDEN.length} regexes, ` +
      `${FORBIDDEN.filter((f) => f.severity === "high").length} high)\n`,
  );

  for (const dir of SCAN_DIRS) {
    const full = join(ROOT, dir);
    try {
      statSync(full);
    } catch {
      console.log(`  (skipping ${dir} — does not exist)`);
      continue;
    }
    await walk(full);
  }

  await scanPDFs();
  await scanImageMetadata();

  if (allHits.length === 0) {
    console.log("\n\x1b[32m✓ Privacy audit passed.\x1b[0m No forbidden tokens detected.");
    process.exit(0);
  }

  const high = allHits.filter((h) => h.severity === "high");
  const medium = allHits.filter((h) => h.severity === "medium");
  const low = allHits.filter((h) => h.severity === "low");

  console.error(`\n\x1b[31m✗ Privacy audit found ${allHits.length} hits.\x1b[0m`);
  console.error(`  high: ${high.length}   medium: ${medium.length}   low: ${low.length}\n`);

  // Group by category for readability
  const byCat = new Map();
  for (const h of allHits) {
    if (!byCat.has(h.category)) byCat.set(h.category, []);
    byCat.get(h.category).push(h);
  }
  for (const [cat, hits] of byCat) {
    console.error(`── ${cat} (${hits.length}) ──`);
    for (const h of hits.slice(0, 10)) {
      console.error(`  ${sevIcon(h.severity)} ${h.file}:${h.line}:${h.col}  '${h.token}'`);
      if (h.context && h.context !== "(image metadata)") {
        console.error(`     ${JSON.stringify(h.context.replace(/\s+/g, " "))}`);
      }
    }
    if (hits.length > 10) console.error(`  … +${hits.length - 10} more in this category`);
    console.error("");
  }

  console.error("Privacy rules: see CLAUDE.md → 'Privacy + no-doxxing'.");

  if (high.length > 0) process.exit(1);
  if (STRICT && medium.length > 0) process.exit(1);
  process.exit(0);
}

main().catch((err) => {
  console.error("Audit script error:", err);
  process.exit(2);
});
