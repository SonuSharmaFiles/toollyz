// Base converter. Bidirectional conversion between binary, octal, decimal
// and hexadecimal — with BigInt under the hood so 64-bit numbers, IPv6
// fragments, etc. round-trip without precision loss. Negatives use the
// minus-sign convention (we don't render two's-complement unless asked).

export type Base = 2 | 8 | 10 | 16;

export interface BaseMeta {
  base: Base;
  label: string;
  prefix: string;
  hint: string;
}

export const BASES: BaseMeta[] = [
  { base: 2, label: "Binary", prefix: "0b", hint: "Digits 0–1" },
  { base: 8, label: "Octal", prefix: "0o", hint: "Digits 0–7" },
  { base: 10, label: "Decimal", prefix: "", hint: "Digits 0–9" },
  { base: 16, label: "Hexadecimal", prefix: "0x", hint: "Digits 0–9, A–F" },
];

const PREFIX_RE = /^([+-]?)\s*(0x|0o|0b)?/i;

export interface ParseResult {
  ok: boolean;
  /** Parsed BigInt value; BigInt(0) on error. */
  value: bigint;
  /** Base detected (or chosen). */
  detectedBase: Base;
  error?: string;
}

function isValidForBase(digits: string, base: Base): boolean {
  if (base === 2) return /^[01]+$/.test(digits);
  if (base === 8) return /^[0-7]+$/.test(digits);
  if (base === 10) return /^\d+$/.test(digits);
  return /^[0-9a-fA-F]+$/.test(digits);
}

export function parseValue(input: string, hint?: Base): ParseResult {
  const cleaned = input.trim().replace(/[_,\s]/g, "");
  if (!cleaned) return { ok: false, value: BigInt(0), detectedBase: hint ?? 10, error: "Empty input." };

  const match = PREFIX_RE.exec(cleaned);
  const sign = match?.[1] === "-" ? BigInt(-1) : BigInt(1);
  const prefix = (match?.[2] ?? "").toLowerCase();
  const rest = cleaned.slice((match?.[0] ?? "").length);

  let base: Base = hint ?? 10;
  if (prefix === "0x") base = 16;
  else if (prefix === "0o") base = 8;
  else if (prefix === "0b") base = 2;
  else if (hint) base = hint;

  if (!isValidForBase(rest, base)) {
    return { ok: false, value: BigInt(0), detectedBase: base, error: `Not a valid base-${base} number.` };
  }
  try {
    const value = BigInt(`${prefix === "0x" ? "0x" : prefix === "0o" ? "0o" : prefix === "0b" ? "0b" : ""}${rest}`);
    return { ok: true, value: sign * value, detectedBase: base };
  } catch (e) {
    return { ok: false, value: BigInt(0), detectedBase: base, error: e instanceof Error ? e.message : "Parse error." };
  }
}

export function toBase(value: bigint, base: Base, options: { uppercase: boolean; group: boolean }): string {
  const sign = value < BigInt(0) ? "-" : "";
  const abs = value < BigInt(0) ? -value : value;
  let str = abs.toString(base);
  if (options.uppercase && base === 16) str = str.toUpperCase();
  if (options.group) str = groupDigits(str, base);
  return `${sign}${str}`;
}

function groupDigits(digits: string, base: Base): string {
  const size = base === 2 ? 4 : base === 8 ? 3 : base === 10 ? 3 : 2;
  const out: string[] = [];
  for (let i = digits.length; i > 0; i -= size) {
    out.unshift(digits.slice(Math.max(0, i - size), i));
  }
  return out.join(" ");
}

export interface ConvertResult {
  ok: boolean;
  binary: string;
  octal: string;
  decimal: string;
  hex: string;
  /** Number of bits required to hold the absolute value. */
  bitLength: number;
  /** Whether the value fits in a 32-bit unsigned int. */
  fitsU32: boolean;
  /** Whether the value fits in a 64-bit signed int. */
  fitsI64: boolean;
  error?: string;
}

export function convertAll(value: bigint, options: { uppercase: boolean; group: boolean } = { uppercase: true, group: false }): ConvertResult {
  const abs = value < BigInt(0) ? -value : value;
  const bitLength = abs === BigInt(0) ? 0 : abs.toString(2).length;
  const fitsU32 = value >= BigInt(0) && value < BigInt(1) << BigInt(32);
  const I64_MAX = (BigInt(1) << BigInt(63)) - BigInt(1);
  const I64_MIN = -(BigInt(1) << BigInt(63));
  const fitsI64 = value >= I64_MIN && value <= I64_MAX;
  return {
    ok: true,
    binary: toBase(value, 2, options),
    octal: toBase(value, 8, options),
    decimal: toBase(value, 10, options),
    hex: toBase(value, 16, options),
    bitLength,
    fitsU32,
    fitsI64,
  };
}

/** Step-by-step decimal → target-base conversion for educational display. */
export interface ConversionStep {
  quotient: bigint;
  divisor: bigint;
  remainder: bigint;
}

export function decimalToBaseSteps(value: bigint, base: Base): ConversionStep[] {
  if (base === 10) return [];
  const steps: ConversionStep[] = [];
  let current = value < BigInt(0) ? -value : value;
  const divisor = BigInt(base);
  if (current === BigInt(0)) return [{ quotient: BigInt(0), divisor, remainder: BigInt(0) }];
  while (current > BigInt(0)) {
    steps.push({ quotient: current / divisor, divisor, remainder: current % divisor });
    current = current / divisor;
    if (steps.length > 200) break; // safety
  }
  return steps;
}
