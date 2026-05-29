// Regex engine wrapper for the Toollyz Regex Tester. Runs user-supplied
// JavaScript regular expressions safely against test text with guardrails
// against catastrophic backtracking and infinite zero-length loops, plus a
// match highlighter, a replace preview and a library of common patterns.
// Pure and dependency-free; everything runs in the browser.

const MAX_INPUT = 100_000; // cap test-string size to bound worst-case work
const MAX_MATCHES = 10_000; // cap global match iterations

export interface RegexMatch {
  index: number;
  end: number;
  match: string;
  groups: (string | undefined)[];
  namedGroups: Record<string, string | undefined>;
}

export interface RunResult {
  ok: boolean;
  error?: string;
  matches: RegexMatch[];
  count: number;
  truncated: boolean;
  groupCount: number;
}

export interface ReplaceResult {
  ok: boolean;
  error?: string;
  result: string;
  count: number;
  truncated: boolean;
}

function buildRegex(pattern: string, flags: string): { re?: RegExp; error?: string } {
  try {
    return { re: new RegExp(pattern, flags) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid regular expression" };
  }
}

function toMatch(m: RegExpExecArray): RegexMatch {
  return {
    index: m.index,
    end: m.index + m[0].length,
    match: m[0],
    groups: m.slice(1),
    namedGroups: m.groups ? { ...m.groups } : {},
  };
}

export function runRegex(pattern: string, flags: string, input: string): RunResult {
  if (!pattern) return { ok: true, matches: [], count: 0, truncated: false, groupCount: 0 };
  const { re, error } = buildRegex(pattern, flags);
  if (!re) return { ok: false, error, matches: [], count: 0, truncated: false, groupCount: 0 };

  const truncated = input.length > MAX_INPUT;
  const text = truncated ? input.slice(0, MAX_INPUT) : input;
  const matches: RegexMatch[] = [];

  if (re.global || re.sticky) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      matches.push(toMatch(m));
      if (m.index === re.lastIndex) re.lastIndex++; // zero-length match guard
      if (matches.length >= MAX_MATCHES) break;
    }
  } else {
    const m = re.exec(text);
    if (m) matches.push(toMatch(m));
  }

  const groupCount = matches.reduce((max, m) => Math.max(max, m.groups.length), 0);
  return { ok: true, matches, count: matches.length, truncated, groupCount };
}

export function replacePreview(pattern: string, flags: string, input: string, replacement: string): ReplaceResult {
  if (!pattern) return { ok: true, result: input, count: 0, truncated: false };
  const { re, error } = buildRegex(pattern, flags);
  if (!re) return { ok: false, error, result: "", count: 0, truncated: false };
  const truncated = input.length > MAX_INPUT;
  const text = truncated ? input.slice(0, MAX_INPUT) : input;
  try {
    // count via a global clone so the number is accurate regardless of the g flag
    const counter = buildRegex(pattern, flags.includes("g") ? flags : flags + "g").re;
    let count = 0;
    if (counter) {
      counter.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = counter.exec(text)) !== null) {
        count++;
        if (m.index === counter.lastIndex) counter.lastIndex++;
        if (count >= MAX_MATCHES) break;
      }
    }
    const result = text.replace(re, replacement);
    return { ok: true, result, count, truncated };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Replacement failed", result: "", count: 0, truncated };
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Render the test text with each match wrapped in an alternating <mark>. */
export function highlightMatches(text: string, matches: RegexMatch[]): string {
  if (!matches.length) return escapeHtml(text) + "\n";
  let out = "";
  let last = 0;
  let alt = 0;
  for (const m of matches) {
    if (m.index < last) continue; // skip overlaps from the iteration cap
    out += escapeHtml(text.slice(last, m.index));
    const cls = alt % 2 === 0 ? "rx-a" : "rx-b";
    out += `<mark class="${cls}">${escapeHtml(text.slice(m.index, m.end)) || "&#8203;"}</mark>`;
    last = m.end;
    alt++;
  }
  out += escapeHtml(text.slice(last));
  return out + "\n";
}

/** Heuristic warning for patterns prone to catastrophic backtracking. */
export function lintPattern(pattern: string): string | null {
  if (!pattern) return null;
  // nested quantifiers like (a+)+ , (a*)* , (.*){2,}
  if (/\([^)]*[+*?][^)]*\)\s*[+*]/.test(pattern) || /\([^)]*[+*]\)\s*\{\d+,?\d*\}/.test(pattern)) {
    return "This pattern nests quantifiers (e.g. (a+)+), which can be slow on some inputs. Test it against large text carefully.";
  }
  return null;
}

export interface FlagInfo { key: string; label: string; description: string }
export const FLAGS: FlagInfo[] = [
  { key: "g", label: "g", description: "global — find all matches" },
  { key: "i", label: "i", description: "ignore case" },
  { key: "m", label: "m", description: "multiline — ^ and $ match line breaks" },
  { key: "s", label: "s", description: "dotAll — . matches newlines" },
  { key: "u", label: "u", description: "unicode" },
  { key: "y", label: "y", description: "sticky — match from lastIndex" },
];

export interface LibraryPattern { name: string; pattern: string; flags: string; sample: string }
export const PATTERN_LIBRARY: LibraryPattern[] = [
  { name: "Email address", pattern: "[\\w.+-]+@[\\w-]+\\.[\\w.-]+", flags: "gi", sample: "Reach us at hello@toollyz.com or support@example.org." },
  { name: "URL", pattern: "https?:\\/\\/[^\\s/$.?#].[^\\s]*", flags: "gi", sample: "Visit https://toollyz.com and http://example.com/path?q=1 today." },
  { name: "IPv4 address", pattern: "\\b(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)\\b", flags: "g", sample: "Servers: 192.168.0.1, 10.0.0.255 and 8.8.8.8." },
  { name: "Hex color", pattern: "#(?:[0-9a-fA-F]{3,4}){1,2}\\b", flags: "g", sample: "Colors: #fff, #6366F1 and #0b1020ff." },
  { name: "Date (YYYY-MM-DD)", pattern: "\\b\\d{4}-\\d{2}-\\d{2}\\b", flags: "g", sample: "Released 2026-05-29, updated 2026-06-01." },
  { name: "Phone number", pattern: "\\+?\\d[\\d\\s().-]{7,}\\d", flags: "g", sample: "Call +1 (555) 123-4567 or 020-7946-0958." },
  { name: "Slug", pattern: "[a-z0-9]+(?:-[a-z0-9]+)*", flags: "g", sample: "css-minifier, jwt-decoder and regex-tester." },
  { name: "Words", pattern: "\\b\\w+\\b", flags: "g", sample: "Count the words in this short sentence." },
];

export const SAMPLE_PATTERN = "(?<user>[\\w.+-]+)@(?<domain>[\\w.-]+)";
export const SAMPLE_FLAGS = "gi";
export const SAMPLE_TEXT =
  "Contact the team at hello@toollyz.com or Support@Example.org.\nInvalid addresses like nope@ or @nowhere are ignored.\nBilling: invoices@toollyz.io";

export const MAX_INPUT_SIZE = MAX_INPUT;
