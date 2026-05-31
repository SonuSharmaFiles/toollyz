// Regex Generator engine. Two complementary surfaces:
//
//   1. A curated library of ~30 vetted patterns (email, URL, phone, UUID,
//      IPv4, IPv6, ISO date, etc.) with explanations.
//   2. A "build from selectors" path where the user ticks character classes,
//      sets quantifiers, anchors and flags — and the tool composes the
//      regex along with an English explanation.
//
// Pure functions; never executes the regex against the user's input on
// untrusted data without a try/catch.

export interface PatternEntry {
  id: string;
  label: string;
  category: "Common" | "Web" | "Identifiers" | "Numbers" | "Dates";
  pattern: string;
  flags: string;
  description: string;
  sampleInput: string;
}

export const PATTERN_LIBRARY: PatternEntry[] = [
  {
    id: "email",
    label: "Email address",
    category: "Common",
    pattern: String.raw`[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}`,
    flags: "gi",
    description: "Practical email regex — local-part allows + and ., domain ≥ 2-letter TLD.",
    sampleInput: "Contact ada@example.com or grace+marketing@toollyz.io for questions.",
  },
  {
    id: "url",
    label: "URL (http/https)",
    category: "Web",
    pattern: String.raw`https?:\/\/[^\s<>"]+`,
    flags: "gi",
    description: "Catches http and https URLs up to the first whitespace or quote.",
    sampleInput: "Read more at https://toollyz.com/tools and http://example.org/path?q=1",
  },
  {
    id: "domain",
    label: "Domain name (no protocol)",
    category: "Web",
    pattern: String.raw`\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b`,
    flags: "gi",
    description: "Domain like example.co.uk — at least one dot, ≥ 2-letter TLD.",
    sampleInput: "toollyz.com / example.co.uk / amazon.s3.region.amazonaws.com",
  },
  {
    id: "ipv4",
    label: "IPv4 address",
    category: "Web",
    pattern: String.raw`\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b`,
    flags: "g",
    description: "Strict IPv4 with each octet 0-255.",
    sampleInput: "192.168.1.1, 8.8.8.8, 256.0.0.1 (invalid), 10.0.0.255",
  },
  {
    id: "ipv6",
    label: "IPv6 address (canonical)",
    category: "Web",
    pattern: String.raw`(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}`,
    flags: "g",
    description: "Eight-group hex IPv6 — does not handle :: compression.",
    sampleInput: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
  },
  {
    id: "uuid",
    label: "UUID (any version)",
    category: "Identifiers",
    pattern: String.raw`\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b`,
    flags: "g",
    description: "Matches RFC 4122 / 9562 UUIDs v1-v8 with the standard variant.",
    sampleInput: "f47ac10b-58cc-4372-a567-0e02b2c3d479, 018e3aa3-43b6-7c52-9ac1-92e64203abce",
  },
  {
    id: "mac",
    label: "MAC address",
    category: "Identifiers",
    pattern: String.raw`\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b`,
    flags: "g",
    description: "Six hex pairs separated by : or - (does not match the Cisco . form).",
    sampleInput: "f8:e9:4e:12:34:56 — 00-00-0C-aa-bb-cc",
  },
  {
    id: "iso-date",
    label: "ISO 8601 date (YYYY-MM-DD)",
    category: "Dates",
    pattern: String.raw`\b\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])\b`,
    flags: "g",
    description: "Strict ISO 8601 calendar date.",
    sampleInput: "Today is 2026-05-31 — submit by 2026-12-15.",
  },
  {
    id: "iso-datetime",
    label: "ISO 8601 datetime (with optional Z)",
    category: "Dates",
    pattern: String.raw`\b\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?\b`,
    flags: "g",
    description: "Full ISO 8601 datetime with optional fractional seconds and offset.",
    sampleInput: "2026-05-31T14:30:00Z, 2026-05-31T16:45:12.123+05:30",
  },
  {
    id: "us-phone",
    label: "US phone number",
    category: "Common",
    pattern: String.raw`(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}`,
    flags: "g",
    description: "Common US/Canada phone formats: 555-555-1234, (555) 555-1234, +1.555.555.1234.",
    sampleInput: "Call (415) 555-1234 or +1 415 555 1234 or 415.555.1234",
  },
  {
    id: "intl-phone",
    label: "International phone (lenient)",
    category: "Common",
    pattern: String.raw`\+\d{1,3}[\s.-]?\d{4,14}`,
    flags: "g",
    description: "Lenient + country-code phone — accepts most E.164-compatible numbers.",
    sampleInput: "+44 7700 900123, +91 9876543210, +1 4155551234",
  },
  {
    id: "hex-color",
    label: "Hex color (3 or 6 digits)",
    category: "Web",
    pattern: String.raw`#(?:[0-9a-fA-F]{3}){1,2}\b`,
    flags: "g",
    description: "CSS hex color: #fff or #ffffff (without 8-digit alpha).",
    sampleInput: "color: #fff; background: #0f766e; --accent: #abc;",
  },
  {
    id: "rgb-color",
    label: "CSS rgb()/rgba() color",
    category: "Web",
    pattern: String.raw`rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)`,
    flags: "gi",
    description: "rgb(r, g, b) or rgba(r, g, b, a).",
    sampleInput: "color: rgb(255, 0, 0); background: rgba(0,0,0,0.5);",
  },
  {
    id: "int",
    label: "Integer (with optional sign)",
    category: "Numbers",
    pattern: String.raw`-?\b\d+\b`,
    flags: "g",
    description: "Whole numbers, positive or negative.",
    sampleInput: "Score: 42, -7 below zero, room 101",
  },
  {
    id: "float",
    label: "Decimal number",
    category: "Numbers",
    pattern: String.raw`-?\b\d+\.\d+\b`,
    flags: "g",
    description: "Numbers with a decimal point.",
    sampleInput: "PI ≈ 3.14159, T = -273.15, 1.5x speed",
  },
  {
    id: "currency",
    label: "Currency amount ($, €, £, ¥)",
    category: "Numbers",
    pattern: String.raw`[$€£¥]\s?\d+(?:[.,]\d{2})?`,
    flags: "g",
    description: "Currency prefixed with symbol; optional cents.",
    sampleInput: "Total: $19.99 + €5 + £3.50 + ¥1200",
  },
  {
    id: "credit-card",
    label: "Credit card (with optional dashes/spaces)",
    category: "Identifiers",
    pattern: String.raw`\b(?:\d[ -]*?){13,19}\b`,
    flags: "g",
    description: "13-19 digit credit-card number with optional separators. (Does not validate Luhn.)",
    sampleInput: "4111 1111 1111 1111 and 5500-0000-0000-0004",
  },
  {
    id: "slug",
    label: "URL slug",
    category: "Web",
    pattern: String.raw`\b[a-z0-9]+(?:-[a-z0-9]+)*\b`,
    flags: "g",
    description: "Lower-case-hyphen URL slugs.",
    sampleInput: "my-cool-post, hello-world, 10-best-tips",
  },
  {
    id: "username",
    label: "Username (3-16 chars, alphanumeric + . _ -)",
    category: "Identifiers",
    pattern: String.raw`\b[A-Za-z0-9._-]{3,16}\b`,
    flags: "g",
    description: "Common username constraints used across social platforms.",
    sampleInput: "@ada_lovelace, grace-h, john.doe, x",
  },
  {
    id: "password-strong",
    label: "Strong password (≥8 char, upper+lower+digit+symbol)",
    category: "Identifiers",
    pattern: String.raw`(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=]).{8,}`,
    flags: "",
    description: "Lookahead-based password rule. Use with .test() on the whole string.",
    sampleInput: "Abc123!! (valid), abc (invalid), Password1 (no symbol)",
  },
  {
    id: "html-tag",
    label: "HTML tag (opening or closing)",
    category: "Web",
    pattern: String.raw`<\/?[a-zA-Z][^>]*>`,
    flags: "g",
    description: "Matches any HTML tag including attributes. Not for parsing HTML — use a parser.",
    sampleInput: '<p class="x">hello</p><br/>',
  },
  {
    id: "markdown-link",
    label: "Markdown link [label](url)",
    category: "Web",
    pattern: String.raw`\[([^\]]+)\]\(([^)]+)\)`,
    flags: "g",
    description: "Matches inline markdown links; group 1 = label, group 2 = URL.",
    sampleInput: "Read [Toollyz](https://toollyz.com) and [docs](/docs).",
  },
  {
    id: "hashtag",
    label: "Hashtag (#word)",
    category: "Web",
    pattern: String.raw`(?:^|\s)#[A-Za-z0-9_]+`,
    flags: "g",
    description: "Whitespace-anchored hashtag (so #1 in a header isn't matched).",
    sampleInput: "Loving #toollyz and #buildinpublic — also #1 fan",
  },
  {
    id: "mention",
    label: "Mention (@user)",
    category: "Web",
    pattern: String.raw`(?:^|\s)@[A-Za-z0-9_]+`,
    flags: "g",
    description: "Whitespace-anchored mention.",
    sampleInput: "Hey @ada and @grace — see you Thursday",
  },
];

