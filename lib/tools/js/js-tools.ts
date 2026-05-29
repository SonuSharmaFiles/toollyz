// JavaScript engine for the Toollyz JavaScript Minifier. A hand-written,
// dependency-free tokenizer (full ES6+/ESNext: templates, regex, optional
// chaining, BigInt, private fields, numeric separators) powering safe
// token-join minification, beautify, structural validation, bundle analysis,
// compression analytics, a syntax highlighter and a line diff. Everything runs
// in the browser, so code is never uploaded. Minification is "safe": it never
// renames identifiers, so it can't change how your program behaves.

// ─── Types ───────────────────────────────────────────────────────────────────

export type TokType =
  | "ident" | "keyword" | "num" | "string" | "template" | "regex"
  | "punct" | "lineComment" | "blockComment";

export interface JsToken {
  type: TokType;
  value: string;
  pos: number;
  /** true if at least one line break separated this token from the previous one */
  nlBefore: boolean;
}

export type IssueSeverity = "error" | "warning" | "info";
export interface JsIssue {
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
  removeConsole: boolean;
  removeDebugger: boolean;
  optimizeBooleans: boolean;
}

export interface JsStats {
  functions: number;
  declarations: number;
  comments: number;
  strings: number;
  maxDepth: number;
  tokens: number;
  lines: number;
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
  parseTimeMs: number; // rough estimate of saved parse time
  loadTimeSavedMs: number; // on a slow ~3G connection
  score: number;
}

// ─── Keyword tables ──────────────────────────────────────────────────────────

const KEYWORDS = new Set([
  "abstract", "arguments", "await", "boolean", "break", "byte", "case", "catch",
  "char", "class", "const", "continue", "debugger", "default", "delete", "do",
  "double", "else", "enum", "eval", "export", "extends", "false", "final",
  "finally", "float", "for", "function", "goto", "if", "implements", "import",
  "in", "instanceof", "int", "interface", "let", "long", "native", "new", "null",
  "of", "package", "private", "protected", "public", "return", "short", "static",
  "super", "switch", "synchronized", "this", "throw", "throws", "transient",
  "true", "try", "typeof", "undefined", "var", "void", "volatile", "while",
  "with", "yield", "as", "from", "get", "set", "async", "NaN", "Infinity",
]);
// keywords after which a `/` begins a regex (not division)
const REGEX_KEYWORDS = new Set([
  "return", "typeof", "instanceof", "in", "of", "do", "else", "case", "void",
  "delete", "throw", "new", "yield", "await",
]);
const LITERAL_KEYWORDS = new Set(["true", "false", "null", "undefined", "NaN", "Infinity", "this", "super"]);

// punctuators, longest first so the tokenizer matches greedily
const PUNCTUATORS = [
  ">>>=", "...", "===", "!==", ">>>", "**=", "<<=", ">>=", "&&=", "||=", "??=",
  "=>", "==", "!=", "<=", ">=", "&&", "||", "??", "?.", "++", "--", "+=", "-=",
  "*=", "/=", "%=", "&=", "|=", "^=", "**", "<<", ">>",
  "{", "}", "(", ")", "[", "]", ".", ";", ",", "<", ">", "+", "-", "*", "/", "%",
  "&", "|", "^", "!", "~", "?", ":", "=",
];

// punctuators after which a newline can be safely dropped (expression continues
// or a statement boundary already exists) — excludes ) ] } ++ --
const SAFE_JOIN_PUNCT = new Set([
  ";", ",", "(", "[", "{", ".", ":", "?", "=>", "=", "+", "-", "*", "/", "%",
  "**", "==", "===", "!=", "!==", "<", ">", "<=", ">=", "&&", "||", "??", "&",
  "|", "^", "<<", ">>", ">>>", "!", "~", "?.", "+=", "-=", "*=", "/=", "%=",
  "**=", "<<=", ">>=", ">>>=", "&=", "|=", "^=", "&&=", "||=", "??=",
]);

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
const isDigit = (c: string) => c >= "0" && c <= "9";
const isIdentStart = (c: string) => /[A-Za-z_$À-￿]/.test(c);
const isIdentChar = (c: string) => /[A-Za-z0-9_$À-￿]/.test(c);

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

