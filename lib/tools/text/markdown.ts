// GitHub-Flavored-Markdown → HTML renderer with a lightweight, safe syntax
// highlighter. No external dependencies. All user text is HTML-escaped before
// any tags are produced, so markup can never be injected.

const FENCE = String.fromCharCode(2); // fenced code-block placeholder
const TOKEN = String.fromCharCode(4); // inline token placeholder

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function safeUrl(url: string): string {
  return /^(https?:|mailto:|\/|#|tel:)/i.test(url) ? url : "#";
}

// ─── Emoji shortcodes ────────────────────────────────────────────────────────

const EMOJI: Record<string, string> = {
  smile: "😄", grinning: "😀", joy: "😂", laughing: "😆", wink: "😉", blush: "😊",
  heart: "❤️", fire: "🔥", rocket: "🚀", tada: "🎉", sparkles: "✨", star: "⭐",
  "+1": "👍", thumbsup: "👍", "-1": "👎", thumbsdown: "👎", clap: "👏", pray: "🙏",
  wave: "👋", eyes: "👀", "100": "💯", check: "✅", white_check_mark: "✅", x: "❌",
  warning: "⚠️", bulb: "💡", book: "📖", books: "📚", pencil: "✏️", memo: "📝",
  computer: "💻", bug: "🐛", wrench: "🔧", hammer: "🔨", zap: "⚡", lock: "🔒",
  key: "🔑", calendar: "📅", clock: "🕐", email: "📧", phone: "📱", coffee: "☕",
  rotating_light: "🚨", package: "📦", bookmark: "🔖", mag: "🔍", link: "🔗",
  art: "🎨", recycle: "♻️", sos: "🆘", ok: "🆗", new: "🆕", construction: "🚧",
  sun: "☀️", moon: "🌙", earth_americas: "🌎", trophy: "🏆", gift: "🎁", bell: "🔔",
};

// ─── Syntax highlighting ─────────────────────────────────────────────────────

const KEYWORDS = new Set([
  "abstract","and","as","async","await","break","case","catch","class","const","continue","def","default",
  "del","do","elif","else","enum","except","export","extends","finally","for","from","func","function","global",
  "goto","if","implements","import","in","instanceof","interface","is","lambda","let","namespace","new","not","or",
  "package","pass","private","protected","public","raise","readonly","return","static","struct","super","switch",
  "template","then","throw","throws","try","type","typeof","union","unless","until","using","var","void","while",
  "with","yield","select","insert","update","delete","where","join","group","order","by","limit","values","table",
  "echo","fi","then","elif","do","done","local","fn","impl","trait","mut","pub","use","match",
]);
const BUILTINS = new Set([
  "true","false","null","None","True","False","nil","undefined","NaN","Infinity","this","self","print","console",
  "len","range","int","str","float","bool","list","dict","set","map","require","module","exports","document","window",
]);

const HASH_LANGS = new Set(["bash","sh","shell","python","py","ruby","rb","yaml","yml","toml","ini","makefile","r","perl"]);

export function highlightCode(code: string, lang = ""): string {
  const l = lang.toLowerCase();
  const comment = HASH_LANGS.has(l) ? "#[^\\n]*" : "\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/";
  const re = new RegExp(
    `(${comment})|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\`)|(0[xX][0-9a-fA-F]+|\\b\\d[\\d_]*(?:\\.\\d+)?(?:[eE][+-]?\\d+)?)|([A-Za-z_$][\\w$]*)`,
    "g",
  );
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    out += escapeHtml(code.slice(last, m.index));
    if (m[1]) out += `<span class="tok-c">${escapeHtml(m[1])}</span>`;
    else if (m[2]) out += `<span class="tok-s">${escapeHtml(m[2])}</span>`;
    else if (m[3]) out += `<span class="tok-n">${escapeHtml(m[3])}</span>`;
    else if (m[4]) {
      const w = m[4];
      const cls = KEYWORDS.has(w) ? "tok-k" : BUILTINS.has(w) ? "tok-b" : "";
      out += cls ? `<span class="${cls}">${escapeHtml(w)}</span>` : escapeHtml(w);
    }
    last = m.index + m[0].length;
  }
  out += escapeHtml(code.slice(last));
  return out;
}

