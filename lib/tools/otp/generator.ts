export type OtpType =
  | "numeric"
  | "alphanumeric"
  | "hex"
  | "pin"
  | "verification"
  | "backup";

export interface GenerateOptions {
  type: OtpType;
  length: number;
  count: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  avoidRepeats: boolean;
}

const POOLS = {
  lowercase: "abcdefghijkmnopqrstuvwxyz", // no l
  uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ", // no I, O
  numbers: "23456789", // no 0, 1 (ambiguous-safe)
  numbersFull: "0123456789",
  symbols: "!@#$%^&*",
  hex: "0123456789ABCDEF",
  ambiguous: "0OIl1Lo",
} as const;

// Cryptographically secure random int with rejection sampling
function secureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let v: number;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % max;
}

function pickChar(pool: string): string {
  return pool.charAt(secureRandomInt(pool.length));
}

function buildPool(opts: GenerateOptions): string {
  // For typed presets, override the pool
  switch (opts.type) {
    case "numeric":
    case "pin":
      return opts.excludeAmbiguous ? POOLS.numbers : POOLS.numbersFull;
    case "hex":
      return POOLS.hex;
    case "verification":
      return (
        (opts.excludeAmbiguous ? POOLS.uppercase : "ABCDEFGHIJKLMNOPQRSTUVWXYZ") +
        (opts.excludeAmbiguous ? POOLS.numbers : POOLS.numbersFull)
      );
    case "backup":
      return (
        (opts.excludeAmbiguous ? POOLS.uppercase : "ABCDEFGHIJKLMNOPQRSTUVWXYZ") +
        (opts.excludeAmbiguous ? POOLS.numbers : POOLS.numbersFull)
      );
    case "alphanumeric": {
      let pool = "";
      if (opts.lowercase)
        pool += opts.excludeAmbiguous ? POOLS.lowercase : "abcdefghijklmnopqrstuvwxyz";
      if (opts.uppercase)
        pool += opts.excludeAmbiguous ? POOLS.uppercase : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (opts.numbers) pool += opts.excludeAmbiguous ? POOLS.numbers : POOLS.numbersFull;
      if (opts.symbols) pool += POOLS.symbols;
      if (!pool) pool = POOLS.numbersFull;
      return pool;
    }
  }
}

export function generateOne(opts: GenerateOptions): string {
  const pool = buildPool(opts);
  if (!pool) return "";

  // Backup codes have a hyphen group format: xxxx-xxxx
  if (opts.type === "backup") {
    const groupSize = 4;
    const groups = Math.max(2, Math.ceil(opts.length / groupSize));
    const parts: string[] = [];
    for (let g = 0; g < groups; g++) {
      let chunk = "";
      for (let i = 0; i < groupSize; i++) chunk += pickChar(pool);
      parts.push(chunk);
    }
    return parts.join("-");
  }

  let out = "";
  let safety = 0;
  while (out.length < opts.length && safety < opts.length * 20) {
    safety++;
    const next = pickChar(pool);
    if (opts.avoidRepeats && out && out[out.length - 1] === next) continue;
    out += next;
  }
  while (out.length < opts.length) out += pickChar(pool);
  return out;
}

export function generateBatch(opts: GenerateOptions): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  let safety = 0;
  while (out.length < opts.count && safety < opts.count * 10) {
    safety++;
    const code = generateOne(opts);
    if (!seen.has(code)) {
      seen.add(code);
      out.push(code);
    }
  }
  // If we couldn't dedupe (small pool, e.g. 4-digit PIN), allow duplicates
  while (out.length < opts.count) out.push(generateOne(opts));
  return out;
}

// ─── Format helpers ───────────────────────────────────────────────────────
export function formatOtp(code: string, type: OtpType): string {
  if (type === "backup") return code; // already grouped
  // Insert a thin space every 3-4 chars for readability on longer codes
  if (code.length >= 8) {
    const chunk = code.length % 4 === 0 ? 4 : 3;
    return code.match(new RegExp(`.{1,${chunk}}`, "g"))?.join(" ") ?? code;
  }
  return code;
}

// ─── Exporters ────────────────────────────────────────────────────────────
export function toTxt(codes: string[]): string {
  return codes.join("\n");
}

export function toCsv(codes: string[], type: OtpType): string {
  const rows = codes.map((c) => `${c},${c.replace(/-/g, "").length},${type}`);
  return ["code,length,type", ...rows].join("\n");
}

export function toJson(codes: string[], type: OtpType): string {
  return JSON.stringify(
    codes.map((code) => ({ code, length: code.replace(/-/g, "").length, type })),
    null,
    2,
  );
}
