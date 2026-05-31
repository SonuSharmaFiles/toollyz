// Email Header Analyzer engine. Parses raw RFC 5322 headers, splits the
// Received chain, surfaces SPF / DKIM / DMARC results, and tracks the
// hop-by-hop latency where timestamps are present. Pure functions — no
// network call, no upload, no AI.

export interface Header {
  /** Lower-case canonical name. */
  name: string;
  /** Original casing as it appeared. */
  rawName: string;
  /** Field value (unfolded — continuation lines joined). */
  value: string;
}

export interface ReceivedHop {
  raw: string;
  /** Index in chain (0 = nearest sender, N = nearest receiver). */
  index: number;
  /** Sending host extracted from "from" clause. */
  from?: string;
  /** Receiving host extracted from "by" clause. */
  by?: string;
  /** Protocol extracted from "with" clause. */
  with?: string;
  /** Date extracted from the tail of the Received line. */
  date?: Date;
  /** Latency from previous hop in milliseconds (positive number). */
  latencyMs?: number;
}

export type AuthVerdict = "pass" | "fail" | "softfail" | "neutral" | "none" | "permerror" | "temperror";

export interface AuthResult {
  /** SPF, DKIM, DMARC, ARC, etc. */
  method: string;
  verdict: AuthVerdict;
  /** Domain the verdict applies to. */
  domain?: string;
  /** Raw value for the line we extracted from. */
  raw: string;
}

export interface EmailHeaderAnalysis {
  headers: Header[];
  /** Common headers extracted to top level. */
  subject?: string;
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  date?: Date;
  messageId?: string;
  replyTo?: string;
  /** Received chain — index 0 is the FIRST hop (closest to the sender). */
  receivedChain: ReceivedHop[];
  /** Authentication results parsed from Authentication-Results / DKIM-Signature / Received-SPF / DMARC. */
  authResults: AuthResult[];
  /** Total transit time across the chain in milliseconds (or undefined when timestamps are missing). */
  totalTransitMs?: number;
}

const HEADER_LINE = /^([!-9;-~]+):\s*(.*)$/;

export function unfoldHeaders(raw: string): Header[] {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const headers: Header[] = [];
  for (const line of lines) {
    if (line === "") break; // headers terminate at the first blank line
    if (/^[ \t]/.test(line)) {
      // Continuation of the previous header.
      if (headers.length === 0) continue;
      headers[headers.length - 1].value += " " + line.trim();
      continue;
    }
    const m = HEADER_LINE.exec(line);
    if (!m) continue;
    headers.push({ name: m[1].toLowerCase(), rawName: m[1], value: m[2].trim() });
  }
  return headers;
}

function lastOf(headers: Header[], name: string): Header | undefined {
  let last: Header | undefined;
  for (const h of headers) if (h.name === name) last = h;
  return last;
}

function allOf(headers: Header[], name: string): Header[] {
  return headers.filter((h) => h.name === name);
}

function parseReceived(value: string, index: number): ReceivedHop {
  const fromMatch = /\bfrom\s+([^\s;]+)/i.exec(value);
  const byMatch = /\bby\s+([^\s;]+)/i.exec(value);
  const withMatch = /\bwith\s+([^\s;]+)/i.exec(value);
  // Date is after the final semicolon.
  const dateMatch = /;\s*(.+)$/.exec(value);
  const date = dateMatch ? parseDateSafe(dateMatch[1].trim()) : undefined;
  return {
    raw: value,
    index,
    from: fromMatch?.[1],
    by: byMatch?.[1],
    with: withMatch?.[1],
    date,
  };
}

function parseDateSafe(s: string): Date | undefined {
  const d = new Date(s);
  return Number.isFinite(d.getTime()) ? d : undefined;
}

