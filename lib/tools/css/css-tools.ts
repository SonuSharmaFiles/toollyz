// CSS engine for the Toollyz CSS Minifier. A hand-written, dependency-free
// scanner powering safe minification (whitespace collapse that never touches a
// descendant combinator or calc() operator spacing), beautify, structural
// validation, analysis, a syntax highlighter, line diff and compression
// analytics. Everything runs in the browser, so styles are never uploaded.

// ─── Types ───────────────────────────────────────────────────────────────────

export type IssueSeverity = "error" | "warning" | "info";
export interface CssIssue {
  severity: IssueSeverity;
  message: string;
  line: number;
  column: number;
  pos: number;
  hint?: string;
}

export type Indent = 2 | 4 | "tab";

export interface MinifyOptions {
  removeComments: boolean;
  preserveLicense: boolean;
  lowercaseHex: boolean;
  shortenHex: boolean;
  zeroUnits: boolean;
  removeEmptyRules: boolean;
}

export interface CssStats {
  rules: number;
  selectors: number;
  declarations: number;
  atRules: number;
  mediaQueries: number;
  keyframes: number;
  fontFaces: number;
  imports: number;
  colors: number;
  maxDepth: number;
}

export interface Analytics {
  originalBytes: number;
  minifiedBytes: number;
  savedBytes: number;
  savedPercent: number;
  originalChars: number;
  minifiedChars: number;
  originalLines: number;
  minifiedLines: number;
  ratio: number;
  loadTimeSavedMs: number;
  score: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lineCol(src: string, pos: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  const end = Math.min(pos, src.length);
  for (let k = 0; k < end; k++) {
    if (src[k] === "\n") { line++; column = 1; } else column++;
  }
  return { line, column };
}
export function byteSize(text: string): number {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(text).length;
  return text.length;
}
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function isLicenseComment(value: string): boolean {
  return /^\/\*!/.test(value) || /@(license|preserve|cc_on|copyright)/i.test(value);
}

const LENGTH_UNITS = "px|em|rem|ex|ch|vw|vh|vmin|vmax|cm|mm|in|pt|pc|q";
const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
const WORD_STOP = new Set(["{", "}", "(", ")", ";", ":", ",", '"', "'", " ", "\t", "\n", "\r", "\f"]);

function transformWord(word: string, opt: MinifyOptions, paren: number): string {
  if (HEX_RE.test(word)) {
    let hex = opt.lowercaseHex ? word.toLowerCase() : word;
    if (opt.shortenHex) {
      const body = hex.slice(1);
      if (body.length === 6 && body[0] === body[1] && body[2] === body[3] && body[4] === body[5]) hex = `#${body[0]}${body[2]}${body[4]}`;
      else if (body.length === 8 && body[0] === body[1] && body[2] === body[3] && body[4] === body[5] && body[6] === body[7]) hex = `#${body[0]}${body[2]}${body[4]}${body[6]}`;
    }
    return hex;
  }
  if (opt.zeroUnits && paren === 0 && new RegExp(`^0(?:${LENGTH_UNITS})$`, "i").test(word)) return "0";
  return word;
}

// ─── Minifier ──────────────────────────────────────────────────────────────--

function readString(src: string, i: number): number {
  const quote = src[i];
  i++;
  const n = src.length;
  while (i < n) {
    if (src[i] === "\\") { i += 2; continue; }
    if (src[i] === quote) { i++; break; }
    if (src[i] === "\n") break; // unterminated
    i++;
  }
  return i;
}

export function minifyCss(src: string, opt: MinifyOptions): string {
  let out = "";
  let i = 0;
  const n = src.length;
  let brace = 0;
  let paren = 0;

  const shouldKeepSpace = (prev: string, next: string): boolean => {
    if (!prev || !next) return false;
    if (paren > 0) {
      // inside () / calc(): drop only next to , ( )
      if (prev === "(" || prev === "," || next === ")" || next === ",") return false;
      return true; // keep around + - * / and tokens (calc safety)
    }
    if ("{};,".includes(prev) || "{};,".includes(next)) return false;
    if (">~".includes(prev) || ">~".includes(next)) return false; // combinators
    if (prev === "+" || next === "+") return false; // sibling combinator (paren===0)
    if (brace > 0 && (prev === ":" || next === ":")) return false; // declaration colon
    return true; // descendant combinator / space-separated values → keep one space
  };

  while (i < n) {
    const c = src[i];
    const c2 = src[i + 1];
    // comment
    if (c === "/" && c2 === "*") {
      const end = src.indexOf("*/", i + 2);
      const com = end === -1 ? src.slice(i) : src.slice(i, end + 2);
      i = end === -1 ? n : end + 2;
      if (!opt.removeComments || (opt.preserveLicense && isLicenseComment(com))) out += com;
      continue;
    }
    // string
    if (c === '"' || c === "'") {
      const end = readString(src, i);
      out += src.slice(i, end);
      i = end;
      continue;
    }
    // whitespace run
    if (c === " " || c === "\t" || c === "\n" || c === "\r" || c === "\f") {
      let j = i;
      while (j < n && /\s/.test(src[j])) j++;
      if (shouldKeepSpace(out[out.length - 1] ?? "", src[j] ?? "")) out += " ";
      i = j;
      continue;
    }
    if (c === "{") { brace++; out += "{"; i++; continue; }
    if (c === "}") { if (out[out.length - 1] === ";") out = out.slice(0, -1); brace = Math.max(0, brace - 1); out += "}"; i++; continue; }
    if (c === "(") { paren++; out += "("; i++; continue; }
    if (c === ")") { paren = Math.max(0, paren - 1); out += ")"; i++; continue; }
    if (c === ";") { if (out[out.length - 1] !== ";") out += ";"; i++; continue; }
    if (c === ":" || c === ",") { out += c; i++; continue; }
    // word run
    let j = i;
    while (j < n && !WORD_STOP.has(src[j]) && !(src[j] === "/" && src[j + 1] === "*")) j++;
    if (j === i) { out += src[i]; i++; continue; } // guarantee forward progress
    const word = src.slice(i, j);
    i = j;
    // url(...) — preserve content verbatim
    if (word.toLowerCase() === "url" && src[i] === "(") {
      const close = src.indexOf(")", i);
      const inner = close === -1 ? src.slice(i + 1) : src.slice(i + 1, close);
      out += `url(${inner.trim()}`;
      i = close === -1 ? n : close; // ')' handled next loop
      out += "";
      if (close !== -1) { out += ")"; i = close + 1; paren = Math.max(0, paren); }
      continue;
    }
    out += transformWord(word, opt, paren);
  }

  let result = out.trim();
  if (opt.removeEmptyRules) {
    let prev = "";
    while (prev !== result) { prev = result; result = result.replace(/[^{}();]+\{\}/g, ""); }
  }
  return result;
}

// ─── Beautifier ──────────────────────────────────────────────────────────────

function indentUnit(indent: Indent): string {
  return indent === "tab" ? "\t" : " ".repeat(indent);
}

export function beautifyCss(src: string, indent: Indent): string {
  // normalize first so we start from a predictable single-spaced form
  const css = minifyCss(src, { removeComments: false, preserveLicense: true, lowercaseHex: false, shortenHex: false, zeroUnits: false, removeEmptyRules: false });
  const unit = indentUnit(indent);
  let out = "";
  let depth = 0;
  let paren = 0;
  let i = 0;
  const n = css.length;
  const trimRight = () => { out = out.replace(/[ \t]+$/, ""); };
  const nl = () => { trimRight(); out += "\n" + unit.repeat(Math.max(0, depth)); };

  while (i < n) {
    const c = css[i];
    const c2 = css[i + 1];
    if (c === "/" && c2 === "*") {
      const end = css.indexOf("*/", i + 2);
      const com = end === -1 ? css.slice(i) : css.slice(i, end + 2);
      i = end === -1 ? n : end + 2;
      if (!/\n[ \t]*$/.test(out) && out) nl();
      out += com;
      nl();
      continue;
    }
    if (c === '"' || c === "'") { const end = readString(css, i); out += css.slice(i, end); i = end; continue; }
    if (c === "{") { trimRight(); out += " {"; depth++; nl(); i++; continue; }
    if (c === "}") { depth = Math.max(0, depth - 1); nl(); out += "}"; i++; nl(); continue; }
    if (c === ";") { if (paren === 0) { out += ";"; nl(); } else out += "; "; i++; continue; }
    if (c === ":") { out += paren === 0 && depth > 0 ? ": " : ":"; i++; continue; }
    if (c === ",") { if (paren === 0 && depth === 0) { out += ","; nl(); } else out += ", "; i++; continue; }
    if (c === "(") { paren++; out += "("; i++; continue; }
    if (c === ")") { paren = Math.max(0, paren - 1); out += ")"; i++; continue; }
    out += c;
    i++;
  }
  return out.replace(/[ \t]+$/gm, "").replace(/\n{2,}/g, "\n").trim();
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateCss(src: string): CssIssue[] {
  const issues: CssIssue[] = [];
  const push = (severity: IssueSeverity, pos: number, message: string, hint?: string) => {
    if (issues.length >= 50) return;
    const { line, column } = lineCol(src, pos);
    issues.push({ severity, message, line, column, pos, hint });
  };
  let i = 0;
  const n = src.length;
  const stack: { ch: string; pos: number }[] = [];
  while (i < n) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      if (end === -1) { push("error", i, "Unterminated comment", "Close the comment with */."); break; }
      i = end + 2;
      continue;
    }
    if (c === '"' || c === "'") {
      const start = i;
      const end = readString(src, i);
      if (end >= n && src[end - 1] !== c) { /* tolerate */ }
      if (src[end - 1] !== c) push("error", start, "Unterminated string", "Add the closing quote.");
      i = Math.max(end, i + 1);
      continue;
    }
    if (c === "{" || c === "(" || c === "[") stack.push({ ch: c, pos: i });
    else if (c === "}" || c === ")" || c === "]") {
      const open = stack.pop();
      const match: Record<string, string> = { "}": "{", ")": "(", "]": "[" };
      if (!open) push("error", i, `Unexpected closing "${c}"`, "There is no matching opening bracket.");
      else if (open.ch !== match[c]) push("error", i, `Mismatched bracket — expected closing for "${open.ch}"`, `A "${open.ch}" opened earlier is closed by "${c}".`);
    }
    i++;
  }
  for (const open of stack) push("error", open.pos, `Unclosed "${open.ch}"`, `Add the matching "${open.ch === "{" ? "}" : open.ch === "(" ? ")" : "]"}".`);

