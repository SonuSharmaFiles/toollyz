// Code Screenshot Generator engine. Provides theme definitions, a tiny
// regex-driven syntax highlighter (no Prism / Shiki — keeps bundle lean),
// and helpers to render code to a canvas as a downloadable PNG.
//
// Languages supported in the highlighter: JavaScript / TypeScript,
// Python, JSON, HTML, CSS, Bash, SQL, plain. Each pass returns spans
// `{ text, color }` that the canvas drawer fills directly.

export type Lang = "javascript" | "typescript" | "python" | "json" | "html" | "css" | "bash" | "sql" | "plain";

export interface ThemeMeta {
  id: string;
  label: string;
  /** Background gradient (CSS string for the on-page preview). */
  gradient: string;
  /** Window background (the code area). */
  window: string;
  /** Default text colour. */
  fg: string;
  /** Token colours. */
  comment: string;
  keyword: string;
  string: string;
  number: string;
  function: string;
  type: string;
  punctuation: string;
  /** Window chrome buttons (close/min/max). */
  dot1: string;
  dot2: string;
  dot3: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: "midnight",
    label: "Midnight",
    gradient: "linear-gradient(135deg,#0f172a,#1e3a8a)",
    window: "#0b1020",
    fg: "#e2e8f0",
    comment: "#64748b",
    keyword: "#c084fc",
    string: "#86efac",
    number: "#fcd34d",
    function: "#7dd3fc",
    type: "#f472b6",
    punctuation: "#cbd5e1",
    dot1: "#ef4444",
    dot2: "#eab308",
    dot3: "#22c55e",
  },
  {
    id: "sunset",
    label: "Sunset",
    gradient: "linear-gradient(135deg,#fb923c,#db2777)",
    window: "#1f1d2b",
    fg: "#fde68a",
    comment: "#9ca3af",
    keyword: "#fb7185",
    string: "#fcd34d",
    number: "#fdba74",
    function: "#a78bfa",
    type: "#f472b6",
    punctuation: "#fef3c7",
    dot1: "#ef4444",
    dot2: "#eab308",
    dot3: "#22c55e",
  },
  {
    id: "ocean",
    label: "Ocean",
    gradient: "linear-gradient(135deg,#0c4a6e,#06b6d4)",
    window: "#082f49",
    fg: "#e0f2fe",
    comment: "#475569",
    keyword: "#67e8f9",
    string: "#a7f3d0",
    number: "#fde68a",
    function: "#93c5fd",
    type: "#f0abfc",
    punctuation: "#cbd5e1",
    dot1: "#ef4444",
    dot2: "#eab308",
    dot3: "#22c55e",
  },
  {
    id: "forest",
    label: "Forest",
    gradient: "linear-gradient(135deg,#064e3b,#22c55e)",
    window: "#022c22",
    fg: "#d1fae5",
    comment: "#4b5563",
    keyword: "#86efac",
    string: "#fcd34d",
    number: "#fde68a",
    function: "#7dd3fc",
    type: "#a78bfa",
    punctuation: "#d1fae5",
    dot1: "#ef4444",
    dot2: "#eab308",
    dot3: "#22c55e",
  },
  {
    id: "blush",
    label: "Blush",
    gradient: "linear-gradient(135deg,#fda4af,#a78bfa)",
    window: "#1e1b2c",
    fg: "#fce7f3",
    comment: "#a1a1aa",
    keyword: "#f9a8d4",
    string: "#bef264",
    number: "#fdba74",
    function: "#a5b4fc",
    type: "#f0abfc",
    punctuation: "#fbcfe8",
    dot1: "#ef4444",
    dot2: "#eab308",
    dot3: "#22c55e",
  },
  {
    id: "graphite",
    label: "Graphite",
    gradient: "linear-gradient(135deg,#52525b,#18181b)",
    window: "#09090b",
    fg: "#e4e4e7",
    comment: "#6b7280",
    keyword: "#fb7185",
    string: "#bef264",
    number: "#fcd34d",
    function: "#7dd3fc",
    type: "#c4b5fd",
    punctuation: "#a1a1aa",
    dot1: "#ef4444",
    dot2: "#eab308",
    dot3: "#22c55e",
  },
];