// ─── Tokenizer ─────────────────────────────────────────────────────────────--

export function tokenizeJs(src: string): JsToken[] {
  const tokens: JsToken[] = [];
  let i = 0;
  const n = src.length;
  let nlBefore = false;
  let prevSignificant: JsToken | null = null;

  const regexAllowed = (): boolean => {
    const p = prevSignificant;
    if (!p) return true;
    if (p.type === "keyword") return REGEX_KEYWORDS.has(p.value);
    if (p.type === "ident" || p.type === "num" || p.type === "string" || p.type === "template" || p.type === "regex") return false;
    if (p.type === "punct") return p.value !== ")" && p.value !== "]" && p.value !== "}";
    return true;
  };

  const readString = (quote: string) => {
    i++; // opening quote
    while (i < n) {
      const c = src[i];
      if (c === "\\") { i += 2; continue; }
      if (c === quote) { i++; break; }
      i++;
    }
  };
  const readTemplate = () => {
    i++; // opening backtick
    while (i < n) {
      const c = src[i];
      if (c === "\\") { i += 2; continue; }
      if (c === "`") { i++; return; }
      if (c === "$" && src[i + 1] === "{") { i += 2; readTemplateExpr(); continue; }
      i++;
    }
  };
  const readTemplateExpr = () => {
    let depth = 1;
    while (i < n && depth > 0) {
      const c = src[i];
      if (c === "\\") { i += 2; continue; }
      if (c === "`") { readTemplate(); continue; }
      if (c === '"' || c === "'") { readString(c); continue; }
      if (c === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i++; continue; }
      if (c === "/" && src[i + 1] === "*") { i += 2; while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; continue; }
      if (c === "{") { depth++; i++; continue; }
      if (c === "}") { depth--; i++; continue; }
      i++;
    }
  };

  while (i < n) {
    const c = src[i];
    if (c === " " || c === "\t" || c === "\r" || c === "\n" || c === "\f" || c === "\v" || c === " ") {
      if (c === "\n") nlBefore = true;
      i++;
      continue;
    }
    const start = i;
    let type: TokType;

    if (c === "/" && src[i + 1] === "/") {
      i += 2;
      while (i < n && src[i] !== "\n") i++;
      type = "lineComment";
    } else if (c === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < n && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i = Math.min(n, i + 2);
      type = "blockComment";
    } else if (c === '"' || c === "'") {
      readString(c);
      type = "string";
    } else if (c === "`") {
      readTemplate();
      type = "template";
    } else if (c === "/" && regexAllowed()) {
      i++;
      let inClass = false;
      while (i < n) {
        const d = src[i];
        if (d === "\\") { i += 2; continue; }
        if (d === "[") inClass = true;
        else if (d === "]") inClass = false;
        else if (d === "/" && !inClass) { i++; break; }
        else if (d === "\n") break;
        i++;
      }
      while (i < n && /[a-z]/i.test(src[i])) i++; // flags
      type = "regex";
    } else if (isDigit(c) || (c === "." && isDigit(src[i + 1] ?? ""))) {
      if (c === "0" && (src[i + 1] === "x" || src[i + 1] === "X" || src[i + 1] === "o" || src[i + 1] === "O" || src[i + 1] === "b" || src[i + 1] === "B")) {
        i += 2;
        while (i < n && /[0-9a-fA-F_]/.test(src[i])) i++;
      } else {
        while (i < n && /[0-9_]/.test(src[i])) i++;
        if (src[i] === ".") { i++; while (i < n && /[0-9_]/.test(src[i])) i++; }
        if (src[i] === "e" || src[i] === "E") { i++; if (src[i] === "+" || src[i] === "-") i++; while (i < n && /[0-9_]/.test(src[i])) i++; }
      }
      if (src[i] === "n") i++; // BigInt
      type = "num";
    } else if (isIdentStart(c) || (c === "#" && isIdentStart(src[i + 1] ?? ""))) {
      if (c === "#") i++;
      while (i < n && isIdentChar(src[i])) i++;
      const word = src.slice(start, i);
      type = c !== "#" && KEYWORDS.has(word) ? "keyword" : "ident";
    } else {
      const four = src.slice(i, i + 4);
      const match = PUNCTUATORS.find((p) => p.length <= four.length && four.startsWith(p)) ?? c;
      i += match.length;
      type = "punct";
    }

    const tok: JsToken = { type, value: src.slice(start, i), pos: start, nlBefore };
    tokens.push(tok);
    nlBefore = false;
    if (type !== "lineComment" && type !== "blockComment") prevSignificant = tok;
  }
  return tokens;
}

