// Tiny, safe Markdown → HTML renderer for the Online Notepad preview.
// No external dependencies. Input is HTML-escaped before any tags are added,
// so user text can never inject markup. Code spans/blocks are swapped for
// control-character placeholders (which never appear in typed text) so their
// contents aren't re-formatted and ordinary digits are never misread.

const FENCE = String.fromCharCode(2); // fenced code-block placeholder delimiter
const CODE = String.fromCharCode(3); // inline-code placeholder delimiter

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(text: string): string {
  const codes: string[] = [];
  let t = text.replace(/`([^`]+)`/g, (_m, c) => {
    codes.push(c);
    return `${CODE}${codes.length - 1}${CODE}`;
  });

  t = t
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, url) => {
      const safe = /^(https?:|mailto:|\/|#)/i.test(url) ? url : "#";
      return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/(^|[^A-Za-z0-9])\*(?=\S)(.+?)(?<=\S)\*(?![A-Za-z0-9])/g, "$1<em>$2</em>")
    .replace(/(^|[^A-Za-z0-9])_(?=\S)(.+?)(?<=\S)_(?![A-Za-z0-9])/g, "$1<em>$2</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/==(.+?)==/g, "<mark>$1</mark>");

  return t.replace(new RegExp(`${CODE}(\\d+)${CODE}`, "g"), (_m, i) => `<code>${codes[+i]}</code>`);
}

export function renderMarkdown(md: string): string {
  if (!md.trim()) return "";

  const fences: string[] = [];
  let src = md.replace(/```(?:\w*)\n?([\s\S]*?)```/g, (_m, code) => {
    fences.push(code.replace(/\n$/, ""));
    return `${FENCE}${fences.length - 1}${FENCE}`;
  });

  src = escapeHtml(src);
  const lines = src.split("\n");
  const fenceLine = new RegExp(`^${FENCE}(\\d+)${FENCE}\\s*$`);
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
      html.push(`<pre><code>${escapeHtml(fences[+fence[1]] ?? "")}</code></pre>`);
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
      html.push(`<h${lvl}>${inline(heading[2].trim())}</h${lvl}>`);
      i++;
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flushPara();
      html.push("<hr/>");
      i++;
      continue;
    }
    // Blockquote marker ">" has already been HTML-escaped to "&gt;" above.
    if (/^\s*&gt;\s?/.test(line)) {
      flushPara();
      const quote: string[] = [];
      while (i < lines.length && /^\s*&gt;\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*&gt;\s?/, ""));
        i++;
      }
      html.push(`<blockquote>${inline(quote.join(" ").trim())}</blockquote>`);
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
        i++;
      }
      html.push(`<ul>${items.map((it) => `<li>${inline(it.trim())}</li>`).join("")}</ul>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      flushPara();
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      html.push(`<ol>${items.map((it) => `<li>${inline(it.trim())}</li>`).join("")}</ol>`);
      continue;
    }
    para.push(line);
    i++;
  }
  flushPara();

  return html
    .join("\n")
    .replace(new RegExp(`${FENCE}(\\d+)${FENCE}`, "g"), (_m, idx) => `<code>${escapeHtml(fences[+idx] ?? "")}</code>`);
}

// Wrap rendered HTML in a standalone, self-styled document (export / print).
export function htmlDocument(title: string, bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  body{font-family:Georgia,'Times New Roman',serif;max-width:760px;margin:40px auto;padding:0 24px;color:#1a1a1a;line-height:1.7}
  h1,h2,h3,h4{font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.25;margin:1.4em 0 .5em}
  h1{font-size:2em}h2{font-size:1.5em}h3{font-size:1.25em}
  p{margin:0 0 1em}ul,ol{margin:0 0 1em 1.5em}blockquote{border-left:3px solid #c7c7c7;margin:0 0 1em;padding:.25em 1em;color:#555}
  code{background:#f1f1f3;padding:.1em .35em;border-radius:4px;font-family:ui-monospace,Menlo,monospace;font-size:.9em}
  pre{background:#0f172a;color:#e2e8f0;padding:16px;border-radius:10px;overflow:auto}
  pre code{background:none;color:inherit;padding:0}
  mark{background:#fde68a}hr{border:none;border-top:1px solid #ddd;margin:2em 0}
  a{color:#4f46e5}img{max-width:100%}
  @media print{body{margin:0;max-width:none}}
</style></head><body>${bodyHtml}</body></html>`;
}
