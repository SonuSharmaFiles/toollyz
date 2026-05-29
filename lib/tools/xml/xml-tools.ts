// XML engine: a hand-written well-formedness parser with precise error
// positions + hints, plus beautify / minify / tree / XML→JSON / escape /
// sort-attributes / diff and a safe syntax highlighter. Dependency-free.
// (XPath uses the browser's native DOMParser + document.evaluate.)

export interface XmlAttr {
  name: string;
  value: string;
}
export type XmlNode =
  | { type: "element"; name: string; attrs: XmlAttr[]; children: XmlNode[]; selfClosing: boolean }
  | { type: "text"; value: string }
  | { type: "comment"; value: string }
  | { type: "cdata"; value: string }
  | { type: "pi"; value: string }
  | { type: "decl"; value: string };

export interface XmlError {
  message: string;
  line: number;
  column: number;
  pos: number;
  hint?: string;
}
export interface XmlParseResult {
  ok: boolean;
  nodes?: XmlNode[];
  error?: XmlError;
}

class XErr {
  constructor(public pos: number, public message: string, public hint?: string) {}
}

function lineCol(src: string, pos: number): { line: number; column: number } {
  let line = 1;
  let col = 1;
  const end = Math.min(pos, src.length);
  for (let k = 0; k < end; k++) {
    if (src[k] === "\n") { line++; col = 1; } else col++;
  }
  return { line, column: col };
}

const NAME_START = /[A-Za-z_:]/;
const NAME_CHAR = /[A-Za-z0-9_:.\-]/;