// ─── Inline rendering ────────────────────────────────────────────────────────

function inline(text: string): string {
  const tokens: string[] = [];
  const stash = (h: string) => {
    tokens.push(h);
    return `${TOKEN}${tokens.length - 1}${TOKEN}`;
  };

  let t = text;
  // inline code
  t = t.replace(/`([^`]+)`/g, (_m, c) => stash(`<code>${c}</code>`));
  // images
  t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_m, alt, url) =>
    stash(`<img src="${safeUrl(url)}" alt="${alt}" loading="lazy" />`),
  );
  // links
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_m, label, url) =>
    stash(`<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`),
  );
  // bare autolinks
  t = t.replace(/(^|[\s(])(https?:\/\/[^\s)]+)/g, (_m, pre, url) =>
    `${pre}${stash(`<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${url}</a>`)}`,
  );
  // emphasis
  t = t
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/(^|[^A-Za-z0-9])\*(?=\S)(.+?)(?<=\S)\*(?![A-Za-z0-9])/g, "$1<em>$2</em>")
    .replace(/(^|[^A-Za-z0-9])_(?=\S)(.+?)(?<=\S)_(?![A-Za-z0-9])/g, "$1<em>$2</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/==(.+?)==/g, "<mark>$1</mark>");
  // emoji shortcodes
  t = t.replace(/:([a-z0-9_+-]+):/g, (m, name) => EMOJI[name] ?? m);
  // restore tokens
  return t.replace(new RegExp(`${TOKEN}(\\d+)${TOKEN}`, "g"), (_m, i) => tokens[+i]);
}

// ─── Heading ids ─────────────────────────────────────────────────────────────

function slugifyHeading(text: string, seen: Map<string, number>): string {
  const base = text
    .replace(/<[^>]+>/g, "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-") || "section";
  const n = seen.get(base) ?? 0;
  seen.set(base, n + 1);
  return n === 0 ? base : `${base}-${n}`;
}

export interface OutlineItem {
  level: number;
  text: string;
  id: string;
}

export function extractOutline(md: string): OutlineItem[] {
  const noCode = md.replace(/```[\s\S]*?```/g, "");
  const seen = new Map<string, number>();
  const items: OutlineItem[] = [];
  for (const line of noCode.split("\n")) {
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const text = h[2].replace(/[*_`~]/g, "").trim();
      items.push({ level: h[1].length, text, id: slugifyHeading(text, seen) });
    }
  }
  return items;
}

export interface MdCounts {
  headings: number;
  links: number;
  images: number;
  codeBlocks: number;
  tasks: number;
  tables: number;
}