// JS/TS keywords — covers most common code snippets.
const JS_KEYWORDS = new Set([
  "abstract", "as", "async", "await", "break", "case", "catch", "class", "const", "continue",
  "debugger", "default", "delete", "do", "else", "enum", "export", "extends", "false",
  "finally", "for", "from", "function", "if", "implements", "import", "in", "instanceof",
  "interface", "is", "let", "module", "namespace", "new", "null", "of", "package", "private",
  "protected", "public", "readonly", "require", "return", "static", "super", "switch",
  "this", "throw", "true", "try", "type", "typeof", "undefined", "var", "void", "while",
  "with", "yield",
]);
const PY_KEYWORDS = new Set([
  "and", "as", "assert", "async", "await", "break", "class", "continue", "def", "del",
  "elif", "else", "except", "False", "finally", "for", "from", "global", "if", "import",
  "in", "is", "lambda", "None", "nonlocal", "not", "or", "pass", "raise", "return", "True",
  "try", "while", "with", "yield",
]);
const SQL_KEYWORDS = new Set([
  "select", "from", "where", "and", "or", "not", "in", "like", "between", "as", "join",
  "left", "right", "inner", "outer", "on", "group", "by", "order", "having", "limit",
  "offset", "insert", "into", "values", "update", "set", "delete", "create", "table",
  "drop", "alter", "add", "primary", "key", "foreign", "references", "default", "null",
  "is", "with", "case", "when", "then", "else", "end", "asc", "desc", "distinct", "union",
  "all",
]);
const BASH_KEYWORDS = new Set([
  "if", "then", "else", "elif", "fi", "for", "while", "do", "done", "case", "esac", "in",
  "function", "return", "exit", "echo", "export", "source", "alias", "unset", "let",
  "local", "readonly", "declare",
]);

export interface Token {
  text: string;
  color: keyof Omit<ThemeMeta, "id" | "label" | "gradient" | "window" | "dot1" | "dot2" | "dot3">;
}

function tokenizeJs(line: string, ts = false): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < line.length) {
    const rest = line.slice(i);

    // Line comment.
    if (rest.startsWith("//")) {
      out.push({ text: rest, color: "comment" });
      return out;
    }
    // Block comment.
    if (rest.startsWith("/*")) {
      const end = rest.indexOf("*/");
      const stop = end === -1 ? rest.length : end + 2;
      out.push({ text: rest.slice(0, stop), color: "comment" });
      i += stop;
      continue;
    }
    // Strings (single/double/back).
    if (rest[0] === "'" || rest[0] === '"' || rest[0] === "`") {
      const q = rest[0];
      let j = 1;
      while (j < rest.length && rest[j] !== q) {
        if (rest[j] === "\\") j++;
        j++;
      }
      out.push({ text: rest.slice(0, j + 1), color: "string" });
      i += j + 1;
      continue;
    }
    // Numbers.
    const numM = /^-?(\d+\.\d+|\d+)([eE][+-]?\d+)?/.exec(rest);
    if (numM) {
      out.push({ text: numM[0], color: "number" });
      i += numM[0].length;
      continue;
    }
    // Identifier / keyword / type / call.
    const idM = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(rest);
    if (idM) {
      const w = idM[0];
      if (JS_KEYWORDS.has(w)) {
        out.push({ text: w, color: "keyword" });
      } else if (ts && /^[A-Z]/.test(w)) {
        out.push({ text: w, color: "type" });
      } else if (rest[w.length] === "(") {
        out.push({ text: w, color: "function" });
      } else {
        out.push({ text: w, color: "fg" });
      }
      i += w.length;
      continue;
    }
    // Punctuation / whitespace.
    out.push({ text: rest[0], color: /\s/.test(rest[0]) ? "fg" : "punctuation" });
    i++;
  }
  return out;
}