  // advisory: @import after rules can hurt performance
  return issues;
}

// ─── Analysis ──────────────────────────────────────────────────────────────--

export function analyzeCss(src: string): CssStats {
  const s: CssStats = { rules: 0, selectors: 0, declarations: 0, atRules: 0, mediaQueries: 0, keyframes: 0, fontFaces: 0, imports: 0, colors: 0, maxDepth: 0 };
  const colors = new Set<string>();
  let i = 0;
  const n = src.length;
  let depth = 0;
  let paren = 0;
  let preludeStart = 0;
  while (i < n) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "*") { const end = src.indexOf("*/", i + 2); i = end === -1 ? n : end + 2; continue; }
    if (c === '"' || c === "'") { i = readString(src, i); continue; }
    if (c === "@") {
      s.atRules++;
      const rest = src.slice(i, i + 12).toLowerCase();
      if (rest.startsWith("@media")) s.mediaQueries++;
      else if (rest.startsWith("@keyframes") || rest.startsWith("@-")) s.keyframes++;
      else if (rest.startsWith("@font-face")) s.fontFaces++;
      else if (rest.startsWith("@import")) s.imports++;
      i++;
      continue;
    }
    if (c === "#") {
      const m = src.slice(i).match(HEX_RE.source.replace(/[$^]/g, ""));
      const hm = src.slice(i, i + 9).match(/^#[0-9a-fA-F]{3,8}\b/);
      if (hm) { colors.add(hm[0].toLowerCase()); i += hm[0].length; continue; }
      void m;
    }
    if (c === "(") { paren++; i++; continue; }
    if (c === ")") { paren = Math.max(0, paren - 1); i++; continue; }
    if (c === "{") {
      const prelude = src.slice(preludeStart, i).replace(/[\s]+/g, " ").trim();
      if (!prelude.startsWith("@") || /^@media|^@supports|^@keyframes/i.test(prelude)) {
        s.rules++;
        s.selectors += prelude ? prelude.split(",").filter((x) => x.trim()).length : 1;
      }
      depth++;
      if (depth > s.maxDepth) s.maxDepth = depth;
      i++;
      preludeStart = i;
      continue;
    }
    if (c === "}") { depth = Math.max(0, depth - 1); i++; preludeStart = i; continue; }
    if (c === ":" && depth > 0 && paren === 0) { s.declarations++; i++; continue; }
    if (c === ";") { preludeStart = i + 1; i++; continue; }
    i++;
  }
  s.colors = colors.size;
  return s;
}

