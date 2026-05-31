// htaccess Redirect Generator engine. Produces clean Apache rewrite /
// redirect rules from a structured rule list. Pure string generation —
// no Apache validation, just well-formed directives.

export type RuleType = "simple" | "wildcard" | "regex" | "https" | "www-add" | "www-remove" | "trailing-slash";

export interface RuleMeta {
  id: RuleType;
  label: string;
  hint: string;
}

export const RULE_TYPES: RuleMeta[] = [
  { id: "simple", label: "Simple redirect (old → new)", hint: "Permanent redirect from one URL path to another." },
  { id: "wildcard", label: "Wildcard redirect (folder → folder)", hint: "Redirect all paths under /old/ to /new/, preserving the tail." },
  { id: "regex", label: "Regex rewrite", hint: "Pattern-based rewrite using RewriteRule." },
  { id: "https", label: "Force HTTPS", hint: "Redirect http:// requests to https://." },
  { id: "www-add", label: "Add www subdomain", hint: "Redirect example.com → www.example.com." },
  { id: "www-remove", label: "Remove www subdomain", hint: "Redirect www.example.com → example.com." },
  { id: "trailing-slash", label: "Force trailing slash", hint: "Add a trailing slash to URLs that don't have one." },
];

export interface Rule {
  id: string;
  type: RuleType;
  /** Source URL (for simple / wildcard / regex). */
  from: string;
  /** Destination URL. */
  to: string;
  /** HTTP status — 301 (permanent) or 302 (temporary). */
  status: 301 | 302 | 303 | 307;
  /** Preserve query string. */
  preserveQuery: boolean;
  /** Hostname (for https / www rules). */
  host?: string;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function newRule(type: RuleType = "simple"): Rule {
  return {
    id: uid(),
    type,
    from: type === "simple" || type === "wildcard" ? "/old-path" : "(.*)",
    to: type === "simple" ? "/new-path" : type === "wildcard" ? "/new-path/$1" : "/new/$1",
    status: 301,
    preserveQuery: true,
    host: "example.com",
  };
}

// ── Emitters ────────────────────────────────────────────────────────────────

function emitRedirect(rule: Rule): string {
  const status = rule.status;
  // The Redirect directive handles simple path-to-path with optional status.
  return `Redirect ${status} ${rule.from} ${rule.to}`;
}

function emitRedirectMatch(rule: Rule): string {
  return `RedirectMatch ${rule.status} ^${rule.from}$ ${rule.to}`;
}

function emitWildcard(rule: Rule): string {
  const from = rule.from.replace(/\/+$/, "");
  const to = rule.to.replace(/\$1/g, "$1"); // already in form
  return [
    "RewriteEngine On",
    `RewriteRule ^${escapeRegex(from)}/(.*)$ ${to.includes("$1") ? to : `${to}/$1`} [R=${rule.status},L${rule.preserveQuery ? ",QSA" : ""}]`,
  ].join("\n");
}

function emitRegex(rule: Rule): string {
  return [
    "RewriteEngine On",
    `RewriteRule ${rule.from} ${rule.to} [R=${rule.status},L${rule.preserveQuery ? ",QSA" : ""}]`,
  ].join("\n");
}

function emitForceHttps(): string {
  return [
    "RewriteEngine On",
    "RewriteCond %{HTTPS} off",
    "RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]",
  ].join("\n");
}

function emitAddWww(rule: Rule): string {
  const host = (rule.host ?? "example.com").replace(/^www\./, "");
  return [
    "RewriteEngine On",
    `RewriteCond %{HTTP_HOST} ^${escapeRegex(host)}$ [NC]`,
    `RewriteRule ^(.*)$ https://www.${host}/$1 [R=${rule.status},L]`,
  ].join("\n");
}

function emitRemoveWww(rule: Rule): string {
  const host = (rule.host ?? "example.com").replace(/^www\./, "");
  return [
    "RewriteEngine On",
    `RewriteCond %{HTTP_HOST} ^www\\.${escapeRegex(host)}$ [NC]`,
    `RewriteRule ^(.*)$ https://${host}/$1 [R=${rule.status},L]`,
  ].join("\n");
}

function emitTrailingSlash(): string {
  return [
    "RewriteEngine On",
    "RewriteCond %{REQUEST_FILENAME} !-f",
    "RewriteCond %{REQUEST_FILENAME} !-d",
    "RewriteCond %{REQUEST_URI} !(.*)/$",
    "RewriteRule ^(.*)$ /$1/ [R=301,L]",
  ].join("\n");
}

function escapeRegex(s: string): string {
  return s.replace(/([.+?^${}()|[\]\\])/g, "\\$1");
}

export interface GenerateOptions {
  /** Wrap output in an IfModule block for safety. */
  wrapIfModule: boolean;
  /** Add a comment header. */
  addHeader: boolean;
  /** Use RedirectMatch (regex) for the "simple" rule type for query-string safety. */
  simpleUsesRedirectMatch: boolean;
}

export const DEFAULT_GENERATE_OPTIONS: GenerateOptions = {
  wrapIfModule: true,
  addHeader: true,
  simpleUsesRedirectMatch: false,
};

export function generateHtaccess(rules: Rule[], opt: GenerateOptions = DEFAULT_GENERATE_OPTIONS): string {
  const blocks: string[] = [];
  for (const rule of rules) {
    switch (rule.type) {
      case "simple":
        blocks.push(opt.simpleUsesRedirectMatch ? emitRedirectMatch(rule) : emitRedirect(rule));
        break;
      case "wildcard":
        blocks.push(emitWildcard(rule));
        break;
      case "regex":
        blocks.push(emitRegex(rule));
        break;
      case "https":
        blocks.push(emitForceHttps());
        break;
      case "www-add":
        blocks.push(emitAddWww(rule));
        break;
      case "www-remove":
        blocks.push(emitRemoveWww(rule));
        break;
      case "trailing-slash":
        blocks.push(emitTrailingSlash());
        break;
    }
  }
  const lines: string[] = [];
  if (opt.addHeader) {
    lines.push("# .htaccess generated by Toollyz htaccess Redirect Generator");
    lines.push("# https://toollyz.com/tools/htaccess-redirect-generator/");
    lines.push("");
  }
  if (opt.wrapIfModule) {
    lines.push("<IfModule mod_rewrite.c>");
    lines.push("  Options +FollowSymLinks");
    lines.push("");
    lines.push(blocks.map((b) => b.split("\n").map((l) => `  ${l}`).join("\n")).join("\n\n"));
    lines.push("</IfModule>");
  } else {
    lines.push(blocks.join("\n\n"));
  }
  return lines.join("\n") + "\n";
}

export const DEFAULT_RULES: Rule[] = [
  { id: "r1", type: "https", from: "(.*)", to: "https://example.com/$1", status: 301, preserveQuery: true },
  { id: "r2", type: "www-remove", from: "(.*)", to: "https://example.com/$1", status: 301, preserveQuery: true, host: "example.com" },
  { id: "r3", type: "simple", from: "/blog/old-post", to: "/blog/new-post", status: 301, preserveQuery: true },
];