function parseAuthResults(value: string): AuthResult[] {
  // Authentication-Results: example.com; spf=pass smtp.mailfrom=…; dkim=pass header.d=…; dmarc=pass
  const results: AuthResult[] = [];
  // Strip the leading authserv-id (up to first ';')
  const parts = value.split(";").slice(1);
  for (const part of parts) {
    const tok = part.trim();
    const m = /^([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*([a-zA-Z]+)/.exec(tok);
    if (!m) continue;
    const verdict = m[2].toLowerCase() as AuthVerdict;
    const domainMatch = /(?:header\.d|smtp\.mailfrom|d|from)\s*=\s*([^\s;]+)/i.exec(tok);
    results.push({
      method: m[1].toLowerCase(),
      verdict: verdict,
      domain: domainMatch?.[1],
      raw: tok,
    });
  }
  return results;
}

function parseReceivedSpf(value: string): AuthResult {
  const verdict = (value.split(/\s+/)[0] ?? "none").toLowerCase() as AuthVerdict;
  const m = /\bmailfrom=([^\s;]+)/i.exec(value) ?? /\benvelope-from=<?([^\s;>]+)/i.exec(value);
  return { method: "spf", verdict, domain: m?.[1], raw: value };
}

function parseDkimSignature(value: string): AuthResult {
  // Tag-value list: v=1; a=rsa-sha256; d=example.com; s=2024; h=…
  const tags = value.split(";").map((t) => t.trim());
  const d = tags.find((t) => /^d=/i.test(t))?.split("=")[1];
  return { method: "dkim", verdict: "pass", domain: d, raw: value };
}

export function analyse(raw: string): EmailHeaderAnalysis {
  const headers = unfoldHeaders(raw);
  const subject = lastOf(headers, "subject")?.value;
  const from = lastOf(headers, "from")?.value;
  const to = lastOf(headers, "to")?.value;
  const cc = lastOf(headers, "cc")?.value;
  const bcc = lastOf(headers, "bcc")?.value;
  const dateRaw = lastOf(headers, "date")?.value;
  const date = dateRaw ? parseDateSafe(dateRaw) : undefined;
  const messageId = lastOf(headers, "message-id")?.value?.replace(/^<|>$/g, "");
  const replyTo = lastOf(headers, "reply-to")?.value;

  const received = allOf(headers, "received");
  // Received headers prepend at the top — the first one in the list is the LAST hop.
  // Reverse so index 0 = nearest sender.
  const receivedChain: ReceivedHop[] = [];
  const reversed = [...received].reverse();
  for (let i = 0; i < reversed.length; i++) {
    const hop = parseReceived(reversed[i].value, i);
    if (i > 0) {
      const prev = receivedChain[i - 1];
      if (prev?.date && hop.date) {
        hop.latencyMs = Math.max(0, hop.date.getTime() - prev.date.getTime());
      }
    }
    receivedChain.push(hop);
  }

  const authResults: AuthResult[] = [];
  for (const h of allOf(headers, "authentication-results")) {
    authResults.push(...parseAuthResults(h.value));
  }
  for (const h of allOf(headers, "received-spf")) {
    authResults.push(parseReceivedSpf(h.value));
  }
  for (const h of allOf(headers, "dkim-signature")) {
    authResults.push(parseDkimSignature(h.value));
  }
  for (const h of allOf(headers, "arc-authentication-results")) {
    authResults.push(...parseAuthResults(h.value).map((r) => ({ ...r, method: `arc-${r.method}` })));
  }

  // Total transit = last hop date - first hop date.
  let totalTransitMs: number | undefined;
  if (receivedChain.length > 1) {
    const first = receivedChain[0].date;
    const last = receivedChain[receivedChain.length - 1].date;
    if (first && last) totalTransitMs = Math.max(0, last.getTime() - first.getTime());
  }

  return {
    headers,
    subject,
    from,
    to,
    cc,
    bcc,
    date,
    messageId,
    replyTo,
    receivedChain,
    authResults,
    totalTransitMs,
  };
}

// ── Verdict helpers for the UI ────────────────────────────────────────────

export function verdictColor(v: AuthVerdict): "good" | "warn" | "bad" | "neutral" {
  if (v === "pass") return "good";
  if (v === "fail" || v === "permerror") return "bad";
  if (v === "softfail" || v === "temperror") return "warn";
  return "neutral";
}

export function methodLabel(m: string): string {
  if (m === "spf") return "SPF";
  if (m === "dkim") return "DKIM";
  if (m === "dmarc") return "DMARC";
  if (m === "arc") return "ARC";
  if (m.startsWith("arc-")) return `ARC ${m.slice(4).toUpperCase()}`;
  return m.toUpperCase();
}

export const SAMPLE_HEADERS = `Delivered-To: recipient@example.com
Received: by 2002:a17:90a:1d83 with SMTP id b3csp1234567890abc;
        Sat, 31 May 2026 14:30:05 +0000 (UTC)
Received: from smtp.toollyz.com (smtp.toollyz.com. [203.0.113.10])
        by mx.example.com with ESMTPS id l30si12345678fbn.123.2026.05.31.14.30.04
        for <recipient@example.com>
        (version=TLS1_3 cipher=TLS_AES_256_GCM_SHA384 bits=256/256);
        Sat, 31 May 2026 14:30:04 +0000 (UTC)
Received-SPF: pass (mx.example.com: domain of newsletter@toollyz.com designates 203.0.113.10 as permitted sender) client-ip=203.0.113.10;
Authentication-Results: mx.example.com;
       dkim=pass header.i=@toollyz.com header.s=mail header.b=AbCdEfGh;
       spf=pass (mx.example.com: domain of newsletter@toollyz.com designates 203.0.113.10 as permitted sender) smtp.mailfrom=newsletter@toollyz.com;
       dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=toollyz.com
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=toollyz.com; s=mail;
        h=Subject:From:To:Date:Message-ID; bh=hash; b=signature
Received: from app.toollyz.com (app.toollyz.com [203.0.113.5])
        by smtp.toollyz.com (Postfix) with ESMTP id A1B2C3D4E5
        for <recipient@example.com>; Sat, 31 May 2026 14:29:58 +0000 (UTC)
From: Toollyz Newsletter <newsletter@toollyz.com>
To: recipient@example.com
Subject: New tools shipped this week
Date: Sat, 31 May 2026 14:29:55 +0000
Message-ID: <abc123@toollyz.com>
List-Unsubscribe: <https://toollyz.com/unsub?u=xyz>`;