// ─── Minifier ──────────────────────────────────────────────────────────────--

function isLicenseComment(value: string): boolean {
  return /^\/\*!/.test(value) || /@(license|preserve|cc_on)/i.test(value) || /^\/\/!/.test(value);
}

const WORD = /[A-Za-z0-9_$]/;

function needsSpace(a: JsToken, b: JsToken): boolean {
  const x = a.value[a.value.length - 1] ?? "";
  const y = b.value[0] ?? "";
  if (WORD.test(x) && WORD.test(y)) return true;
  if (a.type === "num" && y === ".") return true;
  const pair = x + y;
  const merges = ["++", "--", "//", "/*", "**", "<<", ">>", "&&", "||", "==", "!=", "<=", ">=", "+=", "-=", "=>", "??", "?.", "|=", "&=", "^=", "%=", "*=", "/=", "<!"];
  return merges.includes(pair);
}
function canJoinAfter(a: JsToken): boolean {
  return a.type === "punct" && SAFE_JOIN_PUNCT.has(a.value);
}

/** Drop console.* expression statements and debugger statements at the token level. */
function applyStatementRemovals(toks: JsToken[], opt: MinifyOptions): JsToken[] {
  if (!opt.removeConsole && !opt.removeDebugger) return toks;
  const out: JsToken[] = [];
  const significant = (k: number) => { for (let j = k; j >= 0; j--) { if (toks[j].type !== "lineComment" && toks[j].type !== "blockComment") return toks[j]; } return null; };
  let i = 0;
  while (i < toks.length) {
    const t = toks[i];
    if (opt.removeDebugger && t.type === "keyword" && t.value === "debugger") {
      i++;
      if (toks[i] && toks[i].type === "punct" && toks[i].value === ";") i++;
      continue;
    }
    if (opt.removeConsole && t.type === "ident" && t.value === "console") {
      const prev = significant(out.length - 1) ?? (out.length ? out[out.length - 1] : null);
      const prevOut = out.length ? out[out.length - 1] : null;
      const atStatementStart = !prevOut || (prevOut.type === "punct" && (prevOut.value === ";" || prevOut.value === "{" || prevOut.value === "}"));
      void prev;
      if (atStatementStart && toks[i + 1]?.type === "punct" && toks[i + 1].value === ".") {
        // scan: console . ident (. ident)* ( ... ) ;?
        let j = i + 1;
        while (toks[j]?.type === "punct" && toks[j].value === "." && (toks[j + 1]?.type === "ident" || toks[j + 1]?.type === "keyword")) j += 2;
        if (toks[j]?.type === "punct" && toks[j].value === "(") {
          let depth = 0;
          let k = j;
          for (; k < toks.length; k++) {
            if (toks[k].type === "punct" && toks[k].value === "(") depth++;
            else if (toks[k].type === "punct" && toks[k].value === ")") { depth--; if (depth === 0) { k++; break; } }
          }
          if (toks[k]?.type === "punct" && toks[k].value === ";") k++;
          i = k;
          continue;
        }
      }
    }
    out.push(t);
    i++;
  }
  return out;
}