export function countElements(md: string): MdCounts {
  const codeBlocks = (md.match(/```/g)?.length ?? 0) >> 1;
  const noCode = md.replace(/```[\s\S]*?```/g, "");
  return {
    headings: (noCode.match(/^#{1,6}\s+/gm) ?? []).length,
    images: (noCode.match(/!\[[^\]]*\]\([^)]*\)/g) ?? []).length,
    links: (noCode.match(/(?<!!)\[[^\]]+\]\([^)]*\)/g) ?? []).length,
    tasks: (noCode.match(/^\s*[-*+]\s+\[[ xX]\]/gm) ?? []).length,
    tables: (noCode.match(/^\s*\|?.*\|.*\n\s*\|?[\s:|-]+\|?[\s:|-]*$/gm) ?? []).length,
    codeBlocks,
  };
}

// ─── Block rendering ─────────────────────────────────────────────────────────

function alignOf(cell: string): string {
  const c = cell.trim();
  const left = c.startsWith(":");
  const right = c.endsWith(":");
  if (left && right) return " style=\"text-align:center\"";
  if (right) return " style=\"text-align:right\"";
  if (left) return " style=\"text-align:left\"";
  return "";
}

function splitRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, "|").trim());
}

const SEP_RE = /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)+\|?\s*$/;

export function renderMarkdown(md: string): string {
  if (!md.trim()) return "";

  const fences: { lang: string; code: string }[] = [];
  let src = md.replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, lang, code) => {
    fences.push({ lang, code: code.replace(/\n$/, "") });
    return `${FENCE}${fences.length - 1}${FENCE}`;
  });

  src = escapeHtml(src);
  const lines = src.split("\n");
  const fenceLine = new RegExp(`^${FENCE}(\\d+)${FENCE}\\s*$`);
  const seen = new Map<string, number>();
  const html: string[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      html.push(`<p>${inline(para.join("\n").trim()).replace(/\n/g, "<br/>")}</p>`);
      para = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    const fence = line.match(fenceLine);
    if (fence) {
      flushPara();
      const b = fences[+fence[1]];
      const label = b.lang ? `<span class="md-lang">${escapeHtml(b.lang)}</span>` : "";
      html.push(`<pre data-lang="${escapeHtml(b.lang)}">${label}<code>${highlightCode(b.code, b.lang)}</code></pre>`);
      i++;
      continue;
    }
    if (/^\s*$/.test(line)) {
      flushPara();
      i++;
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushPara();
      const lvl = heading[1].length;
      const inner = inline(heading[2].trim());
      const id = slugifyHeading(heading[2].trim(), seen);
      html.push(`<h${lvl} id="${id}">${inner}</h${lvl}>`);
      i++;
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flushPara();
      html.push("<hr/>");
      i++;
      continue;
    }
    // Table: header row + separator row
    if (line.includes("|") && i + 1 < lines.length && SEP_RE.test(lines[i + 1])) {
      flushPara();
      const headers = splitRow(line);
      const aligns = splitRow(lines[i + 1]).map(alignOf);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const thead = `<thead><tr>${headers.map((h, c) => `<th${aligns[c] ?? ""}>${inline(h)}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${rows.map((r) => `<tr>${r.map((cell, c) => `<td${aligns[c] ?? ""}>${inline(cell)}</td>`).join("")}</tr>`).join("")}</tbody>`;
      html.push(`<table>${thead}${tbody}</table>`);
      continue;
    }
    // Blockquote (">" was escaped to "&gt;")
    if (/^\s*&gt;\s?/.test(line)) {
      flushPara();
      const quote: string[] = [];
      while (i < lines.length && /^\s*&gt;\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*&gt;\s?/, ""));
        i++;
      }
      html.push(`<blockquote>${inline(quote.join("\n").trim()).replace(/\n/g, "<br/>")}</blockquote>`);
      continue;
    }
    // Unordered / task list
    if (/^\s*[-*+]\s+/.test(line)) {
      flushPara();
      const items: string[] = [];
      let isTask = false;
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        let item = lines[i].replace(/^\s*[-*+]\s+/, "");
        const task = item.match(/^\[([ xX])\]\s+(.*)$/);
        if (task) {
          isTask = true;
          const checked = task[1].toLowerCase() === "x";
          items.push(`<li class="md-task"><input type="checkbox" disabled${checked ? " checked" : ""}/> ${inline(task[2])}</li>`);
        } else {
          items.push(`<li>${inline(item.trim())}</li>`);
        }
        i++;
      }
      html.push(`<ul${isTask ? ' class="md-tasklist"' : ""}>${items.join("")}</ul>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, "").trim())}</li>`);
        i++;
      }
      html.push(`<ol>${items.join("")}</ol>`);
      continue;
    }
    para.push(line);
    i++;
  }
  flushPara();

  return html
    .join("\n")
    .replace(new RegExp(`${FENCE}(\\d+)${FENCE}`, "g"), (_m, idx) => `<code>${escapeHtml(fences[+idx]?.code ?? "")}</code>`);
}

