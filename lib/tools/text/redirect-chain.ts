// Redirect Chain Checker engine. Parses the output of `curl -IL` (or a
// concatenation of HTTP responses) into a chain of hops — each hop's
// status, location, server, content-type, etc. — plus a per-hop set of
// signals (downgrade from https → http, infinite loops, missing
// Location header on 3xx, etc.).

export interface RedirectHop {
  index: number;
  protocol: string;
  status: number;
  statusText: string;
  location?: string;
  server?: string;
  contentType?: string;
  setCookieCount: number;
  /** All raw headers for the hop. */
  headers: { name: string; value: string }[];
  notes: { severity: "info" | "warning" | "error"; message: string }[];
}

export interface ChainReport {
  hops: RedirectHop[];
  /** First URL we can infer (looking at the first 3xx Location's predecessor). */
  startingUrl?: string;
  finalUrl?: string;
  finalStatus?: number;
  /** Whether the chain ends in a non-3xx. */
  resolved: boolean;
  notes: { severity: "info" | "warning" | "error"; message: string }[];
}

const STATUS_LINE_RE = /^(HTTP\/[0-9.]+|HTTP\/3)\s+(\d{3})\s*(.*)$/i;

function isHttp(s: string): boolean {
  return /^http:\/\//i.test(s);
}
function isHttps(s: string): boolean {
  return /^https:\/\//i.test(s);
}

function resolveLocation(base: string | undefined, location: string): string {
  if (!base) return location;
  try {
    return new URL(location, base).toString();
  } catch {
    return location;
  }
}

export function parse(input: string): ChainReport {
  const text = input.replace(/\r/g, "");
  const lines = text.split("\n");
  const hops: RedirectHop[] = [];
  let current: RedirectHop | null = null;
  let lineIdx = 0;
  while (lineIdx < lines.length) {
    const line = lines[lineIdx];
    const sm = STATUS_LINE_RE.exec(line);
    if (sm) {
      if (current) hops.push(current);
      current = {
        index: hops.length + 1,
        protocol: sm[1],
        status: parseInt(sm[2], 10),
        statusText: sm[3].trim(),
        setCookieCount: 0,
        headers: [],
        notes: [],
      };
      lineIdx++;
      continue;
    }
    if (current && line.trim() && !line.startsWith("curl:") && !line.startsWith("*")) {
      const hm = /^([A-Za-z0-9-]+):\s*(.*)$/.exec(line);
      if (hm) {
        const name = hm[1];
        const value = hm[2];
        current.headers.push({ name, value });
        const lower = name.toLowerCase();
        if (lower === "location") current.location = value;
        else if (lower === "server") current.server = value;
        else if (lower === "content-type") current.contentType = value;
        else if (lower === "set-cookie") current.setCookieCount++;
      }
    }
    lineIdx++;
  }
  if (current) hops.push(current);

  if (hops.length === 0) {
    return {
      hops: [],
      resolved: false,
      notes: [{ severity: "error", message: "No HTTP status lines found. Paste the output of `curl -IL https://example.com`." }],
    };
  }

  // Resolve relative Location headers against the previous Location.
  const chainNotes: ChainReport["notes"] = [];
  let runningUrl: string | undefined;
  const seen = new Set<string>();
  for (let i = 0; i < hops.length; i++) {
    const h = hops[i];
    if (h.location) {
      const resolved = resolveLocation(runningUrl, h.location);
      h.location = resolved;
    }
    if (h.status >= 300 && h.status < 400) {
      if (!h.location) {
        h.notes.push({ severity: "error", message: "3xx response without a Location header." });
      } else {
        if (runningUrl && isHttps(runningUrl) && isHttp(h.location)) {
          h.notes.push({ severity: "error", message: "Downgrade from https → http — content will be mixed-content blocked." });
        }
        if (seen.has(h.location)) {
          h.notes.push({ severity: "error", message: "Redirects back to a previously visited URL — infinite loop." });
        }
        seen.add(h.location);
      }
    }
    runningUrl = h.location ?? runningUrl;
    if (h.setCookieCount > 0 && h.status >= 300 && h.status < 400) {
      h.notes.push({ severity: "info", message: `${h.setCookieCount} Set-Cookie on a redirect — cookies survive cross-redirect chains but can be unexpectedly large.` });
    }
    if (h.status === 301) h.notes.push({ severity: "info", message: "301 Moved Permanently — caches and search engines remember this." });
    if (h.status === 302) h.notes.push({ severity: "info", message: "302 Found — temporary; search engines won't transfer ranking." });
    if (h.status === 307) h.notes.push({ severity: "info", message: "307 Temporary Redirect — keeps the HTTP method." });
    if (h.status === 308) h.notes.push({ severity: "info", message: "308 Permanent Redirect — keeps the HTTP method." });
  }

  const finalHop = hops[hops.length - 1];
  const resolved = finalHop.status < 300 || finalHop.status >= 400;
  const finalUrl = finalHop.location ?? runningUrl;
  const startingUrl = hops[0].location ? undefined : undefined;

  if (hops.length > 5) {
    chainNotes.push({ severity: "warning", message: `${hops.length} hops — Google recommends ≤ 5 redirects for SEO; browsers cap at ~20.` });
  }
  if (!resolved) {
    chainNotes.push({ severity: "warning", message: "Chain ends in a 3xx — the final destination is unknown." });
  }
  const httpsToHttp = hops.some((h) => h.notes.some((n) => /downgrade from https/.test(n.message)));
  if (httpsToHttp) {
    chainNotes.push({ severity: "error", message: "Chain includes a HTTPS → HTTP downgrade — block this in production." });
  }

  return { hops, resolved, finalUrl, finalStatus: finalHop.status, startingUrl, notes: chainNotes };
}

export const SAMPLE_CURL = `HTTP/2 301
location: https://www.example.com/
date: Sat, 31 May 2026 22:00:00 GMT
server: cloudflare

HTTP/2 308
location: https://www.example.com/welcome
content-length: 0

HTTP/2 200
content-type: text/html; charset=utf-8
cache-control: public, max-age=3600
server: cloudflare
cf-ray: 8a3f9c1e4d2a1234-LAX`;