export function computeAnalytics(original: string, minified: string, issues: CssIssue[]): Analytics {
  const originalBytes = byteSize(original);
  const minifiedBytes = byteSize(minified);
  const savedBytes = Math.max(0, originalBytes - minifiedBytes);
  const savedPercent = originalBytes > 0 ? (savedBytes / originalBytes) * 100 : 0;
  const errors = issues.filter((x) => x.severity === "error").length;
  const warnings = issues.filter((x) => x.severity === "warning").length;
  const infos = issues.filter((x) => x.severity === "info").length;
  const score = Math.max(0, Math.min(100, 100 - errors * 14 - warnings * 5 - infos * 1));
  const loadTimeSavedMs = Math.round((savedBytes / (50 * 1024)) * 1000);
  return {
    originalBytes, minifiedBytes, savedBytes, savedPercent,
    originalChars: original.length,
    minifiedChars: minified.length,
    originalLines: original ? original.split("\n").length : 0,
    minifiedLines: minified ? minified.split("\n").length : 0,
    ratio: originalBytes > 0 ? minifiedBytes / originalBytes : 1,
    loadTimeSavedMs,
    score,
  };
}

// ─── Line diff (LCS) ─────────────────────────────────────────────────────────

export type DiffKind = "same" | "added" | "removed";
export interface DiffLine { kind: DiffKind; text: string }