// ─── Export document ─────────────────────────────────────────────────────────

export function htmlDocument(title: string, bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:820px;margin:40px auto;padding:0 24px;color:#1f2328;line-height:1.6}
  h1,h2{border-bottom:1px solid #d8dee4;padding-bottom:.3em}
  h1,h2,h3,h4{line-height:1.25;margin:1.4em 0 .6em;font-weight:600}
  h1{font-size:2em}h2{font-size:1.5em}h3{font-size:1.25em}
  p{margin:0 0 1em}ul,ol{margin:0 0 1em 1.6em}li{margin:.2em 0}
  blockquote{border-left:.25em solid #d0d7de;margin:0 0 1em;padding:0 1em;color:#656d76}
  code{background:#eff1f3;padding:.2em .4em;border-radius:6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:85%}
  pre{position:relative;background:#0d1117;color:#e6edf3;padding:16px;border-radius:10px;overflow:auto;margin:0 0 1em}
  pre code{background:none;padding:0;font-size:90%}
  table{border-collapse:collapse;margin:0 0 1em;display:block;overflow:auto}
  th,td{border:1px solid #d0d7de;padding:6px 13px}th{background:#f6f8fa}
  img{max-width:100%}a{color:#0969da}mark{background:#fff8c5}hr{height:1px;background:#d8dee4;border:0;margin:1.6em 0}
  .md-tasklist{list-style:none;margin-left:.2em}.md-task input{margin-right:.4em}
  .md-lang{position:absolute;top:8px;right:12px;font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:.05em}
  .tok-c{color:#8b949e;font-style:italic}.tok-s{color:#7ee787}.tok-n{color:#79c0ff}.tok-k{color:#ff7b72}.tok-b{color:#d2a8ff}
  @media print{body{margin:0;max-width:none}pre{background:#f6f8fa;color:#1f2328}.tok-c{color:#6e7781}.tok-s{color:#0a3069}.tok-n{color:#0550ae}.tok-k{color:#cf222e}.tok-b{color:#8250df}}
</style></head><body>${bodyHtml}</body></html>`;
}

// ─── Templates ───────────────────────────────────────────────────────────────

export interface Template {
  id: string;
  label: string;
  desc: string;
  content: string;
}

export const TEMPLATES: Template[] = [
  {
    id: "readme", label: "README", desc: "Project README with badges & sections",
    content: `# Project Name

> One-line description of what this project does.

![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- ✨ Feature one
- ⚡ Feature two
- 🔒 Feature three

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Usage

\`\`\`js
import { thing } from "project-name";

thing();
\`\`\`

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

[MIT](https://choosealicense.com/licenses/mit/)`,
  },
  {
    id: "blog", label: "Blog post", desc: "Article scaffold with intro & sections",
    content: `# How to Write Great Documentation

*Published on January 1, 2026 · 5 min read*

Writing clear docs is a superpower. Here's how to do it well.

## Why it matters

Good documentation saves time and builds trust.

## The three rules

1. **Be concise** — respect the reader's time.
2. **Show examples** — code speaks louder than prose.
3. **Stay current** — outdated docs are worse than none.

> "Documentation is a love letter to your future self."

## Conclusion

Start small, write often, and iterate.`,
  },
  {
    id: "docs", label: "Documentation", desc: "API/feature documentation page",
    content: `# API Reference

## Overview

This document describes the public API.

## Authentication

All requests require an API key in the header:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_KEY" https://api.example.com/v1
\`\`\`

## Endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | /users | List users |
| POST | /users | Create a user |
| DELETE | /users/:id | Delete a user |

## Errors

| Code | Meaning |
| ---- | ------- |
| 400 | Bad request |
| 401 | Unauthorized |
| 404 | Not found |`,
  },
  {
    id: "meeting", label: "Meeting notes", desc: "Agenda, decisions & action items",
    content: `# Meeting Notes — January 1, 2026

**Attendees:** Alice, Bob, Carol

## Agenda

1. Review last sprint
2. Plan the release
3. Open questions

## Decisions

- ✅ Ship v2 on Friday
- ✅ Freeze new features this week

## Action items

- [ ] Alice: finalize the changelog
- [ ] Bob: update the docs
- [x] Carol: prepare release notes

## Notes

Discussion went well; team is aligned.`,
  },
  {
    id: "changelog", label: "Changelog", desc: "Keep-a-Changelog format",
    content: `# Changelog

All notable changes to this project are documented here.

## [1.2.0] - 2026-01-01

### Added
- New export to PDF
- Dark mode support

### Changed
- Improved parsing performance

### Fixed
- Crash when opening empty files

## [1.1.0] - 2025-12-01

### Added
- Markdown templates`,
  },
  {
    id: "project-plan", label: "Project plan", desc: "Goals, milestones & timeline",
    content: `# Project Plan

## Goal

Describe the desired outcome in one sentence.

## Milestones

- [ ] **Phase 1:** Research & design
- [ ] **Phase 2:** Build MVP
- [ ] **Phase 3:** Beta testing
- [ ] **Phase 4:** Launch 🚀

## Timeline

| Phase | Owner | Due |
| ----- | ----- | --- |
| Research | Alice | Jan 15 |
| MVP | Bob | Feb 28 |
| Launch | Team | Mar 30 |

## Risks

> Identify blockers early and mitigate them.`,
  },
  {
    id: "guide", label: "Technical guide", desc: "Step-by-step how-to tutorial",
    content: `# How to Deploy with Zero Downtime

## Prerequisites

- A running server
- \`docker\` installed

## Steps

### 1. Build the image

\`\`\`bash
docker build -t app:latest .
\`\`\`

### 2. Run health checks

\`\`\`bash
curl http://localhost:8080/health
\`\`\`

### 3. Switch traffic

Update the load balancer to point to the new container.

> **Tip:** Always keep the previous version running until the new one is healthy.`,
  },
  {
    id: "kb", label: "Knowledge base", desc: "Q&A help-center article",
    content: `# How do I reset my password?

If you've forgotten your password, follow these steps.

## Steps

1. Go to the **Sign in** page.
2. Click **Forgot password**.
3. Enter your email address.
4. Check your inbox for a reset link.

## Troubleshooting

- **Didn't get the email?** Check your spam folder.
- **Link expired?** Request a new one — links last 1 hour.

## Related articles

- [Updating your email](#)
- [Two-factor authentication](#)`,
  },
];

// ─── Cheat sheet ─────────────────────────────────────────────────────────────

export const CHEAT_SHEET: { label: string; syntax: string }[] = [
  { label: "Heading", syntax: "# H1  ·  ## H2  ·  ### H3" },
  { label: "Bold", syntax: "**bold text**" },
  { label: "Italic", syntax: "*italic text*" },
  { label: "Strikethrough", syntax: "~~struck~~" },
  { label: "Highlight", syntax: "==highlighted==" },
  { label: "Link", syntax: "[title](https://url)" },
  { label: "Image", syntax: "![alt](image.png)" },
  { label: "Inline code", syntax: "`code`" },
  { label: "Code block", syntax: "```js … ```" },
  { label: "Quote", syntax: "> blockquote" },
  { label: "Bullet list", syntax: "- item" },
  { label: "Numbered list", syntax: "1. item" },
  { label: "Task list", syntax: "- [ ] todo  ·  - [x] done" },
  { label: "Table", syntax: "| a | b |\\n| - | - |" },
  { label: "Divider", syntax: "---" },
  { label: "Emoji", syntax: ":rocket: :fire: :tada:" },
];
