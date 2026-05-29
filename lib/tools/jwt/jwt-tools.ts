// JWT engine for the Toollyz JWT Decoder. Splits and base64url-decodes a JSON
// Web Token's header and payload (UTF-8 aware), humanizes the registered
// claims, and reports structural + security warnings. Pure and dependency-free;
// everything runs in the browser, so tokens are never uploaded. Signature
// verification (HS256) lives in ./verify.ts.

import { base64UrlToBytes, decodeUtf8 } from "@/lib/tools/shared/base64";

export type TokenState = "active" | "expired" | "not-yet-valid" | "no-expiry" | "empty" | "invalid";

export interface DecodedJwt {
  ok: boolean;
  header: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  signature: string;
  segments: { header: string; payload: string; signature: string };
  alg: string | null;
  typ: string | null;
  state: TokenState;
  expMs: number | null;
  iatMs: number | null;
  nbfMs: number | null;
  errors: string[];
  warnings: string[];
}

export interface ClaimRow {
  key: string;
  label: string;
  description?: string;
  display: string;
  isDate: boolean;
  badge?: { text: string; tone: "ok" | "warn" | "bad" };
}

export const CLAIM_DESCRIPTIONS: Record<string, string> = {
  iss: "Issuer — who created and signed this token",
  sub: "Subject — who the token is about",
  aud: "Audience — who the token is intended for",
  exp: "Expiration time — when the token stops being valid",
  nbf: "Not before — when the token starts being valid",
  iat: "Issued at — when the token was created",
  jti: "JWT ID — a unique identifier for this token",
  azp: "Authorized party — the party the token was issued to",
  scope: "Scopes granted by this token",
  scp: "Scopes granted by this token",
  email: "Email address of the subject",
  name: "Display name of the subject",
  role: "Role assigned to the subject",
  roles: "Roles assigned to the subject",
};

const DATE_CLAIMS = new Set(["exp", "nbf", "iat", "auth_time", "updated_at"]);

function toMs(value: number): number {
  // NumericDate is seconds since epoch; tolerate tokens that mistakenly use ms.
  return value > 1e12 ? value : value * 1000;
}

function decodeSegment(seg: string): { value: Record<string, unknown> | null; error?: string } {
  if (!seg) return { value: null, error: "missing segment" };
  let json: string;
  try {
    json = decodeUtf8(base64UrlToBytes(seg));
  } catch {
    return { value: null, error: "is not valid base64url" };
  }
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return { value: parsed as Record<string, unknown> };
    return { value: null, error: "is not a JSON object" };
  } catch {
    return { value: null, error: "is not valid JSON" };
  }
}

export function decodeJwt(token: string): DecodedJwt {
  const empty: DecodedJwt = {
    ok: false, header: null, payload: null, signature: "",
    segments: { header: "", payload: "", signature: "" },
    alg: null, typ: null, state: "empty", expMs: null, iatMs: null, nbfMs: null,
    errors: [], warnings: [],
  };
  const trimmed = token.trim();
  if (!trimmed) return empty;

  const parts = trimmed.split(".");
  const errors: string[] = [];
  const warnings: string[] = [];
  if (parts.length !== 3) {
    return { ...empty, state: "invalid", errors: [`A JWT must have 3 dot-separated parts — this one has ${parts.length}.`] };
  }
  const [hSeg, pSeg, sSeg] = parts;

  const h = decodeSegment(hSeg);
  const p = decodeSegment(pSeg);
  if (h.error) errors.push(`The header ${h.error}.`);
  if (p.error) errors.push(`The payload ${p.error}.`);

  const header = h.value;
  const payload = p.value;
  const alg = header && typeof header.alg === "string" ? (header.alg as string) : null;
  const typ = header && typeof header.typ === "string" ? (header.typ as string) : null;

  if (alg === "none") warnings.push('Algorithm is "none" — this token is unsecured and must never be trusted in production.');
  if (header && !("alg" in header)) warnings.push("The header has no alg field.");
  if (!sSeg && alg !== "none") warnings.push("The signature segment is empty.");

  const now = Date.now();
  const expMs = payload && typeof payload.exp === "number" ? toMs(payload.exp) : null;
  const nbfMs = payload && typeof payload.nbf === "number" ? toMs(payload.nbf) : null;
  const iatMs = payload && typeof payload.iat === "number" ? toMs(payload.iat) : null;

  let state: TokenState = "no-expiry";
  if (errors.length) state = "invalid";
  else if (expMs !== null && expMs < now) state = "expired";
  else if (nbfMs !== null && nbfMs > now) state = "not-yet-valid";
  else if (expMs !== null) state = "active";

  return {
    ok: errors.length === 0,
    header, payload, signature: sSeg,
    segments: { header: hSeg, payload: pSeg, signature: sSeg },
    alg, typ, state, expMs, iatMs, nbfMs, errors, warnings,
  };
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "invalid date";
  const rel = relativeTime(ms - Date.now());
  return `${d.toLocaleString()} (${rel})`;
}

function relativeTime(deltaMs: number): string {
  const abs = Math.abs(deltaMs);
  const past = deltaMs < 0;
  const units: [number, string][] = [
    [1000 * 60 * 60 * 24 * 365, "year"],
    [1000 * 60 * 60 * 24 * 30, "month"],
    [1000 * 60 * 60 * 24, "day"],
    [1000 * 60 * 60, "hour"],
    [1000 * 60, "minute"],
    [1000, "second"],
  ];
  for (const [ms, label] of units) {
    const n = Math.floor(abs / ms);
    if (n >= 1) return past ? `${n} ${label}${n === 1 ? "" : "s"} ago` : `in ${n} ${label}${n === 1 ? "" : "s"}`;
  }
  return "just now";
}

export function humanizeClaims(payload: Record<string, unknown> | null): ClaimRow[] {
  if (!payload) return [];
  const now = Date.now();
  return Object.entries(payload).map(([key, value]) => {
    const isDate = DATE_CLAIMS.has(key) && typeof value === "number";
    let display: string;
    let badge: ClaimRow["badge"];
    if (isDate) {
      const ms = toMs(value as number);
      display = formatDate(ms);
      if (key === "exp") badge = ms < now ? { text: "expired", tone: "bad" } : { text: "valid", tone: "ok" };
      if (key === "nbf" && ms > now) badge = { text: "not yet active", tone: "warn" };
    } else if (typeof value === "object") {
      display = JSON.stringify(value);
    } else {
      display = String(value);
    }
    return { key, label: key, description: CLAIM_DESCRIPTIONS[key], display, isDate, badge };
  });
}

export const STATE_LABEL: Record<TokenState, { text: string; tone: "ok" | "warn" | "bad" | "muted" }> = {
  active: { text: "Active", tone: "ok" },
  expired: { text: "Expired", tone: "bad" },
  "not-yet-valid": { text: "Not yet valid", tone: "warn" },
  "no-expiry": { text: "No expiry set", tone: "muted" },
  empty: { text: "—", tone: "muted" },
  invalid: { text: "Invalid", tone: "bad" },
};

export const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

// The sample above is the canonical example token; it verifies with the
// HMAC secret below.
export const SAMPLE_SECRET = "your-256-bit-secret";
