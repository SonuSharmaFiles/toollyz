// HTTP Header Checker engine. Parses a raw HTTP response (status line
// optional) into structured headers, then runs a curated set of audits
// across the four pillars users actually care about:
//   - Security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options,
//     Referrer-Policy, Permissions-Policy, COOP/COEP, Cross-Origin-Resource-Policy)
//   - Caching   (Cache-Control directives, ETag, Last-Modified, Expires, Vary)
//   - CORS      (Access-Control-Allow-Origin, -Methods, -Headers, -Credentials,
//                -Max-Age)
//   - Content   (Content-Type, Content-Encoding, Content-Length)
//
// 100% offline. Pure text in, structured analysis out.

export interface HttpHeader {
  name: string;
  /** Lowercased name — for canonical lookups. */
  key: string;
  value: string;
}

export interface HttpStatusLine {
  protocol: string;
  status: number;
  text: string;
}

export interface HeaderFinding {
  severity: "info" | "good" | "warning" | "error";
  header: string;
  message: string;
}

export interface HttpHeaderReport {
  status?: HttpStatusLine;
  headers: HttpHeader[];
  findings: HeaderFinding[];
  /** Quick counts. */
  counts: {
    total: number;
    good: number;
    warnings: number;
    errors: number;
  };
}

const HEADER_LINE_RE = /^([A-Za-z0-9!#$%&'*+\-.^_`|~]+):\s*(.*)$/;
const STATUS_LINE_RE = /^(HTTP\/[0-9.]+|HTTP\/3)\s+(\d{3})\s*(.*)$/i;

export function parseHeaders(text: string): {
  status?: HttpStatusLine;
  headers: HttpHeader[];
} {
  const headers: HttpHeader[] = [];
  let status: HttpStatusLine | undefined;
  // Stop at the first blank line — anything after is body.
  const lines = text.split(/\r?\n/);
  let bodyStarted = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (bodyStarted) break;
    if (line.trim() === "") {
      // Blank line could mean end-of-headers OR a folded line gone wrong.
      // Treat first blank after any header as body.
      if (headers.length > 0) bodyStarted = true;
      continue;
    }
    const sm = STATUS_LINE_RE.exec(line);
    if (sm && i === 0) {
      status = { protocol: sm[1], status: parseInt(sm[2], 10), text: sm[3].trim() };
      continue;
    }
    const m = HEADER_LINE_RE.exec(line);
    if (!m) continue;
    const name = m[1];
    const value = m[2];
    // RFC 7230 obs-fold: a header line continued by leading whitespace.
    let nextValue = value;
    while (i + 1 < lines.length && /^[\t ]/.test(lines[i + 1] ?? "")) {
      nextValue += " " + (lines[i + 1] ?? "").trim();
      i++;
    }
    headers.push({ name, key: name.toLowerCase(), value: nextValue.trim() });
  }
  return { status, headers };
}

function getValue(headers: HttpHeader[], key: string): string | undefined {
  return headers.find((h) => h.key === key.toLowerCase())?.value;
}

function getAll(headers: HttpHeader[], key: string): string[] {
  return headers.filter((h) => h.key === key.toLowerCase()).map((h) => h.value);
}

function parseCacheControl(v: string): Record<string, string | true> {
  const out: Record<string, string | true> = {};
  for (const part of v.split(/,\s*/)) {
    const eq = part.indexOf("=");
    if (eq === -1) out[part.trim().toLowerCase()] = true;
    else out[part.slice(0, eq).trim().toLowerCase()] = part.slice(eq + 1).trim();
  }
  return out;
}

export function analyse(text: string): HttpHeaderReport {
  const { status, headers } = parseHeaders(text);
  const findings: HeaderFinding[] = [];

  // ── Security audits ────────────────────────────────────────────────────────
  const hsts = getValue(headers, "strict-transport-security");
  if (hsts) {
    const directives = hsts.split(/;\s*/).map((s) => s.trim().toLowerCase());
    const maxAge = directives.find((d) => d.startsWith("max-age="))?.split("=")[1];
    const maxAgeNum = maxAge ? parseInt(maxAge, 10) : 0;
    if (maxAgeNum < 15552000) {
      findings.push({
        severity: "warning",
        header: "Strict-Transport-Security",
        message: `max-age=${maxAgeNum} is below 6 months (15,552,000). Browsers and HSTS preload lists prefer ≥ 1 year.`,
      });
    } else {
      findings.push({
        severity: "good",
        header: "Strict-Transport-Security",
        message: `HSTS is enabled with max-age=${maxAgeNum.toLocaleString()}.`,
      });
    }
    if (!directives.includes("includesubdomains")) {
      findings.push({
        severity: "info",
        header: "Strict-Transport-Security",
        message: "Add `includeSubDomains` to extend HSTS to every subdomain.",
      });
    }
    if (!directives.includes("preload")) {
      findings.push({
        severity: "info",
        header: "Strict-Transport-Security",
        message: "Add `preload` and submit to hstspreload.org to ship HSTS in the browser binary.",
      });
    }
  } else {
    findings.push({
      severity: "error",
      header: "Strict-Transport-Security",
      message: "No HSTS header — first-load HTTPS isn't enforced and downgrade attacks are possible.",
    });
  }

  const csp = getValue(headers, "content-security-policy");
  if (csp) {
    findings.push({
      severity: "good",
      header: "Content-Security-Policy",
      message: `CSP is set (${csp.length} chars).`,
    });
    if (/unsafe-inline/.test(csp)) {
      findings.push({
        severity: "warning",
        header: "Content-Security-Policy",
        message: "Policy allows `unsafe-inline` — defeats most XSS protection. Use nonces or hashes instead.",
      });
    }
    if (/unsafe-eval/.test(csp)) {
      findings.push({
        severity: "warning",
        header: "Content-Security-Policy",
        message: "Policy allows `unsafe-eval` — required for some frameworks but expands the attack surface.",
      });
    }
    if (!/default-src/.test(csp)) {
      findings.push({
        severity: "info",
        header: "Content-Security-Policy",
        message: "No `default-src` directive — only explicitly-listed resources are restricted.",
      });
    }
  } else {
    findings.push({
      severity: "warning",
      header: "Content-Security-Policy",
      message: "No CSP — without one the browser will execute any script the page references.",
    });
  }

  const xfo = getValue(headers, "x-frame-options");
  const frameAncestors = csp && /frame-ancestors/.test(csp);
  if (!xfo && !frameAncestors) {
    findings.push({
      severity: "warning",
      header: "X-Frame-Options",
      message: "No X-Frame-Options or CSP frame-ancestors — page can be embedded in a frame anywhere (clickjacking risk).",
    });
  } else if (xfo) {
    findings.push({
      severity: "good",
      header: "X-Frame-Options",
      message: `Framing is restricted (${xfo}).`,
    });
  }

  const xcto = getValue(headers, "x-content-type-options");
  if (!xcto) {
    findings.push({
      severity: "warning",
      header: "X-Content-Type-Options",
      message: "Missing — set to `nosniff` to stop browsers guessing Content-Type from response bytes.",
    });
  } else if (xcto.toLowerCase().trim() !== "nosniff") {
    findings.push({
      severity: "warning",
      header: "X-Content-Type-Options",
      message: `Value '${xcto}' is non-standard — only \`nosniff\` is recognised.`,
    });
  } else {
    findings.push({
      severity: "good",
      header: "X-Content-Type-Options",
      message: "Content-type sniffing is disabled.",
    });
  }

  const refPolicy = getValue(headers, "referrer-policy");
  if (!refPolicy) {
    findings.push({
      severity: "info",
      header: "Referrer-Policy",
      message: "Missing — modern browsers default to `strict-origin-when-cross-origin` but explicit is better.",
    });
  } else {
    findings.push({
      severity: "good",
      header: "Referrer-Policy",
      message: `Set to '${refPolicy}'.`,
    });
  }

  const permsPolicy = getValue(headers, "permissions-policy");
  if (!permsPolicy) {
    findings.push({
      severity: "info",
      header: "Permissions-Policy",
      message: "No Permissions-Policy — use it to disable camera/microphone/geolocation/etc. APIs you don't need.",
    });
  }

  const coop = getValue(headers, "cross-origin-opener-policy");
  if (coop) {
    findings.push({
      severity: "good",
      header: "Cross-Origin-Opener-Policy",
      message: `COOP is set (${coop}) — cross-origin window references are isolated.`,
    });
  }
  const coep = getValue(headers, "cross-origin-embedder-policy");
  if (coep) {
    findings.push({
      severity: "good",
      header: "Cross-Origin-Embedder-Policy",
      message: `COEP is set (${coep}) — required for SharedArrayBuffer and high-resolution timers.`,
    });
  }

  // Deprecated / discouraged headers.
  const xss = getValue(headers, "x-xss-protection");
  if (xss) {
    findings.push({
      severity: "info",
      header: "X-XSS-Protection",
      message: "X-XSS-Protection is deprecated — modern Chrome ignores it. Drop in favour of a strict CSP.",
    });
  }
  const server = getValue(headers, "server");
  if (server) {
    findings.push({
      severity: "info",
      header: "Server",
      message: `Server header leaks '${server}' — consider removing to avoid version fingerprinting.`,
    });
  }
  const xpoweredBy = getValue(headers, "x-powered-by");
  if (xpoweredBy) {
    findings.push({
      severity: "info",
      header: "X-Powered-By",
      message: `X-Powered-By leaks '${xpoweredBy}' — strip in production.`,
    });
  }

  // ── Caching audits ─────────────────────────────────────────────────────────
  const cc = getValue(headers, "cache-control");
  if (cc) {
    const parsed = parseCacheControl(cc);
    const directives = Object.keys(parsed).join(", ");
    findings.push({
      severity: "good",
      header: "Cache-Control",
      message: `Set: ${directives}.`,
    });
    if (parsed["no-store"]) {
      findings.push({
        severity: "info",
        header: "Cache-Control",
        message: "`no-store` forbids all caching — appropriate for sensitive responses, but verify it's intentional.",
      });
    }
    if (parsed["public"] && parsed["private"]) {
      findings.push({
        severity: "warning",
        header: "Cache-Control",
        message: "Both `public` and `private` directives present — contradictory.",
      });
    }
    if (parsed["max-age"] && typeof parsed["max-age"] === "string") {
      const n = parseInt(parsed["max-age"], 10);
      if (n > 31_536_000) {
        findings.push({
          severity: "info",
          header: "Cache-Control",
          message: `max-age=${n.toLocaleString()} exceeds 1 year — RFC 7234 says implementations may cap.`,
        });
      }
    }
  }

  const expires = getValue(headers, "expires");
  if (expires && cc) {
    findings.push({
      severity: "info",
      header: "Expires",
      message: "Both Cache-Control and Expires present — Cache-Control wins; Expires can be removed.",
    });
  }

  const etag = getValue(headers, "etag");
  const lastMod = getValue(headers, "last-modified");
  if (!etag && !lastMod && cc && !parseCacheControl(cc)["no-store"]) {
    findings.push({
      severity: "info",
      header: "ETag / Last-Modified",
      message: "Cached but neither ETag nor Last-Modified — clients can't validate freshness without revalidating fully.",
    });
  }

  // ── CORS audits ────────────────────────────────────────────────────────────
  const allowOrigin = getValue(headers, "access-control-allow-origin");
  const allowCreds = getValue(headers, "access-control-allow-credentials");
  if (allowOrigin === "*" && allowCreds?.toLowerCase().trim() === "true") {
    findings.push({
      severity: "error",
      header: "Access-Control-Allow-Origin",
      message: "Wildcard `*` together with `Allow-Credentials: true` is rejected by every browser — credentials never sent.",
    });
  } else if (allowOrigin === "*") {
    findings.push({
      severity: "info",
      header: "Access-Control-Allow-Origin",
      message: "Wildcard `*` — any origin can fetch this resource (fine for public assets, risky for APIs).",
    });
  } else if (allowOrigin) {
    findings.push({
      severity: "good",
      header: "Access-Control-Allow-Origin",
      message: `Allows origin '${allowOrigin}'.`,
    });
  }
  const varyHeader = getValue(headers, "vary");
  if (allowOrigin && allowOrigin !== "*" && !(varyHeader && /origin/i.test(varyHeader))) {
    findings.push({
      severity: "warning",
      header: "Vary",
      message: "Allow-Origin reflects a specific origin but Vary doesn't include `Origin` — caches will serve the wrong response.",
    });
  }
  const allowMethods = getValue(headers, "access-control-allow-methods");
  if (allowMethods && /\*/.test(allowMethods) && allowCreds?.toLowerCase().trim() === "true") {
    findings.push({
      severity: "error",
      header: "Access-Control-Allow-Methods",
      message: "Wildcard methods with credentials is invalid per Fetch spec.",
    });
  }
  const allowHeaders = getValue(headers, "access-control-allow-headers");
  if (allowHeaders && /\*/.test(allowHeaders) && allowCreds?.toLowerCase().trim() === "true") {
    findings.push({
      severity: "error",
      header: "Access-Control-Allow-Headers",
      message: "Wildcard headers with credentials is invalid per Fetch spec.",
    });
  }

  // ── Content audits ─────────────────────────────────────────────────────────
  const ct = getValue(headers, "content-type");
  if (!ct) {
    findings.push({
      severity: "warning",
      header: "Content-Type",
      message: "Missing — browser will guess. Always send an explicit Content-Type.",
    });
  } else if (/text\/html/.test(ct) && !/charset=/i.test(ct)) {
    findings.push({
      severity: "info",
      header: "Content-Type",
      message: "HTML response without `charset=` — declare `; charset=utf-8` to avoid mojibake.",
    });
  }

  const cookies = getAll(headers, "set-cookie");
  for (const c of cookies) {
    const flags = c.toLowerCase();
    if (!/(^|;\s*)secure(;|$|\s)/.test(flags)) {
      findings.push({
        severity: "warning",
        header: "Set-Cookie",
        message: `Cookie '${c.split("=")[0]}' missing \`Secure\` — would be sent over plain HTTP.`,
      });
    }
    if (!/(^|;\s*)httponly(;|$|\s)/.test(flags)) {
      findings.push({
        severity: "warning",
        header: "Set-Cookie",
        message: `Cookie '${c.split("=")[0]}' missing \`HttpOnly\` — readable by JavaScript.`,
      });
    }
    if (!/(^|;\s*)samesite=/.test(flags)) {
      findings.push({
        severity: "info",
        header: "Set-Cookie",
        message: `Cookie '${c.split("=")[0]}' missing \`SameSite=\` — modern browsers default to Lax.`,
      });
    }
  }

  // Status-code sanity check.
  if (status && status.status >= 500) {
    findings.push({
      severity: "error",
      header: "Status",
      message: `${status.status} ${status.text} — server error.`,
    });
  } else if (status && status.status >= 400) {
    findings.push({
      severity: "warning",
      header: "Status",
      message: `${status.status} ${status.text} — client error.`,
    });
  } else if (status && status.status >= 300 && status.status < 400) {
    const loc = getValue(headers, "location");
    findings.push({
      severity: "info",
      header: "Status",
      message: `${status.status} redirect${loc ? ` → ${loc}` : ""}.`,
    });
  }

  const counts = {
    total: findings.length,
    good: findings.filter((f) => f.severity === "good").length,
    warnings: findings.filter((f) => f.severity === "warning").length,
    errors: findings.filter((f) => f.severity === "error").length,
  };

  return { status, headers, findings, counts };
}

export const SAMPLE_HEADERS = `HTTP/2 200 OK
Date: Sun, 31 May 2026 14:23:11 GMT
Content-Type: text/html; charset=utf-8
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'; style-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
Cache-Control: public, max-age=3600, must-revalidate
ETag: "abc123-2025"
Vary: Accept-Encoding, Origin
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
Set-Cookie: sessionId=xyz; Path=/; Secure; HttpOnly; SameSite=Strict
Server: cloudflare`;
