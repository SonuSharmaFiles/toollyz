// HTML engine for the Toollyz HTML Minifier. A hand-written, dependency-free
// tokenizer + lenient tree builder powering: minification (with granular
// options + presets), beautify, well-formedness/best-practice validation,
// inline CSS/JS minification, structure analysis, compression analytics, a
// safe syntax highlighter and a line diff. Everything runs in the browser, so
// markup is never uploaded.

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HtmlAttr {
  name: string;
  /** `null` means a boolean / value-less attribute (e.g. `disabled`). */
  value: string | null;
  /** Original quote char: `"`, `'` or `""` for unquoted. */
  quote: '"' | "'" | "";
}

export type HtmlNode =
  | {
      type: "element";
      name: string;
      attrs: HtmlAttr[];
      children: HtmlNode[];
      selfClosing: boolean;
      void: boolean;
      raw?: string;
      line: number;
    }
  | { type: "text"; value: string }
  | { type: "comment"; value: string; conditional: boolean }
  | { type: "doctype"; value: string };

export type IssueSeverity = "error" | "warning" | "info";
export interface HtmlIssue {
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
  preserveConditionalComments: boolean;
  collapseWhitespace: boolean;
  preserveLineBreaks: boolean;
  removeEmptyAttributes: boolean;
  removeRedundantAttributes: boolean;
  collapseBooleanAttributes: boolean;
  removeOptionalTags: boolean;
  minifyCSS: boolean;
  minifyJS: boolean;
  normalizeQuotes: boolean;
}

export interface HtmlStats {
  elements: number;
  attributes: number;
  comments: number;
  textNodes: number;
  scripts: number;
  styles: number;
  images: number;
  links: number;
  maxDepth: number;
  nodes: number;
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
  ratio: number; // minified / original (0..1)
  loadTimeSavedMs: number; // on a slow ~3G connection
  score: number; // optimization / cleanliness score 0..100
}

// ─── Element tables ────────────────────────────────────────────────────────--

const VOID_ELEMENTS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
  "param", "source", "track", "wbr",
]);
const RAWTEXT_ELEMENTS = new Set(["script", "style", "textarea", "title"]);
const PRESERVE_WS_ELEMENTS = new Set(["pre", "textarea"]);
const BOOLEAN_ATTRS = new Set([
  "allowfullscreen", "async", "autofocus", "autoplay", "checked", "controls",
  "default", "defer", "disabled", "formnovalidate", "hidden", "ismap", "loop",
  "multiple", "muted", "novalidate", "open", "readonly", "required", "reversed",
  "selected",
]);
const OPTIONAL_END_TAGS = new Set([
  "html", "head", "body", "li", "dt", "dd", "p", "option", "optgroup", "thead",
  "tbody", "tfoot", "tr", "td", "th", "colgroup", "caption",
]);
const EMPTY_REMOVABLE_ATTRS = new Set(["class", "id", "style", "title", "lang", "dir"]);
const DEPRECATED_ELEMENTS = new Set([
  "acronym", "applet", "basefont", "big", "blink", "center", "dir", "font",
  "frame", "frameset", "isindex", "marquee", "strike", "tt", "noframes",
]);
const DEPRECATED_ATTRS = new Set([
  "align", "bgcolor", "border", "cellpadding", "cellspacing", "valign", "vspace",
  "hspace", "frameborder", "marginwidth", "marginheight", "nowrap",
]);
// Block-level elements whose start implicitly closes an open <p>.
const CLOSES_P = new Set([
  "address", "article", "aside", "blockquote", "details", "div", "dl",
  "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4",
  "h5", "h6", "header", "hr", "main", "menu", "nav", "ol", "p", "pre", "section",
  "table", "ul",
]);

// ─── Position helpers ──────────────────────────────────────────────────────--

function lineCol(src: string, pos: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  const end = Math.min(pos, src.length);
  for (let k = 0; k < end; k++) {
    if (src[k] === "\n") { line++; column = 1; } else column++;
  }
  return { line, column };
}

function isConditionalComment(value: string): boolean {
  return /\[\s*if[\s\S]*?\]/i.test(value) || /\[\s*endif\s*\]/i.test(value);
}
function isImportantComment(value: string): boolean {
  return value.trimStart().startsWith("!");
}

// ─── Tokenizer ─────────────────────────────────────────────────────────────--

type Token =
  | { kind: "doctype"; raw: string; start: number }
  | { kind: "comment"; value: string; conditional: boolean; start: number }
  | { kind: "bogus"; raw: string; start: number } // <![if]>, <![endif]>, <![CDATA[...]]>
  | { kind: "startTag"; name: string; attrs: HtmlAttr[]; selfClosing: boolean; start: number }
  | { kind: "endTag"; name: string; start: number }
  | { kind: "raw"; name: string; value: string; start: number }
  | { kind: "text"; value: string; start: number };

