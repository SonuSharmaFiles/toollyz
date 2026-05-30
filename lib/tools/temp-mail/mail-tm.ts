// Toollyz Temporary Email Generator client for the public mail.tm API.
// We are explicit in the UI that this is a third-party service — Toollyz
// has no backend; your browser talks to mail.tm directly.
//
// Reference: https://docs.mail.tm/

import { fetchWithTimeout } from "@/lib/tools/shared/net";

export interface MailDomain {
  id: string;
  domain: string;
  isActive: boolean;
}

export interface MailAccount {
  id: string;
  address: string;
  password: string;
  token: string;
  createdAt: string;
}

export interface MailMessage {
  id: string;
  fromName: string;
  fromAddress: string;
  subject: string;
  intro: string;
  seen: boolean;
  createdAt: string;
  size: number;
}

export interface MailMessageDetail extends MailMessage {
  /** Plain-text body (often empty if the email is HTML-only). */
  text: string;
  /** HTML body fragments (mail.tm returns an array). */
  html: string[];
  /** Recipient list. */
  to: { name: string; address: string }[];
}

const BASE = "https://api.mail.tm";

interface ApiResponse<T> { ok: true; data: T }
interface ApiError { ok: false; error: string }
type ApiResult<T> = ApiResponse<T> | ApiError;

async function api<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const res = await fetchWithTimeout(`${BASE}${path}`, {
    timeoutMs: 12000,
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!res.ok) return { ok: false, error: res.kind === "timeout" ? "mail.tm timed out." : "Couldn't reach mail.tm." };
  if (!res.response.ok) {
    const text = await res.response.text();
    return { ok: false, error: `mail.tm error (${res.response.status}): ${text.slice(0, 140)}` };
  }
  try {
    const data = (await res.response.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, error: "mail.tm returned an unparseable response." };
  }
}

export async function listDomains(): Promise<ApiResult<MailDomain[]>> {
  const r = await api<{ "hydra:member"?: MailDomain[] } | MailDomain[]>("/domains");
  if (!r.ok) return r;
  const arr = Array.isArray(r.data) ? r.data : r.data["hydra:member"] ?? [];
  return { ok: true, data: arr.filter((d) => d.isActive) };
}

interface CreatedAccount { id: string; address: string }
interface TokenResponse { token: string; id: string }

export async function createAccount(address: string, password: string): Promise<ApiResult<MailAccount>> {
  const create = await api<CreatedAccount>("/accounts", {
    method: "POST",
    body: JSON.stringify({ address, password }),
  });
  if (!create.ok) return create;
  const token = await api<TokenResponse>("/token", {
    method: "POST",
    body: JSON.stringify({ address, password }),
  });
  if (!token.ok) return token;
  return {
    ok: true,
    data: {
      id: create.data.id,
      address,
      password,
      token: token.data.token,
      createdAt: new Date().toISOString(),
    },
  };
}

interface MessagesResponse {
  "hydra:member"?: MailMessage[];
}

interface RawMessage {
  id: string;
  from: { name: string; address: string };
  subject: string;
  intro: string;
  seen: boolean;
  createdAt: string;
  size: number;
}

export async function listMessages(token: string): Promise<ApiResult<MailMessage[]>> {
  const r = await api<MessagesResponse | RawMessage[]>("/messages", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return r;
  const raw = Array.isArray(r.data) ? r.data : r.data["hydra:member"] ?? [];
  const messages: MailMessage[] = (raw as RawMessage[]).map((m) => ({
    id: m.id,
    fromName: m.from.name,
    fromAddress: m.from.address,
    subject: m.subject,
    intro: m.intro,
    seen: m.seen,
    createdAt: m.createdAt,
    size: m.size,
  }));
  return { ok: true, data: messages };
}

interface RawMessageDetail extends RawMessage {
  text: string;
  html: string[];
  to: { name: string; address: string }[];
}

export async function getMessage(token: string, id: string): Promise<ApiResult<MailMessageDetail>> {
  const r = await api<RawMessageDetail>(`/messages/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return r;
  const m = r.data;
  return {
    ok: true,
    data: {
      id: m.id,
      fromName: m.from.name,
      fromAddress: m.from.address,
      subject: m.subject,
      intro: m.intro,
      seen: m.seen,
      createdAt: m.createdAt,
      size: m.size,
      text: m.text ?? "",
      html: Array.isArray(m.html) ? m.html : m.html ? [String(m.html)] : [],
      to: m.to ?? [],
    },
  };
}

function rand(bytes: number): Uint8Array {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    throw new Error("crypto.getRandomValues unavailable.");
  }
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return buf;
}

const USERNAME_WORDS = [
  "amber", "spruce", "cedar", "willow", "harbor", "ember", "echo", "lyra", "nova", "fern",
  "rio", "vesper", "atlas", "linden", "wren", "kestrel", "marlow", "noor", "pixel", "quill",
];

export function randomAddress(domain: string): string {
  const word = USERNAME_WORDS[rand(1)[0] % USERNAME_WORDS.length];
  const digits = Array.from(rand(4))
    .map((b) => b % 10)
    .join("");
  return `${word}-${digits}@${domain}`;
}

export function randomPassword(): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$";
  const buf = rand(20);
  let out = "";
  for (const b of buf) out += alphabet[b % alphabet.length];
  return out;
}
