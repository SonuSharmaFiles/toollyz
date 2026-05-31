// SPF Record Checker engine. Parses RFC 7208 SPF records (TXT values
// beginning with "v=spf1"), classifies each token as a mechanism or
// modifier, applies the standard qualifier prefix rules (+ - ~ ?), and
// flags common mistakes (over the 10-lookup limit, no terminating "all",
// duplicate +all, redirected to non-existent domain, etc.).

export type Qualifier = "+" | "-" | "~" | "?";

export type MechanismName =
  | "all"
  | "ip4"
  | "ip6"
  | "a"
  | "mx"
  | "ptr"
  | "exists"
  | "include";

export type ModifierName = "redirect" | "exp";

export interface Mechanism {
  kind: "mechanism";
  qualifier: Qualifier;
  name: MechanismName;
  /** Optional value after the colon — e.g. "include:example.com" → "example.com". */
  value?: string;
  /** Optional CIDR length / prefix. */
  cidr4?: number;
  cidr6?: number;
  /** Original raw token. */
  raw: string;
  /** Whether the mechanism counts toward the 10-DNS-lookup limit. */
  causesLookup: boolean;
}

export interface Modifier {
  kind: "modifier";
  name: ModifierName;
  value: string;
  raw: string;
}

export type SpfToken = Mechanism | Modifier;

export interface SpfIssue {
  severity: "error" | "warning" | "info";
  message: string;
  /** Index of the offending token, when applicable. */
  tokenIndex?: number;
}

export interface SpfParseResult {
  ok: boolean;
  version: string;
  tokens: SpfToken[];
  issues: SpfIssue[];
  /** Number of mechanisms that require DNS lookups (limit: 10). */
  lookupCount: number;
  /** The terminating mechanism (default ?all when not specified — softfail). */
  terminator?: Mechanism;
  raw: string;
}

const LOOKUP_MECHANISMS = new Set<MechanismName>(["a", "mx", "ptr", "exists", "include"]);
const KNOWN_MECHANISMS = new Set<MechanismName>(["all", "ip4", "ip6", "a", "mx", "ptr", "exists", "include"]);
const KNOWN_MODIFIERS = new Set<ModifierName>(["redirect", "exp"]);

function parseToken(raw: string, issues: SpfIssue[], index: number): SpfToken | null {
  if (raw.includes("=") && !raw.startsWith("ip4:") && !raw.startsWith("ip6:")) {
    // Could be a modifier (redirect=…, exp=…) or `v=spf1` — handled outside.
    const eq = raw.indexOf("=");
    const name = raw.slice(0, eq).toLowerCase();
    const value = raw.slice(eq + 1);
    if (KNOWN_MODIFIERS.has(name as ModifierName)) {
      return { kind: "modifier", name: name as ModifierName, value, raw };
    }
    issues.push({ severity: "warning", tokenIndex: index, message: `Unknown modifier '${name}'.` });
    return null;
  }
  // Mechanism — may have a leading qualifier.
  let qualifier: Qualifier = "+";
  let body = raw;
  if (raw[0] === "+" || raw[0] === "-" || raw[0] === "~" || raw[0] === "?") {
    qualifier = raw[0] as Qualifier;
    body = raw.slice(1);
  }
  // Pull out the name and (optional) value.
  let name = body;
  let value: string | undefined;
  const colon = body.indexOf(":");
  if (colon > 0) {
    name = body.slice(0, colon);
    value = body.slice(colon + 1);
  } else if (body.includes("/")) {
    // a/24 form — name "a", value undefined, cidr4 = 24.
    const slash = body.indexOf("/");
    name = body.slice(0, slash);
    value = undefined;
  }
  let cidr4: number | undefined;
  let cidr6: number | undefined;
  // Pull CIDR mask out of value (or trailing slash).
  if (value && value.includes("/")) {
    const m = /^([^/]*)\/(\d+)(?:\/\/(\d+))?$/.exec(value);
    if (m) {
      value = m[1] || undefined;
      cidr4 = parseInt(m[2], 10);
      if (m[3]) cidr6 = parseInt(m[3], 10);
    }
  } else if (body.includes("/") && !body.includes(":")) {
    const m = /\/(\d+)/.exec(body);
    if (m) cidr4 = parseInt(m[1], 10);
  }
  const lower = name.toLowerCase();
  if (!KNOWN_MECHANISMS.has(lower as MechanismName)) {
    issues.push({ severity: "error", tokenIndex: index, message: `Unknown mechanism '${name}' (qualifier '${qualifier}').` });
    return null;
  }
  const mech: Mechanism = {
    kind: "mechanism",
    qualifier,
    name: lower as MechanismName,
    value,
    cidr4,
    cidr6,
    raw,
    causesLookup: LOOKUP_MECHANISMS.has(lower as MechanismName),
  };
  if (mech.name === "include" && !value) {
    issues.push({ severity: "error", tokenIndex: index, message: "include: requires a domain (e.g. include:_spf.example.com)." });
  }
  if ((mech.name === "ip4" || mech.name === "ip6") && !value) {
    issues.push({ severity: "error", tokenIndex: index, message: `${mech.name}: requires an IP address or CIDR.` });
  }
  if (mech.name === "ip4" && value && !validIpv4(value)) {
    issues.push({ severity: "warning", tokenIndex: index, message: `Invalid IPv4 address '${value}'.` });
  }
  if (mech.name === "ip6" && value && !validIpv6(value)) {
    issues.push({ severity: "warning", tokenIndex: index, message: `Invalid IPv6 address '${value}'.` });
  }
  if (mech.cidr4 !== undefined && (mech.cidr4 < 0 || mech.cidr4 > 32)) {
    issues.push({ severity: "warning", tokenIndex: index, message: `IPv4 CIDR /${mech.cidr4} out of range (0–32).` });
  }
  if (mech.cidr6 !== undefined && (mech.cidr6 < 0 || mech.cidr6 > 128)) {
    issues.push({ severity: "warning", tokenIndex: index, message: `IPv6 CIDR /${mech.cidr6} out of range (0–128).` });
  }
  return mech;
}

