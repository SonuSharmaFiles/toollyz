import { PASSPHRASE_WORDS } from "./words";

export type PasswordMode =
  | "random"
  | "memorable"
  | "passphrase"
  | "pin"
  | "wifi"
  | "api-key";

export interface GenerateOptions {
  mode: PasswordMode;
  count: number;
  // Random / Memorable / WiFi
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  avoidRepeats: boolean;
  avoidSequential: boolean;
  // Passphrase
  wordCount: number;
  separator: "-" | "." | "_" | " ";
  capitalizeWords: boolean;
  appendNumber: boolean;
  // PIN
  pinLength: number;
  // API key
  apiKeyPrefix: string;
  apiKeyLength: number;
}

// ─── Character pools ──────────────────────────────────────────────────────
const POOLS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>/?~",
  // similar-looking characters to optionally exclude
  similar: "il1Lo0O",
  // ambiguous (browser/font confusion)
  ambiguous: "{}[]()/\\'\"`~,;:.<>",
} as const;

const HEX = "0123456789abcdef";

// ─── Cryptographically secure random helpers ──────────────────────────────
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

function pick<T>(arr: ArrayLike<T>): T {
  return arr[secureRandomInt(arr.length)];
}

function pickChar(pool: string): string {
  return pool.charAt(secureRandomInt(pool.length));
}

// ─── Pool builder ─────────────────────────────────────────────────────────
function buildPool(opts: GenerateOptions): { pool: string; classes: string[] } {
  const classes: string[] = [];
  let pool = "";
  if (opts.lowercase) {
    pool += POOLS.lowercase;
    classes.push(POOLS.lowercase);
  }
  if (opts.uppercase) {
    pool += POOLS.uppercase;
    classes.push(POOLS.uppercase);
  }
  if (opts.numbers) {
    pool += POOLS.numbers;
    classes.push(POOLS.numbers);
  }
  if (opts.symbols) {
    pool += POOLS.symbols;
    classes.push(POOLS.symbols);
  }
  if (opts.excludeSimilar) {
    const excluded = new Set([...POOLS.similar]);
    pool = [...pool].filter((c) => !excluded.has(c)).join("");
  }
  if (opts.excludeAmbiguous) {
    const excluded = new Set([...POOLS.ambiguous]);
    pool = [...pool].filter((c) => !excluded.has(c)).join("");
  }
  return { pool, classes };
}

function violatesRepeats(buf: string, next: string): boolean {
  return buf.length > 0 && buf[buf.length - 1] === next;
}

function violatesSequence(buf: string, next: string): boolean {
  if (buf.length < 2) return false;
  const a = buf.charCodeAt(buf.length - 2);
  const b = buf.charCodeAt(buf.length - 1);
  const c = next.charCodeAt(0);
  return (c === b + 1 && b === a + 1) || (c === b - 1 && b === a - 1);
}