function tokenizePython(line: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < line.length) {
    const rest = line.slice(i);
    if (rest.startsWith("#")) {
      out.push({ text: rest, color: "comment" });
      return out;
    }
    if (rest[0] === "'" || rest[0] === '"') {
      const q = rest[0];
      let j = 1;
      while (j < rest.length && rest[j] !== q) {
        if (rest[j] === "\\") j++;
        j++;
      }
      out.push({ text: rest.slice(0, j + 1), color: "string" });
      i += j + 1;
      continue;
    }
    const numM = /^-?(\d+\.\d+|\d+)/.exec(rest);
    if (numM) {
      out.push({ text: numM[0], color: "number" });
      i += numM[0].length;
      continue;
    }
    const idM = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
    if (idM) {
      const w = idM[0];
      if (PY_KEYWORDS.has(w)) out.push({ text: w, color: "keyword" });
      else if (rest[w.length] === "(") out.push({ text: w, color: "function" });
      else out.push({ text: w, color: "fg" });
      i += w.length;
      continue;
    }
    out.push({ text: rest[0], color: /\s/.test(rest[0]) ? "fg" : "punctuation" });
    i++;
  }
  return out;
}

function tokenizeJson(line: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < line.length) {
    const rest = line.slice(i);
    if (rest[0] === '"') {
      let j = 1;
      while (j < rest.length && rest[j] !== '"') {
        if (rest[j] === "\\") j++;
        j++;
      }
      const str = rest.slice(0, j + 1);
      // Key vs value: a key is followed by a colon.
      const next = rest.slice(j + 1).replace(/^\s+/, "");
      out.push({ text: str, color: next[0] === ":" ? "type" : "string" });
      i += j + 1;
      continue;
    }
    const numM = /^-?(\d+\.\d+|\d+)([eE][+-]?\d+)?/.exec(rest);
    if (numM) {
      out.push({ text: numM[0], color: "number" });
      i += numM[0].length;
      continue;
    }
    const litM = /^(true|false|null)\b/.exec(rest);
    if (litM) {
      out.push({ text: litM[0], color: "keyword" });
      i += litM[0].length;
      continue;
    }
    out.push({ text: rest[0], color: /\s/.test(rest[0]) ? "fg" : "punctuation" });
    i++;
  }
  return out;
}

function tokenizeHtml(line: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < line.length) {
    const rest = line.slice(i);
    if (rest.startsWith("<!--")) {
      const end = rest.indexOf("-->");
      const stop = end === -1 ? rest.length : end + 3;
      out.push({ text: rest.slice(0, stop), color: "comment" });
      i += stop;
      continue;
    }
    const tagM = /^<\/?[A-Za-z][A-Za-z0-9-]*/.exec(rest);
    if (tagM) {
      out.push({ text: tagM[0], color: "keyword" });
      i += tagM[0].length;
      continue;
    }
    const attrM = /^[A-Za-z-]+(?==)/.exec(rest);
    if (attrM) {
      out.push({ text: attrM[0], color: "function" });
      i += attrM[0].length;
      continue;
    }
    if (rest[0] === '"' || rest[0] === "'") {
      const q = rest[0];
      let j = 1;
      while (j < rest.length && rest[j] !== q) j++;
      out.push({ text: rest.slice(0, j + 1), color: "string" });
      i += j + 1;
      continue;
    }
    out.push({ text: rest[0], color: /\s/.test(rest[0]) ? "fg" : "punctuation" });
    i++;
  }
  return out;
}

function tokenizeCss(line: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < line.length) {
    const rest = line.slice(i);
    if (rest.startsWith("/*")) {
      const end = rest.indexOf("*/");
      const stop = end === -1 ? rest.length : end + 2;
      out.push({ text: rest.slice(0, stop), color: "comment" });
      i += stop;
      continue;
    }
    const propM = /^[a-z-]+(?=\s*:)/i.exec(rest);
    if (propM) {
      out.push({ text: propM[0], color: "function" });
      i += propM[0].length;
      continue;
    }
    const numM = /^-?(\d+\.\d+|\d+)([a-z%]+)?/i.exec(rest);
    if (numM) {
      out.push({ text: numM[0], color: "number" });
      i += numM[0].length;
      continue;
    }
    if (rest[0] === '"' || rest[0] === "'") {
      const q = rest[0];
      let j = 1;
      while (j < rest.length && rest[j] !== q) j++;
      out.push({ text: rest.slice(0, j + 1), color: "string" });
      i += j + 1;
      continue;
    }
    const idM = /^#?[A-Za-z_-][A-Za-z0-9_-]*/.exec(rest);
    if (idM) {
      out.push({ text: idM[0], color: rest[0] === "#" ? "type" : "fg" });
      i += idM[0].length;
      continue;
    }
    out.push({ text: rest[0], color: /\s/.test(rest[0]) ? "fg" : "punctuation" });
    i++;
  }
  return out;
}