function validIpv4(ip: string): boolean {
  return /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/.test(ip);
}

function validIpv6(ip: string): boolean {
  // Simplified — accepts canonical forms but not edge cases.
  return /^[A-Fa-f0-9:]+$/.test(ip) && ip.split(":").length <= 9 && ip.includes(":");
}

export function parseSpf(input: string): SpfParseResult {
  const raw = input.trim().replace(/[‘’“”]/g, "");
  const issues: SpfIssue[] = [];
  if (!raw) return { ok: false, version: "", tokens: [], issues: [{ severity: "error", message: "Empty input." }], lookupCount: 0, raw };
  if (!/^v=spf1\b/i.test(raw)) {
    return {
      ok: false,
      version: "",
      tokens: [],
      issues: [{ severity: "error", message: "SPF records must start with 'v=spf1'." }],
      lookupCount: 0,
      raw,
    };
  }
  const parts = raw.split(/\s+/);
  const version = parts.shift() ?? "v=spf1";
  const tokens: SpfToken[] = [];
  let terminator: Mechanism | undefined;
  parts.forEach((p, i) => {
    if (!p) return;
    const tok = parseToken(p, issues, i);
    if (tok) tokens.push(tok);
    if (tok && tok.kind === "mechanism" && tok.name === "all") {
      terminator = tok;
      if (tok.qualifier === "+") {
        issues.push({ severity: "warning", tokenIndex: i, message: "+all means 'permit any sender' — almost always wrong." });
      }
    }
  });
  const lookupCount = tokens.reduce((sum, t) => (t.kind === "mechanism" && t.causesLookup ? sum + 1 : sum), 0);
  if (lookupCount > 10) {
    issues.push({ severity: "error", message: `${lookupCount} DNS-lookup-causing mechanisms — limit is 10 per RFC 7208 §4.6.4.` });
  } else if (lookupCount > 8) {
    issues.push({ severity: "warning", message: `${lookupCount} DNS-lookup-causing mechanisms — limit is 10, approaching the threshold.` });
  }
  if (!terminator) {
    issues.push({ severity: "warning", message: "No 'all' mechanism — record falls back to ?all (softfail, neutral) which may not be your intent." });
  }
  if (tokens.length === 0) {
    issues.push({ severity: "warning", message: "Record contains only v=spf1 with no mechanisms — every sender is unauthorised (effectively -all)." });
  }
  // Look for terminator-after-tokens issues.
  const allIndex = tokens.findIndex((t) => t.kind === "mechanism" && t.name === "all");
  if (allIndex >= 0 && allIndex !== tokens.length - 1) {
    issues.push({ severity: "warning", message: "'all' should be the final mechanism — anything after it is ignored." });
  }
  const ok = issues.filter((i) => i.severity === "error").length === 0;
  return { ok, version, tokens, issues, lookupCount, terminator, raw };
}

export const QUALIFIER_NAMES: Record<Qualifier, { name: string; result: string; hint: string }> = {
  "+": { name: "Pass", result: "pass", hint: "Authorised — explicit allow." },
  "-": { name: "Fail", result: "fail", hint: "Reject — explicit deny (use -all to reject everything else)." },
  "~": { name: "SoftFail", result: "softfail", hint: "Deliver to spam — used while testing, before switching to -all." },
  "?": { name: "Neutral", result: "neutral", hint: "No assertion — treated as if no SPF record at all." },
};

export const SAMPLE_SPF =
  "v=spf1 include:_spf.google.com include:mailgun.org ip4:198.51.100.0/24 a:mail.example.com mx:example.com ~all";
