// HS256 signature verification for the JWT Decoder, using the browser's Web
// Crypto (HMAC-SHA-256). The secret never leaves the browser. RS256/ES256
// verification needs the issuer's public key (a network fetch) and is therefore
// out of scope for this offline tool — those tokens are decode-only.

import { base64UrlToBytes, encodeUtf8 } from "@/lib/tools/shared/base64";

export interface VerifyResult {
  ok: boolean;
  error?: string;
}

/** Copy bytes into a fresh ArrayBuffer so Web Crypto accepts them as BufferSource. */
function buf(bytes: Uint8Array): ArrayBuffer {
  const out = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(out).set(bytes);
  return out;
}

export async function verifyHs256(token: string, secret: string): Promise<VerifyResult> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    return { ok: false, error: "Web Crypto is unavailable in this context." };
  }
  const parts = token.trim().split(".");
  if (parts.length !== 3) return { ok: false, error: "Not a valid JWT." };
  if (!secret) return { ok: false, error: "Enter the secret used to sign the token." };
  try {
    const data = buf(encodeUtf8(`${parts[0]}.${parts[1]}`));
    const sig = buf(base64UrlToBytes(parts[2]));
    const key = await crypto.subtle.importKey(
      "raw",
      buf(encodeUtf8(secret)),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const ok = await crypto.subtle.verify("HMAC", key, sig, data);
    return { ok };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Verification failed." };
  }
}