export function minifyJs(src: string, opt: MinifyOptions): string {
  let toks = tokenizeJs(src);
  toks = applyStatementRemovals(toks, opt);

  // comment filtering + boolean optimization
  const processed: JsToken[] = [];
  for (let idx = 0; idx < toks.length; idx++) {
    let t = toks[idx];
    if (t.type === "lineComment" || t.type === "blockComment") {
      if (opt.removeComments && !(opt.preserveLicense && isLicenseComment(t.value))) continue;
      processed.push(t);
      continue;
    }
    if (opt.optimizeBooleans && t.type === "keyword" && (t.value === "true" || t.value === "false")) {
      const prev = processed.length ? processed[processed.length - 1] : null;
      const next = toks[idx + 1] ?? null;
      const afterDot = prev && prev.type === "punct" && prev.value === ".";
      const beforeColon = next && next.type === "punct" && next.value === ":";
      if (!afterDot && !beforeColon) {
        t = { ...t, value: t.value === "true" ? "!0" : "!1", type: "num" };
      }
    }
    processed.push(t);
  }

  // serialize
  let res = "";
  let prev: JsToken | null = null;
  const lastChar = () => res[res.length - 1] ?? "";
  for (const t of processed) {
    if (t.type === "lineComment" || t.type === "blockComment") {
      if (res && lastChar() !== "\n") res += t.nlBefore ? "\n" : " ";
      res += t.value;
      if (t.type === "lineComment") res += "\n";
      prev = null;
      continue;
    }
    if (prev) {
      if (t.nlBefore && !canJoinAfter(prev)) res += "\n";
      else if (needsSpace(prev, t)) res += " ";
    } else if (res && lastChar() !== "\n" && WORD.test(lastChar()) && WORD.test(t.value[0] ?? "")) {
      res += " ";
    }
    res += t.value;
    prev = t;
  }
  return res.replace(/\n{2,}/g, "\n").trim();
}

// ─── Beautifier ──────────────────────────────────────────────────────────────

const KW_BEFORE_PAREN = new Set(["if", "for", "while", "switch", "catch", "return", "do", "else", "in", "of", "new", "typeof", "instanceof", "void", "delete", "await", "yield", "case", "throw"]);
const PREFIX_CONTEXT_PUNCT = new Set(["(", "[", "{", ",", ";", "=>", "=", "+", "-", "*", "/", "%", "**", "==", "===", "!=", "!==", "<", ">", "<=", ">=", "&&", "||", "??", "&", "|", "^", "<<", ">>", "!", "~", "?", ":", "return"]);