function tokenizeBash(line: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < line.length) {
    const rest = line.slice(i);
    if (rest[0] === "#") {
      out.push({ text: rest, color: "comment" });
      return out;
    }
    if (rest[0] === "'" || rest[0] === '"') {
      const q = rest[0];
      let j = 1;
      while (j < rest.length && rest[j] !== q) j++;
      out.push({ text: rest.slice(0, j + 1), color: "string" });
      i += j + 1;
      continue;
    }
    const varM = /^\$\{?[A-Za-z_][A-Za-z0-9_]*\}?/.exec(rest);
    if (varM) {
      out.push({ text: varM[0], color: "type" });
      i += varM[0].length;
      continue;
    }
    const flagM = /^--?[A-Za-z][A-Za-z0-9-]*/.exec(rest);
    if (flagM) {
      out.push({ text: flagM[0], color: "number" });
      i += flagM[0].length;
      continue;
    }
    const idM = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
    if (idM) {
      const w = idM[0];
      if (BASH_KEYWORDS.has(w)) out.push({ text: w, color: "keyword" });
      else out.push({ text: w, color: "fg" });
      i += w.length;
      continue;
    }
    out.push({ text: rest[0], color: /\s/.test(rest[0]) ? "fg" : "punctuation" });
    i++;
  }
  return out;
}

function tokenizeSql(line: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < line.length) {
    const rest = line.slice(i);
    if (rest.startsWith("--")) {
      out.push({ text: rest, color: "comment" });
      return out;
    }
    if (rest[0] === "'" || rest[0] === '"') {
      const q = rest[0];
      let j = 1;
      while (j < rest.length && rest[j] !== q) j++;
      out.push({ text: rest.slice(0, j + 1), color: "string" });
      i += j + 1;
      continue;
    }
    const numM = /^-?(\d+\.\d+|\d+)/.exec(rest);
    if (numM) {
      out.push({ text: numM[0], color: "number" });
      i += numM[0].length;
      continue;
    }
    const idM = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest);
    if (idM) {
      const w = idM[0];
      if (SQL_KEYWORDS.has(w.toLowerCase())) out.push({ text: w, color: "keyword" });
      else out.push({ text: w, color: "fg" });
      i += w.length;
      continue;
    }
    out.push({ text: rest[0], color: /\s/.test(rest[0]) ? "fg" : "punctuation" });
    i++;
  }
  return out;
}

export function tokenize(code: string, lang: Lang): Token[][] {
  const lines = code.replace(/\r\n/g, "\n").split("\n");
  switch (lang) {
    case "javascript":
      return lines.map((l) => tokenizeJs(l, false));
    case "typescript":
      return lines.map((l) => tokenizeJs(l, true));
    case "python":
      return lines.map(tokenizePython);
    case "json":
      return lines.map(tokenizeJson);
    case "html":
      return lines.map(tokenizeHtml);
    case "css":
      return lines.map(tokenizeCss);
    case "bash":
      return lines.map(tokenizeBash);
    case "sql":
      return lines.map(tokenizeSql);
    default:
      return lines.map((l) => [{ text: l, color: "fg" } as Token]);
  }
}

export const LANGS: { id: Lang; label: string }[] = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "json", label: "JSON" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "bash", label: "Bash" },
  { id: "sql", label: "SQL" },
  { id: "plain", label: "Plain" },
];

export const SAMPLE_CODE = `function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number,
): T {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

const onSearch = debounce((q: string) => {
  console.log("searching for", q);
}, 250);`;