export const PATTERN_CATEGORIES: PatternEntry["category"][] = ["Common", "Web", "Identifiers", "Numbers", "Dates"];

// ─── Builder ───────────────────────────────────────────────────────────────

export type CharClass = "letters" | "digits" | "alnum" | "whitespace" | "word" | "any" | "custom";

export interface BuilderState {
  charClass: CharClass;
  customClass: string;
  quantifier: "one" | "one-or-more" | "zero-or-more" | "optional" | "exact" | "between";
  exact: number;
  betweenMin: number;
  betweenMax: number;
  startAnchor: boolean;
  endAnchor: boolean;
  flags: { g: boolean; i: boolean; m: boolean; s: boolean };
}

export const DEFAULT_BUILDER: BuilderState = {
  charClass: "word",
  customClass: "",
  quantifier: "one-or-more",
  exact: 4,
  betweenMin: 3,
  betweenMax: 16,
  startAnchor: false,
  endAnchor: false,
  flags: { g: true, i: false, m: false, s: false },
};

const CLASS_TOKENS: Record<CharClass, string> = {
  letters: "[A-Za-z]",
  digits: "\\d",
  alnum: "[A-Za-z0-9]",
  whitespace: "\\s",
  word: "\\w",
  any: ".",
  custom: "",
};