// ─── Mode generators ──────────────────────────────────────────────────────
function generateRandom(opts: GenerateOptions): string {
  const { pool, classes } = buildPool(opts);
  if (!pool) return "";

  let out = "";
  let safety = 0;
  while (out.length < opts.length && safety < opts.length * 20) {
    safety++;
    const next = pickChar(pool);
    if (opts.avoidRepeats && violatesRepeats(out, next)) continue;
    if (opts.avoidSequential && violatesSequence(out, next)) continue;
    out += next;
  }
  if (out.length < opts.length) {
    // fill remainder ignoring filters
    while (out.length < opts.length) out += pickChar(pool);
  }

  // Ensure at least one of each selected class
  const chars = out.split("");
  classes.forEach((cls, i) => {
    if (!chars.some((c) => cls.includes(c))) {
      const idx = (i * 7 + chars.length / 2) % chars.length;
      chars[Math.floor(idx)] = pickChar(cls);
    }
  });

  // Shuffle once to randomize injected positions
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

const CONSONANTS = "bcdfghjklmnprstvwz";
const VOWELS = "aeiouy";

function generateMemorable(opts: GenerateOptions): string {
  const length = opts.length;
  const chars: string[] = [];
  let nextVowel = secureRandomInt(2) === 0;
  for (let i = 0; i < length; i++) {
    let c = nextVowel ? pickChar(VOWELS) : pickChar(CONSONANTS);
    // Insert numbers/symbols at fixed offsets if enabled
    if (opts.numbers && i > 0 && (i + 1) % 6 === 0) c = pickChar(POOLS.numbers);
    else if (opts.symbols && i > 0 && (i + 1) % 8 === 0) c = pickChar("-_.");
    chars.push(c);
    nextVowel = !nextVowel;
  }
  let out = chars.join("");
  if (opts.uppercase) {
    out = out.charAt(0).toUpperCase() + out.slice(1);
  }
  return out;
}

function generatePassphrase(opts: GenerateOptions): string {
  const parts: string[] = [];
  for (let i = 0; i < opts.wordCount; i++) {
    let w = pick(PASSPHRASE_WORDS);
    if (opts.capitalizeWords) w = w.charAt(0).toUpperCase() + w.slice(1);
    parts.push(w);
  }
  let out = parts.join(opts.separator);
  if (opts.appendNumber) out += String(secureRandomInt(900) + 100);
  return out;
}

function generatePin(opts: GenerateOptions): string {
  let out = "";
  for (let i = 0; i < opts.pinLength; i++) {
    let d = pickChar(POOLS.numbers);
    if (opts.avoidSequential && violatesSequence(out, d)) {
      // try once more
      d = pickChar(POOLS.numbers);
    }
    if (opts.avoidRepeats && violatesRepeats(out, d)) {
      d = pickChar(POOLS.numbers);
    }
    out += d;
  }
  // Reject obvious patterns
  if (/(\d)\1{2,}/.test(out)) return generatePin(opts);
  return out;
}

function generateWifi(opts: GenerateOptions): string {
  // WiFi password: long, no ambiguous, easy to type
  return generateRandom({
    ...opts,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
    excludeSimilar: true,
    excludeAmbiguous: true,
    length: Math.max(opts.length, 16),
  });
}

function generateApiKey(opts: GenerateOptions): string {
  let body = "";
  for (let i = 0; i < opts.apiKeyLength; i++) {
    body += pickChar(HEX);
  }
  return opts.apiKeyPrefix ? `${opts.apiKeyPrefix}${body}` : body;
}

export function generatePasswords(opts: GenerateOptions): string[] {
  const out: string[] = [];
  for (let i = 0; i < opts.count; i++) {
    let p = "";
    switch (opts.mode) {
      case "random":
        p = generateRandom(opts);
        break;
      case "memorable":
        p = generateMemorable(opts);
        break;
      case "passphrase":
        p = generatePassphrase(opts);
        break;
      case "pin":
        p = generatePin(opts);
        break;
      case "wifi":
        p = generateWifi(opts);
        break;
      case "api-key":
        p = generateApiKey(opts);
        break;
    }
    if (p) out.push(p);
  }
  return out;
}

// ─── Strength analysis ────────────────────────────────────────────────────

export type StrengthLabel =
  | "Very weak"
  | "Weak"
  | "Fair"
  | "Strong"
  | "Very strong"
  | "Excellent";

export interface Strength {
  label: StrengthLabel;
  score: number; // 0..5
  percent: number; // 0..100
  entropy: number; // bits
  poolSize: number;
  crackTime: string;
  color: string;
}

const GUESSES_PER_SECOND = 1e11; // modern offline GPU rig

function detectPoolSize(password: string): number {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/\d/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 32;
  return Math.max(size, 1);
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return "instantly";
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [365, "day"],
    [1000, "year"],
    [1000, "thousand years"],
    [1000, "million years"],
    [1000, "billion years"],
  ];
  let value = seconds;
  let label = "seconds";
  for (let i = 0; i < units.length; i++) {
    const [factor, name] = units[i];
    if (value < factor) {
      label = name + (value === 1 ? "" : i < 4 ? "s" : "");
      break;
    }
    value = value / factor;
    label = units[i + 1] ? units[i + 1][1] : name;
  }
  if (value > 1e6) return "centuries";
  return `${Math.round(value).toLocaleString()} ${label}`;
}

export function analyzePassword(password: string): Strength {
  if (!password) {
    return {
      label: "Very weak",
      score: 0,
      percent: 0,
      entropy: 0,
      poolSize: 0,
      crackTime: "instantly",
      color: "#ef4444",
    };
  }
  const poolSize = detectPoolSize(password);
  const entropy = password.length * Math.log2(poolSize);
  const guesses = Math.pow(2, entropy);
  const seconds = guesses / GUESSES_PER_SECOND;

  // Score thresholds
  let label: StrengthLabel = "Very weak";
  let score = 0;
  let color = "#ef4444";
  if (entropy >= 128) {
    label = "Excellent";
    score = 5;
    color = "#10b981";
  } else if (entropy >= 90) {
    label = "Very strong";
    score = 4;
    color = "#22c55e";
  } else if (entropy >= 65) {
    label = "Strong";
    score = 3;
    color = "#84cc16";
  } else if (entropy >= 45) {
    label = "Fair";
    score = 2;
    color = "#f59e0b";
  } else if (entropy >= 28) {
    label = "Weak";
    score = 1;
    color = "#f97316";
  }

  const percent = Math.min(100, Math.round((entropy / 128) * 100));
  return {
    label,
    score,
    percent,
    entropy: Math.round(entropy),
    poolSize,
    crackTime: formatTime(seconds),
    color,
  };
}

// ─── Export helpers ───────────────────────────────────────────────────────
export function toTxt(passwords: string[]): string {
  return passwords.join("\n");
}

export function toCsv(passwords: string[]): string {
  const escape = (s: string) =>
    /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  const rows = passwords.map((p) => {
    const s = analyzePassword(p);
    return [escape(p), p.length, s.entropy, s.label].join(",");
  });
  return ["password,length,entropy,strength", ...rows].join("\n");
}
