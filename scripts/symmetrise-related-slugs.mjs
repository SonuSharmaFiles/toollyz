// One-shot mutator: symmetrise `relatedSlugs` in `lib/tools/registry-seo.ts`.
//
// The audit found 558 asymmetric `relatedSlugs` edges — tool A lists
// tool B as related, but B does NOT list A. That confuses crawlers
// (one-way internal links look like dead-end hubs) and bleeds link
// equity. This script walks every entry, computes the inbound graph,
// and appends missing back-edges up to a per-tool cap so the graph
// becomes (mostly) symmetric without ballooning any single tool's
// related list.
//
// Run: `node scripts/symmetrise-related-slugs.mjs`.
// Re-runnable / idempotent: re-running on a fully-symmetric graph adds
// nothing.

import { readFile, writeFile } from "node:fs/promises";

const PATH = "lib/tools/registry-seo.ts";
const MAX_RELATED = 10;

const src = await readFile(PATH, "utf8");

// Capture each entry header. Slugs are lowercase kebab-case, the only
// keys at the top level of toolSeoBySlug.
const slugBlockRe = /"([a-z][-a-z0-9]*)":\s*\{/g;
// Match `relatedSlugs: [...]` allowing newlines inside the brackets.
const relatedRe = /relatedSlugs:\s*\[([\s\S]*?)\]/;

// Pass 1: enumerate every tool entry and locate its relatedSlugs line.
const entries = [];
let m;
while ((m = slugBlockRe.exec(src)) !== null) {
  entries.push({ slug: m[1], blockStart: m.index });
}

for (let i = 0; i < entries.length; i++) {
  const e = entries[i];
  const next = entries[i + 1];
  const chunkStart = e.blockStart;
  const chunkEnd = next ? next.blockStart : src.length;
  const chunk = src.slice(chunkStart, chunkEnd);
  const rm = relatedRe.exec(chunk);
  if (!rm) {
    e.related = [];
    continue;
  }
  e.related = [...rm[1].matchAll(/"([a-z][-a-z0-9]*)"/g)].map((mm) => mm[1]);
  e.lineMatchStart = chunkStart + rm.index;
  e.lineMatchLen = rm[0].length;
}

// Pass 2: build the directed graph + its inbound view.
const slugs = new Set(entries.map((e) => e.slug));
const outgoing = new Map();
for (const e of entries) {
  outgoing.set(
    e.slug,
    new Set(e.related.filter((s) => slugs.has(s) && s !== e.slug)),
  );
}
const inbound = new Map();
for (const [from, neighbours] of outgoing) {
  for (const to of neighbours) {
    if (!inbound.has(to)) inbound.set(to, new Set());
    inbound.get(to).add(from);
  }
}

// Pass 3: for each tool, keep its existing (curated) related first,
// then append back-edges that are missing — alphabetically for
// determinism — up to MAX_RELATED.
let addedTotal = 0;
const finalRelated = new Map();
for (const e of entries) {
  const existing = [...outgoing.get(e.slug)];
  const have = new Set(existing);
  const backEdges = [...(inbound.get(e.slug) ?? [])]
    .filter((s) => !have.has(s))
    .sort();
  const merged = [...existing];
  for (const s of backEdges) {
    if (merged.length >= MAX_RELATED) break;
    merged.push(s);
    addedTotal++;
  }
  finalRelated.set(e.slug, merged);
}

// Pass 4: rewrite the file in reverse order so earlier replacements
// don't shift the offsets of later ones.
let out = src;
for (let i = entries.length - 1; i >= 0; i--) {
  const e = entries[i];
  if (e.lineMatchStart == null) continue;
  const newList = finalRelated.get(e.slug);
  const replacement = `relatedSlugs: [${newList.map((s) => `"${s}"`).join(", ")}]`;
  out = out.slice(0, e.lineMatchStart) + replacement + out.slice(e.lineMatchStart + e.lineMatchLen);
}

await writeFile(PATH, out, "utf8");

// Report asymmetry that REMAINS (back-edges we couldn't fit due to cap).
let remainingAsymmetric = 0;
for (const e of entries) {
  for (const target of finalRelated.get(e.slug)) {
    const targetList = finalRelated.get(target);
    if (targetList && !targetList.includes(e.slug)) remainingAsymmetric++;
  }
}

console.log(
  `symmetrise: ${addedTotal} back-edges added across ${entries.length} tools (cap ${MAX_RELATED}); ${remainingAsymmetric} asymmetric edges remain.`,
);
