// HTML → Markdown engine. Uses DOMParser to parse the input and walks the
// tree, emitting GitHub-Flavored Markdown. Handles the common cases users
// care about: headings, paragraphs, bold / italic / strike, code blocks
// (with language hint from class="language-foo"), inline code, blockquotes,
// nested lists (ordered + unordered), links, images, horizontal rules,
// tables (with column alignment from style="text-align:left/center/right"),
// and the GFM task-list checkbox extension.
//
// We do NOT execute any scripts and we never use innerHTML; DOMParser is
// safe and never invokes embedded scripts.

export interface ConvertOptions {
  /** Bullet to use for unordered lists. "-" / "*" / "+" — GFM accepts all three. */
  bullet: "-" | "*" | "+";
  /** Heading style — "atx" uses #, "setext" uses underlines (=== / ---) for h1/h2. */
  heading: "atx" | "setext";
  /** Strong delimiter — ** or __. */
  strong: "**" | "__";
  /** Emphasis delimiter — * or _. */
  em: "*" | "_";
  /** Preserve raw HTML for unknown tags (vs stripping them). */
  preserveUnknown: boolean;
  /** Wrap output to this column. 0 = no wrap. */
  wrap: number;
}

export const DEFAULT_OPTIONS: ConvertOptions = {
  bullet: "-",
  heading: "atx",
  strong: "**",
  em: "*",
  preserveUnknown: false,
  wrap: 0,
};

interface Ctx {
  /** Current list indentation depth. */
  listDepth: number;
  /** When inside an OL, the next counter value to emit. */
  olCounter?: number;
  /** Whether we're currently inside a pre or code block (suppresses Markdown escaping). */
  inCode: boolean;
}