export function lineDiff(aLines: string[], bLines: string[]): DiffLine[] {
  const m = aLines.length;
  const k = bLines.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(k + 1).fill(0));
  for (let x = m - 1; x >= 0; x--)
    for (let y = k - 1; y >= 0; y--)
      dp[x][y] = aLines[x] === bLines[y] ? dp[x + 1][y + 1] + 1 : Math.max(dp[x + 1][y], dp[x][y + 1]);
  const out: DiffLine[] = [];
  let x = 0;
  let y = 0;
  while (x < m && y < k) {
    if (aLines[x] === bLines[y]) { out.push({ kind: "same", text: aLines[x] }); x++; y++; }
    else if (dp[x + 1][y] >= dp[x][y + 1]) { out.push({ kind: "removed", text: aLines[x] }); x++; }
    else { out.push({ kind: "added", text: bLines[y] }); y++; }
  }
  while (x < m) { out.push({ kind: "removed", text: aLines[x] }); x++; }
  while (y < k) { out.push({ kind: "added", text: bLines[y] }); y++; }
  return out;
}

// ─── Syntax highlighter ──────────────────────────────────────────────────────

export function highlightCss(src: string): string {
  let out = "";
  let i = 0;
  const n = src.length;
  let depth = 0;
  let afterColon = false;
  let paren = 0;
  const emit = (cls: string, text: string) => { out += `<span class="${cls}">${escapeHtml(text)}</span>`; };

  while (i < n) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const com = end === -1 ? src.slice(i) : src.slice(i, end + 2);
      emit("c-com", com);
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (c === '"' || c === "'") { const end = readString(src, i); emit("c-str", src.slice(i, end)); i = end; continue; }
    if (c === "@") {
      let j = i + 1;
      while (j < n && /[\w-]/.test(src[j])) j++;
      emit("c-at", src.slice(i, j));
      i = j;
      continue;
    }
    if (c === "{") { out += escapeHtml(c); depth++; afterColon = false; i++; continue; }
    if (c === "}") { out += escapeHtml(c); depth = Math.max(0, depth - 1); afterColon = false; i++; continue; }
    if (c === ":") { out += `<span class="c-punc">:</span>`; if (depth > 0 && paren === 0) afterColon = true; i++; continue; }
    if (c === ";") { out += `<span class="c-punc">;</span>`; afterColon = false; i++; continue; }
    if (c === "(") { paren++; out += `<span class="c-punc">(</span>`; i++; continue; }
    if (c === ")") { paren = Math.max(0, paren - 1); out += `<span class="c-punc">)</span>`; i++; continue; }
    if ("{},>~+*=".includes(c)) { out += `<span class="c-punc">${escapeHtml(c)}</span>`; i++; continue; }
    if (/\s/.test(c)) { out += c; i++; continue; }
    // word
    let j = i;
    while (j < n && !WORD_STOP.has(src[j]) && !"{}>~+*=".includes(src[j]) && !(src[j] === "/" && src[j + 1] === "*")) j++;
    if (j === i) { out += escapeHtml(src[i]); i++; continue; } // guarantee forward progress
    const word = src.slice(i, j);
    i = j;
    if (HEX_RE.test(word) || /^-?\.?\d/.test(word)) emit("c-num", word);
    else if (depth === 0) emit("c-sel", word);
    else if (afterColon) emit("c-val", word);
    else emit("c-prop", word);
  }
  return out;
}

