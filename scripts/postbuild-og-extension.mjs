// Postbuild fixup for Next 16's `opengraph-image.tsx` file convention
// when used with `output: "export"` on GitHub Pages.
//
// Next emits PNG files named `opengraph-image` (no extension). Internally
// the dev server serves them with `Content-Type: image/png`, but static
// hosts like GitHub Pages serve files based on filename extension only,
// so `opengraph-image` is served as `application/octet-stream` — social
// crawlers reject that and show a broken image.
//
// This script:
//   1. Renames every `out/**/opengraph-image` file to `opengraph-image.png`.
//   2. Rewrites every reference in `out/**/*.html` to use the new path.
//
// Idempotent — safe to re-run.

import { readFile, readdir, rename, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = "out";

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

const allFiles = await walk(OUT_DIR);

// 1) Rename `opengraph-image` (no extension) → `opengraph-image.png`.
const ogFiles = allFiles.filter(
  (p) => p.endsWith("/opengraph-image") || p.endsWith("\\opengraph-image"),
);
let renamed = 0;
for (const p of ogFiles) {
  const target = `${p}.png`;
  try {
    await stat(target);
    // already exists — assume we ran already, skip
  } catch {
    await rename(p, target);
    renamed++;
  }
}

// 2) Rewrite HTML references. Pattern: `/opengraph-image?HASH` →
//    `/opengraph-image.png?HASH`. Also rewrite no-query references.
const htmlFiles = allFiles.filter((p) => p.endsWith(".html"));
let rewritten = 0;
for (const p of htmlFiles) {
  const src = await readFile(p, "utf8");
  // Be careful: only rewrite references to opengraph-image, not other paths.
  const next = src.replace(/\/opengraph-image(\?[^"'\s<>]*)?/g, "/opengraph-image.png$1");
  if (next !== src) {
    await writeFile(p, next, "utf8");
    rewritten++;
  }
}

console.log(`postbuild-og-extension: renamed ${renamed} file(s); rewrote ${rewritten} HTML(s).`);
