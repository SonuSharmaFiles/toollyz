// Generate a real multi-resolution `public/favicon.ico` from
// `app/icon.svg`. Browsers fall back to `/favicon.ico` whenever the
// response has no HTML <head> to read a <link rel="icon"> from — so
// `/robots.txt`, `/sitemap.xml`, `view-source:` URLs and JSON
// endpoints need the .ico to render a tab favicon.
//
// We render the SVG at 16/32/48 px (the classic Windows trio that
// covers every place a favicon shows up) and pack them into a single
// ICO container. Run with `node scripts/generate-favicon.mjs`. Re-run
// any time `app/icon.svg` changes; the result is committed as a
// binary so production builds don't need sharp at deploy time.

import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import toIco from "png-to-ico";

const SVG_PATH = "app/icon.svg";
const OUT_PATH = "public/favicon.ico";
const SIZES = [16, 32, 48];

const svg = await readFile(SVG_PATH);

const pngBuffers = await Promise.all(
  SIZES.map((size) =>
    sharp(svg, { density: 384 })
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer(),
  ),
);

const ico = await toIco(pngBuffers);
await writeFile(OUT_PATH, ico);

console.log(`generate-favicon: wrote ${OUT_PATH} (${ico.length} bytes, ${SIZES.join("/")}).`);