const CLASS_DESCRIPTIONS: Record<CharClass, string> = {
  letters: "any ASCII letter (A-Z, a-z)",
  digits: "any digit (0-9)",
  alnum: "any letter or digit",
  whitespace: "any whitespace character",
  word: "any word character (letters, digits, underscore)",
  any: "any character except a newline (unless 's' flag is set)",
  custom: "a custom set of characters",
};

const QUANTIFIER_TOKEN: Record<BuilderState["quantifier"], (s: BuilderState) => string> = {
  one: () => "",
  "one-or-more": () => "+",
  "zero-or-more": () => "*",
  optional: () => "?",
  exact: (s) => `{${s.exact}}`,
  between: (s) => `{${s.betweenMin},${s.betweenMax}}`,
};

const QUANTIFIER_DESCRIPTION: Record<BuilderState["quantifier"], (s: BuilderState) => string> = {
  one: () => "exactly one",
  "one-or-more": () => "one or more",
  "zero-or-more": () => "zero or more",
  optional: () => "zero or one (optional)",
  exact: (s) => `exactly ${s.exact}`,
  between: (s) => `between ${s.betweenMin} and ${s.betweenMax}`,
};

export interface BuilderOutput {
  pattern: string;
  flags: string;
  explanation: string;
}

function escapeClassContents(s: string): string {
  return s.replace(/([\\\]/^])/g, "\\$1");
}

export function buildRegex(state: BuilderState): BuilderOutput {
  let classToken: string;
  if (state.charClass === "custom") {
    const escaped = escapeClassContents(state.customClass || "");
    classToken = `[${escaped || "A-Za-z0-9"}]`;
  } else {
    classToken = CLASS_TOKENS[state.charClass];
  }
  const quantToken = QUANTIFIER_TOKEN[state.quantifier](state);
  let pattern = `${classToken}${quantToken}`;
  if (state.startAnchor) pattern = `^${pattern}`;
  if (state.endAnchor) pattern = `${pattern}$`;
  const flags = Object.entries(state.flags)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join("");

  const parts: string[] = [];
  if (state.startAnchor) parts.push("starts at the beginning of the line");
  parts.push(`matches ${QUANTIFIER_DESCRIPTION[state.quantifier](state)} of ${CLASS_DESCRIPTIONS[state.charClass]}`);
  if (state.endAnchor) parts.push("anchored to the end of the line");
  const flagWords: string[] = [];
  if (state.flags.g) flagWords.push("globally");
  if (state.flags.i) flagWords.push("case-insensitively");
  if (state.flags.m) flagWords.push("across line breaks");
  if (state.flags.s) flagWords.push("with dot-matches-newline");
  if (flagWords.length) parts.push(`runs ${flagWords.join(", ")}`);
  return {
    pattern,
    flags,
    explanation: parts.join(", "),
  };
}

// ─── Live tester ───────────────────────────────────────────────────────────

export interface TestResult {
  ok: boolean;
  matches: { match: string; index: number; groups?: (string | undefined)[] }[];
  error?: string;
}

export function testRegex(pattern: string, flags: string, input: string): TestResult {
  try {
    const re = new RegExp(pattern, flags);
    const out: TestResult["matches"] = [];
    if (flags.includes("g")) {
      let m: RegExpExecArray | null;
      let safety = 0;
      while ((m = re.exec(input)) && safety < 1000) {
        out.push({ match: m[0], index: m.index, groups: m.slice(1) });
        if (m.index === re.lastIndex) re.lastIndex++;
        safety++;
      }
    } else {
      const m = re.exec(input);
      if (m) out.push({ match: m[0], index: m.index, groups: m.slice(1) });
    }
    return { ok: true, matches: out };
  } catch (e) {
    return { ok: false, matches: [], error: e instanceof Error ? e.message : "Invalid regex" };
  }
}