export function parseXml(src: string): XmlParseResult {
  let i = 0;
  const n = src.length;
  const ws = () => { while (i < n && /\s/.test(src[i])) i++; };

  function parseName(): string {
    if (i >= n || !NAME_START.test(src[i])) throw new XErr(i, "Expected a tag name", "Names must start with a letter, underscore or colon.");
    let s = "";
    while (i < n && NAME_CHAR.test(src[i])) { s += src[i]; i++; }
    return s;
  }

  function parseAttrs(): XmlAttr[] {
    const attrs: XmlAttr[] = [];
    for (;;) {
      ws();
      const c = src[i];
      if (c === ">" || c === "/" || i >= n) return attrs;
      if (!NAME_START.test(c)) throw new XErr(i, "Invalid attribute name", "Attributes look like name=\"value\".");
      const name = parseName();
      ws();
      if (src[i] !== "=") throw new XErr(i, `Attribute "${name}" is missing a value`, 'In XML every attribute needs a value: name="value".');
      i++;
      ws();
      const q = src[i];
      if (q !== '"' && q !== "'") throw new XErr(i, "Attribute value must be quoted", 'Wrap the value in double quotes, e.g. name="value".');
      i++;
      let val = "";
      while (i < n && src[i] !== q) { val += src[i]; i++; }
      if (i >= n) throw new XErr(i, "Unterminated attribute value", "Add the closing quote.");
      i++;
      if (attrs.some((a) => a.name === name)) throw new XErr(i, `Duplicate attribute "${name}"`, "Each attribute may appear only once per element.");
      attrs.push({ name, value: val });
    }
  }

  function parseElement(): XmlNode {
    i++; // <
    const name = parseName();
    const attrs = parseAttrs();
    ws();
    if (src[i] === "/" && src[i + 1] === ">") { i += 2; return { type: "element", name, attrs, children: [], selfClosing: true }; }
    if (src[i] !== ">") throw new XErr(i, `Expected '>' to close <${name}>`, "Finish the opening tag with '>' or '/>'.");
    i++;
    const children: XmlNode[] = [];
    for (;;) {
      if (i >= n) throw new XErr(i, `Unclosed tag <${name}>`, `Add a closing </${name}> tag.`);
      if (src[i] === "<") {
        if (src[i + 1] === "/") {
          const closePos = i;
          i += 2;
          const close = parseName();
          ws();
          if (src[i] !== ">") throw new XErr(i, "Expected '>' in closing tag", "Close the tag with '>'.");
          i++;
          if (close !== name) throw new XErr(closePos, `Mismatched closing tag </${close}>`, `Expected </${name}> to match the open <${name}>.`);
          return { type: "element", name, attrs, children, selfClosing: false };
        }
        children.push(parseMarkup());
      } else {
        children.push(parseText());
      }
    }
  }

  function parseText(): { type: "text"; value: string } {
    let s = "";
    while (i < n && src[i] !== "<") { s += src[i]; i++; }
    return { type: "text", value: s };
  }

  function parseMarkup(): XmlNode {
    if (src.startsWith("<!--", i)) {
      const end = src.indexOf("-->", i + 4);
      if (end === -1) throw new XErr(i, "Unterminated comment", "Comments must end with -->.");
      const value = src.slice(i + 4, end);
      i = end + 3;
      return { type: "comment", value };
    }
    if (src.startsWith("<![CDATA[", i)) {
      const end = src.indexOf("]]>", i + 9);
      if (end === -1) throw new XErr(i, "Unterminated CDATA section", "CDATA must end with ]]>.");
      const value = src.slice(i + 9, end);
      i = end + 3;
      return { type: "cdata", value };
    }
    if (src.startsWith("<?", i)) {
      const end = src.indexOf("?>", i + 2);
      if (end === -1) throw new XErr(i, "Unterminated processing instruction", "Processing instructions end with ?>.");
      const value = src.slice(i + 2, end);
      i = end + 2;
      return { type: value.trimStart().toLowerCase().startsWith("xml") ? "decl" : "pi", value };
    }
    if (src.startsWith("<!", i)) {
      const end = src.indexOf(">", i + 2);
      if (end === -1) throw new XErr(i, "Unterminated declaration", "Declarations end with '>'.");
      const value = src.slice(i, end + 1);
      i = end + 1;
      return { type: "decl", value };
    }
    if (src[i + 1] === "/") throw new XErr(i, "Unexpected closing tag", "There is no matching open tag here.");
    return parseElement();
  }

  try {
    const nodes: XmlNode[] = [];
    let elementCount = 0;
    while (i < n) {
      if (src[i] === "<") {
        const node = parseMarkup();
        if (node.type === "element") elementCount++;
        nodes.push(node);
      } else {
        const before = i;
        const t = parseText();
        if (t.value.trim() !== "" && elementCount === 0) throw new XErr(before, "Text is not allowed before the root element", "XML must start with a single root element (after any prolog).");
        if (t.value.trim() !== "" && elementCount >= 1) {
          // trailing/inter-root text
          throw new XErr(before, "Text is not allowed outside the root element", "All content must live inside a single root element.");
        }
        nodes.push(t);
      }
      if (elementCount > 1) throw new XErr(i, "Multiple root elements", "An XML document may have only one root element.");
    }
    if (elementCount === 0) throw new XErr(0, "No root element found", "Add a single root element, e.g. <root>…</root>.");
    return { ok: true, nodes };
  } catch (e) {
    if (e instanceof XErr) {
      const { line, column } = lineCol(src, e.pos);
      return { ok: false, error: { message: e.message, line, column, pos: e.pos, hint: e.hint } };
    }
    return { ok: false, error: { message: "Invalid XML", line: 1, column: 1, pos: 0 } };
  }
}

// ─── Serialize (beautify / minify) ───────────────────────────────────────────

export type Indent = 2 | 4 | "tab";

function indentStr(indent: Indent, depth: number): string {
  const unit = indent === "tab" ? "\t" : " ".repeat(indent);
  return unit.repeat(depth);
}

function serializeAttrs(attrs: XmlAttr[]): string {
  return attrs.map((a) => ` ${a.name}="${a.value}"`).join("");
}

function significantChildren(children: XmlNode[]): XmlNode[] {
  return children.filter((c) => !(c.type === "text" && c.value.trim() === ""));
}

export function beautifyXml(nodes: XmlNode[], indent: Indent): string {
  const out: string[] = [];
  const write = (node: XmlNode, depth: number) => {
    const pad = indentStr(indent, depth);
    if (node.type === "text") {
      const t = node.value.trim();
      if (t) out.push(pad + escapeForSerialize(t));
      return;
    }
    if (node.type === "comment") { out.push(`${pad}<!--${node.value}-->`); return; }
    if (node.type === "cdata") { out.push(`${pad}<![CDATA[${node.value}]]>`); return; }
    if (node.type === "pi") { out.push(`${pad}<?${node.value}?>`); return; }
    if (node.type === "decl") { out.push(`${pad}${node.value.startsWith("<") ? node.value : `<?${node.value}?>`}`); return; }
    // element
    const open = `<${node.name}${serializeAttrs(node.attrs)}`;
    if (node.selfClosing || node.children.length === 0) {
      out.push(`${pad}${open}${node.selfClosing || node.children.length === 0 ? "/>" : `></${node.name}>`}`);
      return;
    }
    const kids = significantChildren(node.children);
    const onlyText = kids.length === 1 && kids[0].type === "text";
    if (onlyText) {
      out.push(`${pad}${open}>${escapeForSerialize((kids[0] as { value: string }).value.trim())}</${node.name}>`);
      return;
    }
    out.push(`${pad}${open}>`);
    kids.forEach((c) => write(c, depth + 1));
    out.push(`${pad}</${node.name}>`);
  };
  significantChildren(nodes).forEach((node) => write(node, 0));
  return out.join("\n");
}