const ESCAPE_RE = /([\\`*_{}[\]()#+\-.!|>])/g;

function escapeText(s: string, inCode: boolean): string {
  if (inCode) return s;
  // Don't escape inside code blocks. Otherwise escape Markdown specials.
  return s.replace(ESCAPE_RE, "\\$1");
}

function trimInline(s: string): string {
  return s.replace(/\s+/g, " ").replace(/^ +| +$/g, "");
}

function attr(el: Element, name: string): string {
  return el.getAttribute(name) ?? "";
}

function isHeading(tag: string): boolean {
  return /^h[1-6]$/.test(tag);
}

function classLanguage(el: Element): string {
  const cls = attr(el, "class");
  const m = /language-([\w+\-#.]+)/.exec(cls);
  return m ? m[1] : "";
}

function isVoid(tag: string): boolean {
  return /^(br|hr|img|input)$/.test(tag);
}

interface TableAlign {
  align: ("left" | "center" | "right" | "none")[];
}

function readAlign(cell: HTMLTableCellElement): "left" | "center" | "right" | "none" {
  const ta = (cell.getAttribute("align") ?? cell.style.textAlign ?? "").toLowerCase();
  if (ta === "left" || ta === "center" || ta === "right") return ta;
  return "none";
}

function alignBar(align: TableAlign["align"]): string {
  return align
    .map((a) => {
      if (a === "left") return ":---";
      if (a === "center") return ":---:";
      if (a === "right") return "---:";
      return "---";
    })
    .join(" | ");
}

function emitChildren(node: Node, opt: ConvertOptions, ctx: Ctx): string {
  let out = "";
  for (const child of Array.from(node.childNodes)) {
    out += emitNode(child, opt, ctx);
  }
  return out;
}

function emitInline(node: Node, opt: ConvertOptions, ctx: Ctx): string {
  let out = "";
  for (const child of Array.from(node.childNodes)) {
    out += emitNode(child, opt, ctx);
  }
  return out;
}

function emitNode(node: Node, opt: ConvertOptions, ctx: Ctx): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? "";
    return escapeText(ctx.inCode ? text : trimInline(text), ctx.inCode);
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  // Headings
  if (isHeading(tag)) {
    const level = parseInt(tag.charAt(1), 10);
    const content = emitInline(el, opt, ctx).trim();
    if (opt.heading === "setext" && (level === 1 || level === 2)) {
      const underline = (level === 1 ? "=" : "-").repeat(Math.max(3, content.length));
      return `\n${content}\n${underline}\n\n`;
    }
    return `\n${"#".repeat(level)} ${content}\n\n`;
  }

  // Paragraphs
  if (tag === "p") {
    return `\n${emitInline(el, opt, ctx).trim()}\n\n`;
  }

  // Line break
  if (tag === "br") return "  \n";

  // Horizontal rule
  if (tag === "hr") return "\n---\n\n";

  // Bold / strong
  if (tag === "strong" || tag === "b") {
    return `${opt.strong}${emitInline(el, opt, ctx)}${opt.strong}`;
  }

  // Italic / emphasis
  if (tag === "em" || tag === "i") {
    return `${opt.em}${emitInline(el, opt, ctx)}${opt.em}`;
  }

  // Strikethrough (GFM)
  if (tag === "s" || tag === "del" || tag === "strike") {
    return `~~${emitInline(el, opt, ctx)}~~`;
  }

  // Inline code
  if (tag === "code" && (el.parentElement?.tagName.toLowerCase() ?? "") !== "pre") {
    const text = el.textContent ?? "";
    // Use the right number of backticks so the content survives.
    let ticks = "`";
    while (text.includes(ticks)) ticks += "`";
    return `${ticks}${text}${ticks}`;
  }

  // Code block via <pre><code>
  if (tag === "pre") {
    const codeEl = el.querySelector("code");
    const text = codeEl ? codeEl.textContent ?? "" : el.textContent ?? "";
    const lang = codeEl ? classLanguage(codeEl) : classLanguage(el);
    return `\n\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
  }

  // Links
  if (tag === "a") {
    const href = attr(el, "href");
    const title = attr(el, "title");
    const text = emitInline(el, opt, ctx).trim() || href;
    const titlePart = title ? ` "${title}"` : "";
    if (!href) return text;
    return `[${text}](${href}${titlePart})`;
  }

  // Images
  if (tag === "img") {
    const src = attr(el, "src");
    const alt = attr(el, "alt");
    const title = attr(el, "title");
    if (!src) return "";
    const titlePart = title ? ` "${title}"` : "";
    return `![${alt}](${src}${titlePart})`;
  }

  // Blockquote
  if (tag === "blockquote") {
    const inner = emitChildren(el, opt, ctx).trim();
    return `\n${inner
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n")}\n\n`;
  }

  // Lists
  if (tag === "ul") {
    const items = Array.from(el.children).filter((c) => c.tagName.toLowerCase() === "li");
    let out = "\n";
    for (const li of items) {
      out += renderListItem(li, opt, { ...ctx, listDepth: ctx.listDepth + 1 }, opt.bullet);
    }
    return out + "\n";
  }
  if (tag === "ol") {
    const items = Array.from(el.children).filter((c) => c.tagName.toLowerCase() === "li");
    let out = "\n";
    let counter = parseInt(attr(el, "start") || "1", 10);
    for (const li of items) {
      out += renderListItem(li, opt, { ...ctx, listDepth: ctx.listDepth + 1 }, `${counter}.`);
      counter++;
    }
    return out + "\n";
  }

  // Tables
  if (tag === "table") {
    return renderTable(el as HTMLTableElement, opt, ctx);
  }

  // Definition list — degrade to bold term + indented value
  if (tag === "dl") {
    let out = "\n";
    for (const child of Array.from(el.children)) {
      const childTag = child.tagName.toLowerCase();
      if (childTag === "dt") out += `**${emitInline(child, opt, ctx).trim()}**\n`;
      else if (childTag === "dd") out += `: ${emitInline(child, opt, ctx).trim()}\n\n`;
    }
    return out;
  }

  // Drop scripts and styles
  if (tag === "script" || tag === "style" || tag === "noscript") return "";

  // <div>, <span>, <section>, <article>, etc. — pass through children.
  // For unknown tags with preserveUnknown, keep the raw HTML.
  if (opt.preserveUnknown && !["html", "head", "body", "div", "span", "section", "article", "main", "header", "footer", "nav", "aside"].includes(tag) && !isVoid(tag)) {
    return el.outerHTML;
  }
  return emitChildren(el, opt, ctx);
}

function renderListItem(li: Element, opt: ConvertOptions, ctx: Ctx, marker: string): string {
  const indent = "  ".repeat(Math.max(0, ctx.listDepth - 1));
  // Task list checkbox detection.
  const firstInput = li.querySelector("input[type=checkbox]");
  let taskBox = "";
  if (firstInput) {
    const checked = (firstInput as HTMLInputElement).checked;
    taskBox = checked ? "[x] " : "[ ] ";
    firstInput.remove();
  }
  const content = emitChildren(li, opt, ctx).trim();
  // Indent continuation lines so they stay inside the list item.
  const indented = content
    .split("\n")
    .map((line, i) => (i === 0 ? line : `${indent}  ${line}`))
    .join("\n");
  return `${indent}${marker} ${taskBox}${indented}\n`;
}

function renderTable(table: HTMLTableElement, opt: ConvertOptions, ctx: Ctx): string {
  const rows = Array.from(table.querySelectorAll("tr"));
  if (rows.length === 0) return "";
  const headerRow = rows[0];
  const headerCells = Array.from(headerRow.querySelectorAll("th, td")) as HTMLTableCellElement[];
  const align: TableAlign["align"] = headerCells.map((c) => readAlign(c));
  const out: string[] = [];
  out.push("| " + headerCells.map((c) => emitInline(c, opt, ctx).trim()).join(" | ") + " |");
  out.push("| " + alignBar(align) + " |");
  for (let i = 1; i < rows.length; i++) {
    const cells = Array.from(rows[i].querySelectorAll("th, td")) as HTMLTableCellElement[];
    out.push("| " + cells.map((c) => emitInline(c, opt, ctx).trim().replace(/\|/g, "\\|")).join(" | ") + " |");
  }
  return "\n" + out.join("\n") + "\n\n";
}

export interface ConvertResult {
  ok: boolean;
  output: string;
  /** Counts of major blocks for the stat bar. */
  stats: {
    headings: number;
    paragraphs: number;
    lists: number;
    tables: number;
    codeBlocks: number;
    links: number;
    images: number;
  };
  error?: string;
}

export function htmlToMarkdown(html: string, options: ConvertOptions = DEFAULT_OPTIONS): ConvertResult {
  if (typeof DOMParser === "undefined") {
    return { ok: false, output: "", stats: emptyStats(), error: "DOMParser is not available in this environment." };
  }
  if (!html.trim()) {
    return { ok: true, output: "", stats: emptyStats() };
  }
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(html, "text/html");
  } catch (e) {
    return { ok: false, output: "", stats: emptyStats(), error: e instanceof Error ? e.message : "Parse error" };
  }
  const body = doc.body;
  const ctx: Ctx = { listDepth: 0, inCode: false };
  let out = emitChildren(body, options, ctx);
  // Collapse 3+ newlines and trim.
  out = out.replace(/\n{3,}/g, "\n\n").trim() + "\n";

  // Wrap at the configured column.
  if (options.wrap > 0) out = wrap(out, options.wrap);

  return {
    ok: true,
    output: out,
    stats: {
      headings: body.querySelectorAll("h1,h2,h3,h4,h5,h6").length,
      paragraphs: body.querySelectorAll("p").length,
      lists: body.querySelectorAll("ul,ol").length,
      tables: body.querySelectorAll("table").length,
      codeBlocks: body.querySelectorAll("pre").length,
      links: body.querySelectorAll("a").length,
      images: body.querySelectorAll("img").length,
    },
  };
}

function emptyStats() {
  return { headings: 0, paragraphs: 0, lists: 0, tables: 0, codeBlocks: 0, links: 0, images: 0 };
}

function wrap(text: string, columns: number): string {
  return text
    .split("\n")
    .map((line) => {
      if (line.length <= columns) return line;
      if (/^[ ]*[-*+]\s|^[ ]*\d+\.\s|^[ ]*>|^\s*#|^\s*```/.test(line)) return line;
      const words = line.split(" ");
      let curr = "";
      const out: string[] = [];
      for (const w of words) {
        if ((curr + " " + w).length > columns) {
          out.push(curr.trim());
          curr = w;
        } else {
          curr = curr ? `${curr} ${w}` : w;
        }
      }
      if (curr) out.push(curr.trim());
      return out.join("\n");
    })
    .join("\n");
}