export function beautifyJs(src: string, indent: Indent): string {
  const toks = tokenizeJs(src);
  const unit = indent === "tab" ? "\t" : " ".repeat(indent);
  let res = "";
  let depth = 0;
  let parenDepth = 0;

  const trimRight = () => { res = res.replace(/[ \t]+$/, ""); };
  const newline = () => { trimRight(); res += "\n" + unit.repeat(Math.max(0, depth)); };
  const atLineStart = () => res === "" || /\n[ \t]*$/.test(res);

  for (let idx = 0; idx < toks.length; idx++) {
    const t = toks[idx];
    const prev = toks[idx - 1];
    const next = toks[idx + 1];

    if (t.type === "blockComment") { if (!atLineStart()) res += " "; res += t.value; newline(); continue; }
    if (t.type === "lineComment") { if (!atLineStart()) res += " "; res += t.value; newline(); continue; }

    if (t.type === "punct") {
      switch (t.value) {
        case "{": {
          // object literal vs block — keep simple: open brace on same line, indent body
          if (!atLineStart() && !/[ ([{]$/.test(res)) res += " ";
          res += "{";
          depth++;
          newline();
          continue;
        }
        case "}": {
          depth = Math.max(0, depth - 1);
          newline();
          res += "}";
          const followsBlock = next && !(next.type === "punct" && [";", ",", ")", "]", "."].includes(next.value)) && !(next.type === "keyword" && ["else", "catch", "finally", "while", "instanceof", "in"].includes(next.value));
          if (followsBlock) newline();
          continue;
        }
        case ";": {
          trimRight();
          res += ";";
          if (parenDepth === 0) newline(); else res += " ";
          continue;
        }
        case ",": {
          trimRight();
          res += ",";
          if (parenDepth === 0 && depth > 0 && next && next.type === "punct" && next.value === "}") { /* trailing */ }
          res += " ";
          continue;
        }
        case "(": { parenDepth++; if (prev && prev.type === "keyword" && KW_BEFORE_PAREN.has(prev.value)) res += " "; res += "("; continue; }
        case ")": { parenDepth = Math.max(0, parenDepth - 1); trimRight(); res += ")"; continue; }
        case "[": { res += "["; continue; }
        case "]": { trimRight(); res += "]"; continue; }
        case ".": case "?.": { trimRight(); res += t.value; continue; }
        case "!": case "~": { res += t.value; continue; }
        case ":": { trimRight(); res += ": "; continue; }
        case "=>": { res += " => "; continue; }
        default: {
          // binary / assignment operators: pad with spaces (unary + / - heuristic)
          const unary = (t.value === "+" || t.value === "-" || t.value === "++" || t.value === "--") && (!prev || (prev.type === "punct" && PREFIX_CONTEXT_PUNCT.has(prev.value)) || (prev.type === "keyword" && prev.value !== "this" && prev.value !== "super"));
          if (unary) { res += t.value; }
          else { if (!/ $/.test(res) && !atLineStart()) res += " "; res += t.value + " "; }
          continue;
        }
      }
    }

    // ident / keyword / num / string / template / regex
    if (!atLineStart()) {
      const lc = res[res.length - 1] ?? "";
      if (WORD.test(lc) || lc === ")" || lc === "]" || lc === '"' || lc === "'" || lc === "`") {
        // need a space between a value/keyword and this token unless punctuation handled it
        if (WORD.test(lc) || ((t.type === "keyword" || t.type === "ident") && (lc === ")" || lc === "]"))) res += " ";
      }
    }
    res += t.value;
    // space after a keyword that isn't a value/call (e.g., return x, var y, else {)
    if (t.type === "keyword" && !LITERAL_KEYWORDS.has(t.value) && next && !(next.type === "punct" && [";", ",", ")", "(", ".", ":", "]"].includes(next.value))) {
      if (!/ $/.test(res)) res += " ";
    }
  }
  return res.replace(/[ \t]+$/gm, "").replace(/\n{2,}/g, "\n").trim();
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateJs(src: string): JsIssue[] {
  const issues: JsIssue[] = [];
  const push = (severity: IssueSeverity, pos: number, message: string, hint?: string) => {
    if (issues.length >= 50) return;
    const { line, column } = lineCol(src, pos);
    issues.push({ severity, message, line, column, pos, hint });
  };

  const toks = tokenizeJs(src);
  // unterminated literals
  for (const t of toks) {
    if (t.type === "string") {
      const q = t.value[0];
      if (t.value.length < 2 || t.value[t.value.length - 1] !== q) push("error", t.pos, "Unterminated string literal", "Add the closing quote.");
    }
    if (t.type === "template" && (t.value.length < 2 || t.value[t.value.length - 1] !== "`")) push("error", t.pos, "Unterminated template literal", "Add the closing backtick.");
    if (t.type === "blockComment" && !t.value.endsWith("*/")) push("error", t.pos, "Unterminated block comment", "Close the comment with */.");
  }

  // bracket balance
  const stack: { ch: string; pos: number }[] = [];
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  for (const t of toks) {
    if (t.type !== "punct") continue;
    if (t.value === "(" || t.value === "[" || t.value === "{") stack.push({ ch: t.value, pos: t.pos });
    else if (t.value === ")" || t.value === "]" || t.value === "}") {
      const top = stack.pop();
      if (!top) push("error", t.pos, `Unexpected closing "${t.value}"`, "There is no matching opening bracket.");
      else if (top.ch !== pairs[t.value]) push("error", t.pos, `Mismatched bracket — expected closing for "${top.ch}"`, `A "${top.ch}" opened earlier is closed by "${t.value}".`);
    }
  }
  for (const open of stack) push("error", open.pos, `Unclosed "${open.ch}"`, `Add the matching "${open.ch === "(" ? ")" : open.ch === "[" ? "]" : "}"}".`);

  // deep syntax check via the engine (scripts only — skip ES modules to avoid false positives)
  if (issues.length === 0) {
    const hasModuleSyntax = toks.some((t, i) => t.type === "keyword" && (t.value === "import" || t.value === "export") && (i === 0 || toks[i - 1]?.value === ";" || toks[i - 1]?.value === "}" || toks[i - 1]?.nlBefore));
    if (!hasModuleSyntax && src.trim()) {
      try {
        // compiles (does NOT execute) the body to surface syntax errors
        new Function(src); // eslint-disable-line no-new-func
      } catch (e) {
        if (e instanceof SyntaxError) push("error", 0, `Syntax error: ${e.message}`, "Check the highlighted area for a typo, missing token or invalid statement.");
      }
    }
  }

  // advisory best-practice hints
  let consoleCount = 0;
  let debuggerCount = 0;
  let withCount = 0;
  for (const t of toks) {
    if (t.type === "ident" && t.value === "console") consoleCount++;
    if (t.type === "keyword" && t.value === "debugger") debuggerCount++;
    if (t.type === "keyword" && t.value === "with") withCount++;
  }
  if (debuggerCount > 0) push("warning", 0, `${debuggerCount} debugger statement${debuggerCount === 1 ? "" : "s"} found`, "Remove debugger statements before shipping — enable “Remove debugger” in Settings.");
  if (consoleCount > 0) push("info", 0, `${consoleCount} console reference${consoleCount === 1 ? "" : "s"} found`, "Console calls can be stripped from production builds via “Remove console”.");
  if (withCount > 0) push("warning", 0, "Uses the with statement", "with is deprecated, disallowed in strict mode and blocks optimization.");

  return issues;
}

// ─── Analysis ──────────────────────────────────────────────────────────────--

export function analyzeJs(src: string): JsStats {
  const toks = tokenizeJs(src);
  const s: JsStats = { functions: 0, declarations: 0, comments: 0, strings: 0, maxDepth: 0, tokens: 0, lines: src ? src.split("\n").length : 0 };
  let depth = 0;
  for (const t of toks) {
    if (t.type === "lineComment" || t.type === "blockComment") { s.comments++; continue; }
    s.tokens++;
    if (t.type === "string" || t.type === "template") s.strings++;
    if (t.type === "keyword" && t.value === "function") s.functions++;
    if (t.type === "punct" && t.value === "=>") s.functions++;
    if (t.type === "keyword" && (t.value === "var" || t.value === "let" || t.value === "const")) s.declarations++;
    if (t.type === "punct" && t.value === "{") { depth++; if (depth > s.maxDepth) s.maxDepth = depth; }
    if (t.type === "punct" && t.value === "}") depth = Math.max(0, depth - 1);
  }
  return s;
}

export function computeAnalytics(original: string, minified: string, issues: JsIssue[]): Analytics {
  const originalBytes = byteSize(original);
  const minifiedBytes = byteSize(minified);
  const savedBytes = Math.max(0, originalBytes - minifiedBytes);
  const savedPercent = originalBytes > 0 ? (savedBytes / originalBytes) * 100 : 0;
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const infos = issues.filter((i) => i.severity === "info").length;
  const score = Math.max(0, Math.min(100, 100 - errors * 15 - warnings * 5 - infos * 1));
  // friendly estimate: low-end mobile parses/compiles JS at roughly ~1 KB/ms
  const parseTimeMs = Math.round((savedBytes / 1024) * 10) / 10;
  const loadTimeSavedMs = Math.round((savedBytes / (50 * 1024)) * 1000);
  return {
    originalBytes, minifiedBytes, savedBytes, savedPercent,
    originalChars: original.length,
    minifiedChars: minified.length,
    originalLines: original ? original.split("\n").length : 0,
    minifiedLines: minified ? minified.split("\n").length : 0,
    ratio: originalBytes > 0 ? minifiedBytes / originalBytes : 1,
    parseTimeMs,
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

export function highlightJs(src: string): string {
  const toks = tokenizeJs(src);
  let out = "";
  let last = 0;
  for (let idx = 0; idx < toks.length; idx++) {
    const t = toks[idx];
    out += escapeHtml(src.slice(last, t.pos)); // whitespace between tokens
    last = t.pos + t.value.length;
    const esc = escapeHtml(t.value);
    switch (t.type) {
      case "lineComment":
      case "blockComment": out += `<span class="j-com">${esc}</span>`; break;
      case "string": out += `<span class="j-str">${esc}</span>`; break;
      case "template": out += `<span class="j-tmpl">${esc}</span>`; break;
      case "regex": out += `<span class="j-regex">${esc}</span>`; break;
      case "num": out += `<span class="j-num">${esc}</span>`; break;
      case "keyword": out += `<span class="${LITERAL_KEYWORDS.has(t.value) ? "j-lit" : "j-kw"}">${esc}</span>`; break;
      case "ident": {
        const next = toks[idx + 1];
        const prev = toks[idx - 1];
        if (next && next.type === "punct" && next.value === "(") out += `<span class="j-fn">${esc}</span>`;
        else if (prev && prev.type === "punct" && (prev.value === "." || prev.value === "?.")) out += `<span class="j-prop">${esc}</span>`;
        else out += esc;
        break;
      }
      default: out += `<span class="j-punc">${esc}</span>`;
    }
  }
  out += escapeHtml(src.slice(last));
  return out;
}

// ─── Presets, option metadata & defaults ─────────────────────────────────────

export const DEFAULT_OPTIONS: MinifyOptions = {
  removeComments: true,
  preserveLicense: true,
  removeConsole: false,
  removeDebugger: false,
  optimizeBooleans: false,
};

export interface Preset { id: string; name: string; description: string; options: MinifyOptions }

export const PRESETS: Preset[] = [
  {
    id: "safe",
    name: "Safe",
    description: "Strips comments and whitespace only. Never changes behavior. Recommended default.",
    options: { removeComments: true, preserveLicense: true, removeConsole: false, removeDebugger: false, optimizeBooleans: false },
  },
  {
    id: "aggressive",
    name: "Aggressive",
    description: "Maximum size: also removes console & debugger statements and optimizes booleans.",
    options: { removeComments: true, preserveLicense: false, removeConsole: true, removeDebugger: true, optimizeBooleans: true },
  },
  {
    id: "production",
    name: "Production",
    description: "Ship-ready: drops console & debugger but keeps /*! license */ banners.",
    options: { removeComments: true, preserveLicense: true, removeConsole: true, removeDebugger: true, optimizeBooleans: false },
  },
  {
    id: "debug",
    name: "Debug-friendly",
    description: "Compresses whitespace but keeps comments, console logs and booleans intact.",
    options: { removeComments: false, preserveLicense: true, removeConsole: false, removeDebugger: false, optimizeBooleans: false },
  },
];

export interface OptionMeta { key: keyof MinifyOptions; label: string; description: string; aggressive?: boolean }
export interface OptionGroup { title: string; options: OptionMeta[] }

export const OPTION_GROUPS: OptionGroup[] = [
  {
    title: "Comments",
    options: [
      { key: "removeComments", label: "Remove comments", description: "Strip // line and /* block */ comments." },
      { key: "preserveLicense", label: "Preserve license comments", description: "Keep /*! … */, @license and @preserve banners." },
    ],
  },
  {
    title: "Statements",
    options: [
      { key: "removeConsole", label: "Remove console statements", description: "Delete standalone console.log/info/… calls.", aggressive: true },
      { key: "removeDebugger", label: "Remove debugger statements", description: "Delete debugger; statements.", aggressive: true },
    ],
  },
  {
    title: "Expressions",
    options: [
      { key: "optimizeBooleans", label: "Optimize booleans", description: "Rewrite true → !0 and false → !1 to save bytes.", aggressive: true },
    ],
  },
];

// ─── Sample ──────────────────────────────────────────────────────────────────

export const SAMPLE_JS = `/*!
 * Toollyz demo bundle (c) 2026
 */

// Debounce helper used across the app
function debounce(fn, wait = 200) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

class Counter {
  constructor(start = 0) {
    this.value = start;
  }

  increment(by = 1) {
    this.value += by;
    console.log("counter is now", this.value);
    return this.value;
  }
}

const counter = new Counter(10);
const onScroll = debounce(() => {
  const ratio = window.scrollY / document.body.scrollHeight;
  if (ratio > 0.5 && counter.value < 100) {
    counter.increment(5);
  }
}, 150);

window.addEventListener("scroll", onScroll);
export { debounce, Counter };
`;