export function minifyXml(nodes: XmlNode[]): string {
  let out = "";
  const write = (node: XmlNode) => {
    if (node.type === "text") { const t = node.value.trim(); if (t) out += escapeForSerialize(t); return; }
    if (node.type === "comment") { out += `<!--${node.value}-->`; return; }
    if (node.type === "cdata") { out += `<![CDATA[${node.value}]]>`; return; }
    if (node.type === "pi") { out += `<?${node.value}?>`; return; }
    if (node.type === "decl") { out += node.value.startsWith("<") ? node.value : `<?${node.value}?>`; return; }
    const open = `<${node.name}${serializeAttrs(node.attrs)}`;
    const kids = significantChildren(node.children);
    if (node.selfClosing || kids.length === 0) { out += `${open}/>`; return; }
    out += `${open}>`;
    kids.forEach(write);
    out += `</${node.name}>`;
  };
  significantChildren(nodes).forEach(write);
  return out;
}

function escapeForSerialize(s: string): string {
  // Re-escape bare & and < in text (leave existing entities intact).
  return s.replace(/&(?!#?\w+;)/g, "&amp;").replace(/</g, "&lt;");
}

// ─── Transforms ──────────────────────────────────────────────────────────────

export function sortAttributes(nodes: XmlNode[]): XmlNode[] {
  const walk = (node: XmlNode): XmlNode => {
    if (node.type !== "element") return node;
    return { ...node, attrs: [...node.attrs].sort((a, b) => a.name.localeCompare(b.name)), children: node.children.map(walk) };
  };
  return nodes.map(walk);
}

export function removeEmptyNodes(nodes: XmlNode[]): XmlNode[] {
  const clean = (list: XmlNode[]): XmlNode[] =>
    list
      .map((node) => {
        if (node.type === "element") return { ...node, children: clean(node.children) };
        return node;
      })
      .filter((node) => {
        if (node.type === "text") return node.value.trim() !== "";
        if (node.type === "element" && !node.selfClosing) {
          return node.children.length > 0 || node.attrs.length > 0;
        }
        return true;
      });
  return clean(nodes);
}

export function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
export function unescapeXml(text: string): string {
  return text
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, "&");
}

// ─── XML → JSON ──────────────────────────────────────────────────────────────

function decodeEntities(s: string): string {
  return unescapeXml(s);
}

function elementToJson(node: Extract<XmlNode, { type: "element" }>): unknown {
  const obj: Record<string, unknown> = {};
  for (const a of node.attrs) obj[`@${a.name}`] = decodeEntities(a.value);
  const kids = significantChildren(node.children);
  const texts = kids.filter((c) => c.type === "text" || c.type === "cdata").map((c) => decodeEntities((c as { value: string }).value).trim()).filter(Boolean);
  const elements = kids.filter((c) => c.type === "element") as Extract<XmlNode, { type: "element" }>[];

  if (elements.length === 0 && node.attrs.length === 0) {
    return texts.join(" ");
  }
  if (texts.length) obj["#text"] = texts.join(" ");
  for (const el of elements) {
    const val = elementToJson(el);
    if (el.name in obj) {
      const cur = obj[el.name];
      if (Array.isArray(cur)) cur.push(val);
      else obj[el.name] = [cur, val];
    } else obj[el.name] = val;
  }
  return obj;
}

export function xmlToJson(nodes: XmlNode[]): unknown {
  const root = nodes.find((nd) => nd.type === "element") as Extract<XmlNode, { type: "element" }> | undefined;
  if (!root) return {};
  return { [root.name]: elementToJson(root) };
}

// ─── Analysis ────────────────────────────────────────────────────────────────

export interface XmlStats {
  elements: number;
  attributes: number;
  textNodes: number;
  comments: number;
  cdata: number;
  namespaces: number;
  maxDepth: number;
  nodes: number;
}

export function analyzeXml(nodes: XmlNode[]): XmlStats {
  const s: XmlStats = { elements: 0, attributes: 0, textNodes: 0, comments: 0, cdata: 0, namespaces: 0, maxDepth: 0, nodes: 0 };
  const ns = new Set<string>();
  const walk = (list: XmlNode[], depth: number) => {
    if (depth > s.maxDepth) s.maxDepth = depth;
    for (const node of list) {
      s.nodes++;
      if (node.type === "element") {
        s.elements++;
        s.attributes += node.attrs.length;
        for (const a of node.attrs) {
          if (a.name === "xmlns" || a.name.startsWith("xmlns:")) ns.add(a.value);
        }
        walk(node.children, depth + 1);
      } else if (node.type === "text") { if (node.value.trim()) s.textNodes++; }
      else if (node.type === "comment") s.comments++;
      else if (node.type === "cdata") s.cdata++;
    }
  };
  walk(nodes, 1);
  s.namespaces = ns.size;
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
export function healthScore(valid: boolean, stats: XmlStats | null): number {
  if (!valid || !stats) return 0;
  let score = 100;
  if (stats.maxDepth > 14) score -= Math.min(20, (stats.maxDepth - 14) * 2);
  if (stats.nodes > 20000) score -= 10;
  return Math.max(40, score);
}

// ─── Line diff (beautified) ──────────────────────────────────────────────────

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

// ─── Syntax highlighter (safe HTML) ──────────────────────────────────────────

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightTag(tag: string): string {
  // tag includes the surrounding < ... >
  const m = tag.match(/^(<\/?)([A-Za-z_:][\w:.\-]*)([\s\S]*?)(\/?>)$/);
  if (!m) return `<span class="x-pun">${escapeHtml(tag)}</span>`;
  const [, open, name, attrsPart, close] = m;
  const attrs = attrsPart.replace(/([A-Za-z_:][\w:.\-]*)(\s*=\s*)("(?:[^"]*)"|'(?:[^']*)')/g, (_mm, an, eq, av) =>
    `<span class="x-attr">${escapeHtml(an)}</span>${escapeHtml(eq)}<span class="x-aval">${escapeHtml(av)}</span>`,
  );
  return `<span class="x-pun">${escapeHtml(open)}</span><span class="x-tag">${escapeHtml(name)}</span>${attrs}<span class="x-pun">${escapeHtml(close)}</span>`;
}

const X_RE = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>|<\/?[A-Za-z_:][\w:.\-]*(?:"[^"]*"|'[^']*'|[^<>])*\/?>|[^<]+/g;

export function highlightXml(src: string): string {
  let out = "";
  X_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  let last = 0;
  while ((m = X_RE.exec(src)) !== null) {
    out += escapeHtml(src.slice(last, m.index));
    const t = m[0];
    if (t.startsWith("<!--")) out += `<span class="x-com">${escapeHtml(t)}</span>`;
    else if (t.startsWith("<![CDATA[")) out += `<span class="x-cdata">${escapeHtml(t)}</span>`;
    else if (t.startsWith("<?")) out += `<span class="x-pi">${escapeHtml(t)}</span>`;
    else if (t.startsWith("<!DOCTYPE")) out += `<span class="x-pi">${escapeHtml(t)}</span>`;
    else if (t.startsWith("<")) out += highlightTag(t);
    else out += escapeHtml(t).replace(/&amp;(#?\w+);/g, '<span class="x-ent">&amp;$1;</span>');
    last = m.index + t.length;
  }
  out += escapeHtml(src.slice(last));
  return out;
}

export function structurePaths(nodes: XmlNode[]): string[] {
  const paths = new Set<string>();
  const walk = (list: XmlNode[], prefix: string) => {
    for (const node of list) {
      if (node.type === "element") {
        const p = `${prefix}/${node.name}`;
        paths.add(p);
        walk(node.children, p);
      }
    }
  };
  walk(nodes, "");
  return [...paths].sort();
}

export const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog version="2.6">
  <!-- Toollyz sample feed -->
  <product id="1" featured="true">
    <name>JSON Formatter</name>
    <category>developer</category>
    <rating>4.9</rating>
  </product>
  <product id="2" featured="false">
    <name>XML Formatter</name>
    <category>developer</category>
    <rating>4.8</rating>
  </product>
</catalog>`;