const NAME_START = /[A-Za-z]/;
const NAME_CHAR = /[A-Za-z0-9_:.\-]/;
const ATTR_NAME_CHAR = /[^\s"'>/=]/;

export function tokenize(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = src.length;

  const readRaw = (name: string, start: number) => {
    const lower = name.toLowerCase();
    const closeRe = new RegExp(`</${lower}(?=[\\s/>])`, "i");
    closeRe.lastIndex = 0;
    const rest = src.slice(i);
    const m = closeRe.exec(rest);
    if (!m) {
      tokens.push({ kind: "raw", name: lower, value: src.slice(i), start });
      i = n;
      return;
    }
    const contentEnd = i + m.index;
    tokens.push({ kind: "raw", name: lower, value: src.slice(i, contentEnd), start });
    i = contentEnd;
    // consume the closing tag
    const close = src.indexOf(">", i);
    const closeStart = i;
    i = close === -1 ? n : close + 1;
    tokens.push({ kind: "endTag", name: lower, start: closeStart });
  };

  while (i < n) {
    const c = src[i];
    if (c === "<") {
      const start = i;
      // comment
      if (src.startsWith("<!--", i)) {
        const end = src.indexOf("-->", i + 4);
        const value = end === -1 ? src.slice(i + 4) : src.slice(i + 4, end);
        i = end === -1 ? n : end + 3;
        tokens.push({ kind: "comment", value, conditional: isConditionalComment(value), start });
        continue;
      }
      // CDATA / downlevel-revealed conditional <![if]> <![endif]>
      if (src.startsWith("<![CDATA[", i)) {
        const end = src.indexOf("]]>", i + 9);
        const raw = end === -1 ? src.slice(i) : src.slice(i, end + 3);
        i = end === -1 ? n : end + 3;
        tokens.push({ kind: "bogus", raw, start });
        continue;
      }
      // doctype or other markup declaration
      if (src.startsWith("<!", i)) {
        const end = src.indexOf(">", i + 2);
        const raw = end === -1 ? src.slice(i) : src.slice(i, end + 1);
        i = end === -1 ? n : end + 1;
        if (/^<!\s*doctype/i.test(raw)) tokens.push({ kind: "doctype", raw, start });
        else tokens.push({ kind: "bogus", raw, start });
        continue;
      }
      // end tag
      if (src[i + 1] === "/") {
        i += 2;
        let name = "";
        while (i < n && NAME_CHAR.test(src[i])) { name += src[i]; i++; }
        const gt = src.indexOf(">", i);
        i = gt === -1 ? n : gt + 1;
        if (name) tokens.push({ kind: "endTag", name: name.toLowerCase(), start });
        continue;
      }
      // start tag
      if (NAME_START.test(src[i + 1] ?? "")) {
        i += 1;
        let name = "";
        while (i < n && NAME_CHAR.test(src[i])) { name += src[i]; i++; }
        const attrs: HtmlAttr[] = [];
        let selfClosing = false;
        for (;;) {
          while (i < n && /\s/.test(src[i])) i++;
          if (i >= n) break;
          if (src[i] === ">") { i++; break; }
          if (src[i] === "/" && src[i + 1] === ">") { selfClosing = true; i += 2; break; }
          if (src[i] === "/") { i++; continue; }
          // attribute name
          let aname = "";
          while (i < n && ATTR_NAME_CHAR.test(src[i])) { aname += src[i]; i++; }
          if (!aname) { i++; continue; }
          while (i < n && /\s/.test(src[i])) i++;
          if (src[i] === "=") {
            i++;
            while (i < n && /\s/.test(src[i])) i++;
            const q = src[i];
            if (q === '"' || q === "'") {
              i++;
              let val = "";
              while (i < n && src[i] !== q) { val += src[i]; i++; }
              i++; // closing quote
              attrs.push({ name: aname, value: val, quote: q });
            } else {
              let val = "";
              while (i < n && !/[\s>]/.test(src[i])) { val += src[i]; i++; }
              attrs.push({ name: aname, value: val, quote: "" });
            }
          } else {
            attrs.push({ name: aname, value: null, quote: "" });
          }
        }
        const lower = name.toLowerCase();
        tokens.push({ kind: "startTag", name: lower, attrs, selfClosing, start });
        if (!selfClosing && RAWTEXT_ELEMENTS.has(lower)) readRaw(lower, start);
        continue;
      }
      // a lone "<" — treat as text
      let text = "<";
      i++;
      while (i < n && src[i] !== "<") { text += src[i]; i++; }
      tokens.push({ kind: "text", value: text, start });
      continue;
    }
    // text run
    const start = i;
    let text = "";
    while (i < n && src[i] !== "<") { text += src[i]; i++; }
    tokens.push({ kind: "text", value: text, start });
  }
  return tokens;
}

// ─── Lenient tree builder (for tree view / stats / beautify) ─────────────────--

export function parseHtmlTree(src: string): HtmlNode[] {
  const tokens = tokenize(src);
  const root: Extract<HtmlNode, { type: "element" }> = {
    type: "element", name: "#root", attrs: [], children: [], selfClosing: false, void: false, line: 0,
  };
  const stack: Extract<HtmlNode, { type: "element" }>[] = [root];
  const top = () => stack[stack.length - 1];

  for (const t of tokens) {
    if (t.kind === "text") { top().children.push({ type: "text", value: t.value }); continue; }
    if (t.kind === "comment") {
      top().children.push({ type: "comment", value: t.value, conditional: t.conditional });
      continue;
    }
    if (t.kind === "doctype") { top().children.push({ type: "doctype", value: t.raw }); continue; }
    if (t.kind === "bogus") { top().children.push({ type: "comment", value: t.raw, conditional: false }); continue; }
    if (t.kind === "raw") { const el = top(); if (el.name !== "#root") el.raw = t.value; continue; }
    if (t.kind === "startTag") {
      const isVoid = VOID_ELEMENTS.has(t.name);
      // implied close of <p>
      if (CLOSES_P.has(t.name) && top().name === "p") stack.pop();
      // implied close of <li>, <option>, table cells, definition items
      const peers: Record<string, string[]> = {
        li: ["li"], option: ["option"], optgroup: ["optgroup", "option"],
        dt: ["dt", "dd"], dd: ["dt", "dd"], td: ["td", "th"], th: ["td", "th"],
        tr: ["tr"], thead: ["thead", "tbody", "tfoot"], tbody: ["thead", "tbody", "tfoot"],
        tfoot: ["thead", "tbody", "tfoot"],
      };
      const closeable = peers[t.name];
      if (closeable && closeable.includes(top().name)) stack.pop();
      const { line } = lineCol(src, t.start);
      const node: Extract<HtmlNode, { type: "element" }> = {
        type: "element", name: t.name, attrs: t.attrs, children: [],
        selfClosing: t.selfClosing, void: isVoid, line,
      };
      top().children.push(node);
      if (!isVoid && !t.selfClosing) stack.push(node);
      continue;
    }
    if (t.kind === "endTag") {
      // find nearest matching open
      let idx = -1;
      for (let k = stack.length - 1; k >= 1; k--) {
        if (stack[k].name === t.name) { idx = k; break; }
      }
      if (idx !== -1) stack.length = idx; // pop everything from idx upward
    }
  }
  return root.children;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateHtml(src: string): HtmlIssue[] {
  const tokens = tokenize(src);
  const issues: HtmlIssue[] = [];
  const push = (severity: IssueSeverity, pos: number, message: string, hint?: string) => {
    if (issues.length >= 60) return;
    const { line, column } = lineCol(src, pos);
    issues.push({ severity, message, line, column, pos, hint });
  };

  const stack: { name: string; start: number }[] = [];
  const ids = new Map<string, number>();
  let sawDoctype = false;
  let sawHtmlLang = true; // assume fine unless an <html> without lang appears
  let hasContentBeforeDoctype = false;

  for (const t of tokens) {
    if (t.kind === "doctype") { sawDoctype = true; continue; }
    if (t.kind === "text" && !sawDoctype && t.value.trim()) hasContentBeforeDoctype = true;
    if (t.kind === "startTag") {
      if (!sawDoctype) sawDoctype = sawDoctype; // doctype optional check handled at end
      if (DEPRECATED_ELEMENTS.has(t.name)) {
        push("warning", t.start, `<${t.name}> is deprecated`, "This element was removed from the HTML standard — use CSS or a modern element instead.");
      }
      if (t.name === "html" && !t.attrs.some((a) => a.name.toLowerCase() === "lang")) {
        sawHtmlLang = false;
      }
      for (const a of t.attrs) {
        const ln = a.name.toLowerCase();
        if (DEPRECATED_ATTRS.has(ln)) {
          push("warning", t.start, `Deprecated attribute "${a.name}" on <${t.name}>`, "Presentational attributes should be replaced with CSS.");
        }
        if (ln === "id" && a.value) {
          ids.set(a.value, (ids.get(a.value) ?? 0) + 1);
        }
      }
      // duplicate attribute names
      const seen = new Set<string>();
      for (const a of t.attrs) {
        const ln = a.name.toLowerCase();
        if (seen.has(ln)) push("warning", t.start, `Duplicate attribute "${a.name}" on <${t.name}>`, "Remove the repeated attribute — only the first is used.");
        seen.add(ln);
      }
      if (t.name === "img" && !t.attrs.some((a) => a.name.toLowerCase() === "alt")) {
        push("warning", t.start, "<img> is missing an alt attribute", "Add alt text for accessibility and SEO (use alt=\"\" for decorative images).");
      }
      if (!VOID_ELEMENTS.has(t.name) && !t.selfClosing) stack.push({ name: t.name, start: t.start });
      continue;
    }
    if (t.kind === "endTag") {
      let idx = -1;
      for (let k = stack.length - 1; k >= 0; k--) {
        if (stack[k].name === t.name) { idx = k; break; }
      }
      if (idx === -1) {
        push("error", t.start, `Stray closing tag </${t.name}>`, "There is no matching opening tag for this element.");
      } else {
        for (let k = stack.length - 1; k > idx; k--) {
          push("error", stack[k].start, `Unclosed <${stack[k].name}> tag`, `Add a closing </${stack[k].name}> before </${t.name}>.`);
        }
        stack.length = idx;
      }
    }
  }
  for (const open of stack) {
    push("error", open.start, `Unclosed <${open.name}> tag`, `Add a closing </${open.name}> tag.`);
  }
  for (const [id, count] of ids) {
    if (count > 1) push("warning", 0, `Duplicate id "${id}" used ${count} times`, "IDs must be unique within a document.");
  }
  if (hasContentBeforeDoctype) {
    push("warning", 0, "Content appears before the doctype", "The <!DOCTYPE html> declaration should be the very first thing in the document.");
  }
  if (!sawHtmlLang) {
    push("info", 0, "<html> has no lang attribute", "Add lang=\"en\" (or your language) to help screen readers and search engines.");
  }
  if (!sawDoctype && tokens.some((t) => t.kind === "startTag" && (t.name === "html" || t.name === "head" || t.name === "body"))) {
    push("info", 0, "Missing <!DOCTYPE html>", "Add <!DOCTYPE html> at the top to trigger standards mode.");
  }
  return issues;
}

// ─── Inline CSS minifier (safe, dependency-free) ─────────────────────────────--

export function minifyCss(css: string): string {
  let out = "";
  let i = 0;
  const n = css.length;
  while (i < n) {
    const c = css[i];
    const c2 = css[i + 1];
    if (c === "/" && c2 === "*") {
      i += 2;
      while (i < n && !(css[i] === "*" && css[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'") {
      let s = c; i++;
      while (i < n) { const d = css[i]; s += d; i++; if (d === "\\") { if (i < n) { s += css[i]; i++; } continue; } if (d === c) break; }
      out += s;
      continue;
    }
    if (/\s/.test(c)) {
      let j = i;
      while (j < n && /\s/.test(css[j])) j++;
      const prev = out[out.length - 1] ?? "";
      const next = css[j] ?? "";
      // safe to drop whitespace next to structural punctuation only
      if (prev && next && !"{};,".includes(prev) && !"{};,".includes(next)) out += " ";
      i = j;
      continue;
    }
    if (c === "}") {
      if (out[out.length - 1] === ";") out = out.slice(0, -1);
      out += c; i++;
      continue;
    }
    out += c; i++;
  }
  return out.trim();
}

// ─── Inline JS minifier (safe: comment + whitespace only) ────────────────────--

const REGEX_KEYWORDS = new Set([
  "return", "typeof", "instanceof", "in", "of", "do", "else", "case", "void",
  "delete", "throw", "new", "yield", "await",
]);

function regexAllowed(lastTok: string): boolean {
  if (lastTok === "") return true;
  if (lastTok === " lit") return false;
  if (/^[A-Za-z0-9_$.]+$/.test(lastTok)) return REGEX_KEYWORDS.has(lastTok);
  return lastTok !== ")" && lastTok !== "]";
}

export function minifyJs(code: string): string {
  let out = "";
  let i = 0;
  const n = code.length;
  let lastTok = "";
  while (i < n) {
    const c = code[i];
    const c2 = code[i + 1];
    if (c === "/" && c2 === "/") { i += 2; while (i < n && code[i] !== "\n") i++; continue; }
    if (c === "/" && c2 === "*") { i += 2; while (i < n && !(code[i] === "*" && code[i + 1] === "/")) i++; i += 2; continue; }
    if (c === '"' || c === "'") {
      let s = c; i++;
      while (i < n) { const d = code[i]; s += d; i++; if (d === "\\") { if (i < n) { s += code[i]; i++; } continue; } if (d === c) break; }
      out += s; lastTok = " lit"; continue;
    }
    if (c === "`") {
      let s = c; i++;
      while (i < n) { const d = code[i]; if (d === "\\") { s += d + (code[i + 1] ?? ""); i += 2; continue; } s += d; i++; if (d === "`") break; }
      out += s; lastTok = " lit"; continue;
    }
    if (c === "/" && regexAllowed(lastTok)) {
      let s = c; i++; let inClass = false;
      while (i < n) {
        const d = code[i]; s += d; i++;
        if (d === "\\") { if (i < n) { s += code[i]; i++; } continue; }
        if (d === "[") inClass = true; else if (d === "]") inClass = false; else if (d === "/" && !inClass) break;
      }
      out += s; lastTok = " lit"; continue;
    }
    if (/\s/.test(c)) {
      let j = i; let hasNL = false;
      while (j < n && /\s/.test(code[j])) { if (code[j] === "\n") hasNL = true; j++; }
      const prev = out[out.length - 1] ?? "";
      if (hasNL) { if (prev !== "" && prev !== "\n") out += "\n"; }
      else if (prev !== "" && prev !== "\n" && prev !== " ") out += " ";
      i = j; continue;
    }
    if (/[A-Za-z0-9_$.]/.test(c)) {
      let run = "";
      while (i < n && /[A-Za-z0-9_$.]/.test(code[i])) { run += code[i]; i++; }
      out += run; lastTok = run; continue;
    }
    out += c; lastTok = c; i++;
  }
  return out
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

// ─── Minifier ──────────────────────────────────────────────────────────────--

function isRedundantAttr(tag: string, name: string, attr: HtmlAttr, attrs: HtmlAttr[]): boolean {
  const v = (attr.value ?? "").trim().toLowerCase();
  if (tag === "script" && name === "type" && (v === "" || v === "text/javascript" || v === "application/javascript")) return true;
  if (tag === "script" && name === "language" && v === "javascript") return true;
  if (tag === "style" && name === "type" && (v === "" || v === "text/css")) return true;
  if (tag === "link" && name === "type" && v === "text/css" && attrs.some((a) => a.name.toLowerCase() === "rel" && (a.value ?? "").toLowerCase().includes("stylesheet"))) return true;
  if (tag === "input" && name === "type" && v === "text") return true;
  if (tag === "form" && name === "method" && v === "get") return true;
  return false;
}

function serializeAttrs(tag: string, attrs: HtmlAttr[], opt: MinifyOptions): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const a of attrs) {
    const ln = a.name.toLowerCase();
    if (seen.has(ln)) continue; // drop duplicate attributes (keep first)
    seen.add(ln);
    if (opt.removeRedundantAttributes && isRedundantAttr(tag, ln, a, attrs)) continue;
    if (opt.removeEmptyAttributes && a.value !== null) {
      const removable = EMPTY_REMOVABLE_ATTRS.has(ln) || ln.startsWith("on");
      if (removable && a.value.trim() === "") continue;
    }
    if (opt.collapseBooleanAttributes && BOOLEAN_ATTRS.has(ln) && (a.value === null || a.value === "" || a.value.toLowerCase() === ln)) {
      parts.push(a.name);
      continue;
    }
    if (a.value === null) { parts.push(a.name); continue; }
    let val = a.value;
    if (ln === "style" && opt.minifyCSS && val.trim()) val = minifyCss(val).replace(/;$/, "");
    if (opt.normalizeQuotes) {
      parts.push(`${a.name}="${val.replace(/"/g, "&quot;")}"`);
    } else if (a.quote === "") {
      if (val === "" || /[\s"'`=<>]/.test(val)) parts.push(`${a.name}="${val.replace(/"/g, "&quot;")}"`);
      else parts.push(`${a.name}=${val}`);
    } else {
      parts.push(`${a.name}=${a.quote}${val}${a.quote}`);
    }
  }
  return parts.length ? " " + parts.join(" ") : "";
}

function collapseTextWhitespace(value: string, opt: MinifyOptions): string {
  if (!opt.collapseWhitespace) return value;
  if (value.trim() === "") return value.includes("\n") && opt.preserveLineBreaks ? "\n" : " ";
  if (opt.preserveLineBreaks) {
    return value.replace(/[^\S\n]*\n[\s]*/g, "\n").replace(/[^\S\n]+/g, " ");
  }
  return value.replace(/\s+/g, " ");
}

export function minifyHtml(src: string, opt: MinifyOptions): string {
  const tokens = tokenize(src);
  let out = "";
  let preserveDepth = 0;

  for (const t of tokens) {
    switch (t.kind) {
      case "doctype":
        out += t.raw.replace(/\s+/g, " ").trim();
        break;
      case "comment": {
        const keep =
          !opt.removeComments ||
          isImportantComment(t.value) ||
          (opt.preserveConditionalComments && t.conditional);
        if (keep) out += `<!--${t.value}-->`;
        break;
      }
      case "bogus":
        out += t.raw;
        break;
      case "startTag": {
        const isVoid = VOID_ELEMENTS.has(t.name);
        if (!isVoid && !t.selfClosing && PRESERVE_WS_ELEMENTS.has(t.name)) preserveDepth++;
        const attrs = serializeAttrs(t.name, t.attrs, opt);
        if (isVoid) out += `<${t.name}${attrs}>`;
        else if (t.selfClosing) out += `<${t.name}${attrs}/>`;
        else out += `<${t.name}${attrs}>`;
        break;
      }
      case "endTag":
        if (PRESERVE_WS_ELEMENTS.has(t.name)) preserveDepth = Math.max(0, preserveDepth - 1);
        if (opt.removeOptionalTags && OPTIONAL_END_TAGS.has(t.name)) break;
        out += `</${t.name}>`;
        break;
      case "raw": {
        let value = t.value;
        if (t.name === "script" && opt.minifyJS && value.trim()) value = minifyJs(value);
        else if (t.name === "style" && opt.minifyCSS && value.trim()) value = minifyCss(value);
        else if (t.name === "title") value = collapseTextWhitespace(value, opt).trim();
        // textarea content is preserved verbatim
        out += value;
        break;
      }
      case "text":
        out += preserveDepth > 0 ? t.value : collapseTextWhitespace(t.value, opt);
        break;
    }
  }
  return out;
}

// ─── Beautifier ──────────────────────────────────────────────────────────────

const INLINE_ELEMENTS = new Set([
  "a", "abbr", "b", "bdi", "bdo", "cite", "code", "data", "dfn", "em", "i",
  "kbd", "mark", "q", "s", "samp", "small", "span", "strong", "sub", "sup",
  "time", "u", "var", "wbr", "br",
]);

function indentUnit(indent: Indent): string {
  return indent === "tab" ? "\t" : " ".repeat(indent);
}

export function beautifyHtml(src: string, indent: Indent): string {
  const nodes = parseHtmlTree(src);
  const unit = indentUnit(indent);
  const out: string[] = [];

  const write = (node: HtmlNode, depth: number) => {
    const pad = unit.repeat(depth);
    if (node.type === "text") {
      const text = node.value.replace(/\s+/g, " ").trim();
      if (text) out.push(pad + text);
      return;
    }
    if (node.type === "comment") { out.push(`${pad}<!--${node.value}-->`); return; }
    if (node.type === "doctype") { out.push(`${pad}${node.value.replace(/\s+/g, " ").trim()}`); return; }

    const attrs = node.attrs
      .map((a) => (a.value === null ? ` ${a.name}` : ` ${a.name}="${a.value}"`))
      .join("");
    const open = `<${node.name}${attrs}`;

    if (node.void || node.selfClosing) { out.push(`${pad}${open}${node.selfClosing && !node.void ? " />" : ">"}`); return; }

    // raw text elements (script / style / textarea / title)
    if (node.raw !== undefined) {
      const raw = node.raw;
      if (PRESERVE_WS_ELEMENTS.has(node.name)) { out.push(`${pad}${open}>${raw}</${node.name}>`); return; }
      const trimmed = raw.replace(/^\n+|\s+$/g, "");
      if (!trimmed) { out.push(`${pad}${open}></${node.name}>`); return; }
      out.push(`${pad}${open}>`);
      const childPad = unit.repeat(depth + 1);
      const base = trimmed.split("\n").reduce((min, l) => {
        if (!l.trim()) return min;
        const lead = l.match(/^[ \t]*/)?.[0].length ?? 0;
        return Math.min(min, lead);
      }, Infinity);
      const offset = Number.isFinite(base) ? base : 0;
      for (const l of trimmed.split("\n")) out.push(l.trim() ? childPad + l.slice(offset) : "");
      out.push(`${pad}</${node.name}>`);
      return;
    }

    if (PRESERVE_WS_ELEMENTS.has(node.name)) {
      const inner = node.children.map((c) => (c.type === "text" ? c.value : "")).join("");
      out.push(`${pad}${open}>${inner}</${node.name}>`);
      return;
    }

    const kids = node.children.filter((c) => !(c.type === "text" && c.value.trim() === ""));
    if (kids.length === 0) { out.push(`${pad}${open}></${node.name}>`); return; }

    // single text child, or an inline element with only inline/text content → one line
    const onlyText = kids.length === 1 && kids[0].type === "text";
    const allInline = kids.every((c) => c.type === "text" || (c.type === "element" && INLINE_ELEMENTS.has(c.name)));
    if (onlyText || (INLINE_ELEMENTS.has(node.name) && allInline)) {
      const inner = serializeInline(kids);
      if (inner.length <= 80 && !inner.includes("\n")) { out.push(`${pad}${open}>${inner}</${node.name}>`); return; }
    }

    out.push(`${pad}${open}>`);
    kids.forEach((c) => write(c, depth + 1));
    out.push(`${pad}</${node.name}>`);
  };

  const serializeInline = (kids: HtmlNode[]): string =>
    kids
      .map((c) => {
        if (c.type === "text") return c.value.replace(/\s+/g, " ").trim();
        if (c.type === "comment") return `<!--${c.value}-->`;
        if (c.type === "doctype") return c.value;
        const attrs = c.attrs.map((a) => (a.value === null ? ` ${a.name}` : ` ${a.name}="${a.value}"`)).join("");
        if (c.void || c.selfClosing) return `<${c.name}${attrs}>`;
        return `<${c.name}${attrs}>${serializeInline(c.children)}</${c.name}>`;
      })
      .filter(Boolean)
      .join(" ");

  nodes.filter((c) => !(c.type === "text" && c.value.trim() === "")).forEach((node) => write(node, 0));
  return out.join("\n");
}

// ─── Cleanup transforms ──────────────────────────────────────────────────────

export function removeEmptyElements(src: string, indent: Indent): string {
  const prune = (list: HtmlNode[]): HtmlNode[] =>
    list
      .map((node) => (node.type === "element" ? { ...node, children: prune(node.children) } : node))
      .filter((node) => {
        if (node.type === "text") return node.value.trim() !== "";
        if (node.type === "element" && !node.void && !node.selfClosing && node.raw === undefined) {
          return node.children.length > 0 || node.attrs.length > 0;
        }
        return true;
      });
  const nodes = prune(parseHtmlTree(src));
  return beautifyFromNodes(nodes, indent);
}

function beautifyFromNodes(nodes: HtmlNode[], indent: Indent): string {
  // Re-serialize a node tree compactly then beautify for consistent output.
  const serialize = (list: HtmlNode[]): string =>
    list
      .map((c) => {
        if (c.type === "text") return c.value;
        if (c.type === "comment") return `<!--${c.value}-->`;
        if (c.type === "doctype") return c.value;
        const attrs = c.attrs.map((a) => (a.value === null ? ` ${a.name}` : ` ${a.name}="${a.value}"`)).join("");
        if (c.void) return `<${c.name}${attrs}>`;
        if (c.selfClosing) return `<${c.name}${attrs}/>`;
        if (c.raw !== undefined) return `<${c.name}${attrs}>${c.raw}</${c.name}>`;
        return `<${c.name}${attrs}>${serialize(c.children)}</${c.name}>`;
      })
      .join("");
  return beautifyHtml(serialize(nodes), indent);
}

// ─── Analysis ──────────────────────────────────────────────────────────────--

export function analyzeHtml(nodes: HtmlNode[]): HtmlStats {
  const s: HtmlStats = {
    elements: 0, attributes: 0, comments: 0, textNodes: 0, scripts: 0,
    styles: 0, images: 0, links: 0, maxDepth: 0, nodes: 0,
  };
  const walk = (list: HtmlNode[], depth: number) => {
    if (depth > s.maxDepth) s.maxDepth = depth;
    for (const node of list) {
      s.nodes++;
      if (node.type === "element") {
        s.elements++;
        s.attributes += node.attrs.length;
        if (node.name === "script") s.scripts++;
        else if (node.name === "style") s.styles++;
        else if (node.name === "img") s.images++;
        else if (node.name === "a") s.links++;
        walk(node.children, depth + 1);
      } else if (node.type === "text") { if (node.value.trim()) s.textNodes++; }
      else if (node.type === "comment") s.comments++;
    }
  };
  walk(nodes, 1);
  return s;
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

export function computeAnalytics(original: string, minified: string, issues: HtmlIssue[]): Analytics {
  const originalBytes = byteSize(original);
  const minifiedBytes = byteSize(minified);
  const savedBytes = Math.max(0, originalBytes - minifiedBytes);
  const savedPercent = originalBytes > 0 ? (savedBytes / originalBytes) * 100 : 0;
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const infos = issues.filter((i) => i.severity === "info").length;
  const score = Math.max(0, Math.min(100, 100 - errors * 12 - warnings * 5 - infos * 2));
  // crude transfer estimate on a slow 3G link (~50 KB/s effective)
  const loadTimeSavedMs = Math.round((savedBytes / (50 * 1024)) * 1000);
  return {
    originalBytes,
    minifiedBytes,
    savedBytes,
    savedPercent,
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

// ─── Syntax highlighter (safe HTML output) ───────────────────────────────────

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightTag(tag: string): string {
  const m = tag.match(/^(<\/?)([A-Za-z][\w:-]*)([\s\S]*?)(\/?>)$/);
  if (!m) return `<span class="h-pun">${escapeHtml(tag)}</span>`;
  const [, open, name, attrsPart, close] = m;
  const attrs = attrsPart.replace(
    /([^\s"'>/=]+)(\s*=\s*)("[^"]*"|'[^']*'|[^\s"'`=<>]+)|([^\s"'>/=]+)/g,
    (full, an, eq, av, boolName) => {
      if (an) return `<span class="h-attr">${escapeHtml(an)}</span>${escapeHtml(eq)}<span class="h-aval">${escapeHtml(av)}</span>`;
      if (boolName) return `<span class="h-attr">${escapeHtml(boolName)}</span>`;
      return escapeHtml(full);
    },
  );
  return `<span class="h-pun">${escapeHtml(open)}</span><span class="h-tag">${escapeHtml(name)}</span>${attrs}<span class="h-pun">${escapeHtml(close)}</span>`;
}

const H_RE = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|<\/?[A-Za-z][\w:-]*(?:"[^"]*"|'[^']*'|[^<>])*\/?>|[^<]+/g;

export function highlightHtml(src: string): string {
  let out = "";
  H_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  let last = 0;
  while ((m = H_RE.exec(src)) !== null) {
    out += escapeHtml(src.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("<!--")) {
      out += `<span class="${isConditionalComment(t) ? "h-cond" : "h-com"}">${escapeHtml(t)}</span>`;
    } else if (/^<!\s*doctype/i.test(t)) {
      out += `<span class="h-doctype">${escapeHtml(t)}</span>`;
    } else if (t.startsWith("<![") || t.startsWith("<!")) {
      out += `<span class="h-cond">${escapeHtml(t)}</span>`;
    } else if (t.startsWith("<")) {
      out += highlightTag(t);
    } else {
      out += escapeHtml(t).replace(/&amp;(#?\w+);/g, '<span class="h-ent">&amp;$1;</span>');
    }
    last = m.index + t.length;
  }
  out += escapeHtml(src.slice(last));
  return out;
}

// ─── Presets, option metadata & defaults ─────────────────────────────────────

export const DEFAULT_OPTIONS: MinifyOptions = {
  removeComments: true,
  preserveConditionalComments: true,
  collapseWhitespace: true,
  preserveLineBreaks: false,
  removeEmptyAttributes: false,
  removeRedundantAttributes: true,
  collapseBooleanAttributes: true,
  removeOptionalTags: false,
  minifyCSS: true,
  minifyJS: false,
  normalizeQuotes: false,
};

export interface Preset { id: string; name: string; description: string; options: MinifyOptions }

export const PRESETS: Preset[] = [
  {
    id: "safe",
    name: "Safe",
    description: "Strong compression that never changes how the page renders. Recommended default.",
    options: { ...DEFAULT_OPTIONS },
  },
  {
    id: "maximum",
    name: "Maximum",
    description: "Most aggressive — also removes optional tags, empty attributes and minifies inline JS.",
    options: {
      removeComments: true,
      preserveConditionalComments: false,
      collapseWhitespace: true,
      preserveLineBreaks: false,
      removeEmptyAttributes: true,
      removeRedundantAttributes: true,
      collapseBooleanAttributes: true,
      removeOptionalTags: true,
      minifyCSS: true,
      minifyJS: true,
      normalizeQuotes: true,
    },
  },
  {
    id: "conservative",
    name: "Conservative",
    description: "Tidies whitespace while keeping comments, line breaks and inline assets untouched.",
    options: {
      removeComments: false,
      preserveConditionalComments: true,
      collapseWhitespace: true,
      preserveLineBreaks: true,
      removeEmptyAttributes: false,
      removeRedundantAttributes: false,
      collapseBooleanAttributes: false,
      removeOptionalTags: false,
      minifyCSS: false,
      minifyJS: false,
      normalizeQuotes: false,
    },
  },
];

export interface OptionMeta { key: keyof MinifyOptions; label: string; description: string; aggressive?: boolean }
export interface OptionGroup { title: string; options: OptionMeta[] }

export const OPTION_GROUPS: OptionGroup[] = [
  {
    title: "Comments",
    options: [
      { key: "removeComments", label: "Remove comments", description: "Strip <!-- … --> comments from the markup." },
      { key: "preserveConditionalComments", label: "Keep conditional comments", description: "Preserve <!--[if IE]> … <![endif]--> blocks." },
    ],
  },
  {
    title: "Whitespace",
    options: [
      { key: "collapseWhitespace", label: "Collapse whitespace", description: "Collapse runs of spaces, tabs and line breaks (pre & textarea are preserved)." },
      { key: "preserveLineBreaks", label: "Preserve line breaks", description: "Keep a single newline where line breaks existed instead of one space." },
    ],
  },
  {
    title: "Attributes",
    options: [
      { key: "removeRedundantAttributes", label: "Remove redundant attributes", description: "Drop defaults like type=\"text/javascript\" or method=\"get\"." },
      { key: "collapseBooleanAttributes", label: "Collapse boolean attributes", description: "Shorten checked=\"checked\" to checked." },
      { key: "removeEmptyAttributes", label: "Remove empty attributes", description: "Delete empty class, id, style and event-handler attributes.", aggressive: true },
      { key: "normalizeQuotes", label: "Normalize quotes", description: "Rewrite every attribute value with double quotes.", aggressive: true },
    ],
  },
  {
    title: "Tags",
    options: [
      { key: "removeOptionalTags", label: "Remove optional tags", description: "Drop optional closing tags such as </li>, </p> and </body>.", aggressive: true },
    ],
  },
  {
    title: "Inline assets",
    options: [
      { key: "minifyCSS", label: "Minify inline CSS", description: "Compress <style> blocks and style=\"…\" attributes." },
      { key: "minifyJS", label: "Minify inline JavaScript", description: "Remove comments and indentation from <script> blocks.", aggressive: true },
    ],
  },
];

// ─── Sample ──────────────────────────────────────────────────────────────────

export const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Toollyz — HTML Minifier</title>

    <!-- Page styles -->
    <style type="text/css">
      body {
        margin: 0;
        font-family: system-ui, -apple-system, sans-serif;
        background: #0b1020;
        color: #e2e8f0;
      }
      .hero {
        padding: 64px 24px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <header class="hero">
      <h1>Optimize your HTML</h1>
      <p class="">
        Minify, validate and analyze markup directly in your browser —
        nothing is ever uploaded.
      </p>
      <a href="/tools/" class="btn" title="">Explore tools</a>
      <input type="text" name="email" placeholder="you@example.com" />
    </header>

    <script type="text/javascript">
      // Greet the visitor on load
      document.addEventListener('DOMContentLoaded', function () {
        const heading = document.querySelector('h1');
        console.log('Welcome to Toollyz!', heading && heading.textContent);
      });
    </script>
  </body>
</html>`;