// ─── Presets, options & sample ─────────────────────────────────────────────--

export const DEFAULT_OPTIONS: MinifyOptions = {
  removeComments: true,
  preserveLicense: true,
  lowercaseHex: true,
  shortenHex: true,
  zeroUnits: false,
  removeEmptyRules: false,
};

export interface Preset { id: string; name: string; description: string; options: MinifyOptions }
export const PRESETS: Preset[] = [
  { id: "safe", name: "Safe", description: "Strong compression that never changes how styles render. Recommended.", options: { ...DEFAULT_OPTIONS } },
  { id: "aggressive", name: "Aggressive", description: "Maximum size: also strips zero units and removes empty rules.", options: { removeComments: true, preserveLicense: false, lowercaseHex: true, shortenHex: true, zeroUnits: true, removeEmptyRules: true } },
  { id: "conservative", name: "Conservative", description: "Collapses whitespace only — keeps comments, colors and units untouched.", options: { removeComments: false, preserveLicense: true, lowercaseHex: false, shortenHex: false, zeroUnits: false, removeEmptyRules: false } },
];

export interface OptionMeta { key: keyof MinifyOptions; label: string; description: string; aggressive?: boolean }
export interface OptionGroup { title: string; options: OptionMeta[] }
export const OPTION_GROUPS: OptionGroup[] = [
  {
    title: "Comments",
    options: [
      { key: "removeComments", label: "Remove comments", description: "Strip /* … */ comments from the stylesheet." },
      { key: "preserveLicense", label: "Preserve license comments", description: "Keep /*! … */ and @license banners." },
    ],
  },
  {
    title: "Colors",
    options: [
      { key: "lowercaseHex", label: "Lowercase hex colors", description: "Normalize #FFF to #fff." },
      { key: "shortenHex", label: "Shorten hex colors", description: "Collapse #ffffff to #fff when safe." },
    ],
  },
  {
    title: "Values",
    options: [
      { key: "zeroUnits", label: "Strip units on zero", description: "Rewrite 0px to 0 (length units only, outside calc()).", aggressive: true },
      { key: "removeEmptyRules", label: "Remove empty rules", description: "Delete selectors with no declarations.", aggressive: true },
    ],
  },
];

export const SAMPLE_CSS = `/*!
 * Toollyz demo stylesheet (c) 2026
 */

:root {
  --brand: #6366F1;
  --radius: 12px;
}

/* Layout */
.hero {
  margin: 0px;
  padding: 64px 24px;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: #FFFFFF;
  text-align: center;
}

.hero  >  .title {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: calc(1em + 8px);
}

.card {
  border: 1px solid #EEEEEE;
  border-radius: var(--radius);
}

@media (max-width: 640px) {
  .hero {
    padding: 32px 16px;
  }
}

.empty {}
`;
