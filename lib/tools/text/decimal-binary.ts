// Decimal → Binary focused engine. Step-by-step division-by-2 display
// for educational use, plus IEEE 754 encoding (single + double precision)
// for engineers debugging float representations.

import { parseBinary } from "./binary-decimal";

export interface ParseDecimalResult {
  ok: boolean;
  value: bigint;
  /** True if the input had a fractional part — we keep as a float for IEEE encoding. */
  hasFractional: boolean;
  floatValue?: number;
  error?: string;
}

export function parseDecimal(input: string): ParseDecimalResult {
  const cleaned = input.trim().replace(/[_,\s]/g, "");
  if (!cleaned) return { ok: false, value: BigInt(0), hasFractional: false, error: "Empty input." };
  if (/^-?\d+$/.test(cleaned)) {
    try {
      return { ok: true, value: BigInt(cleaned), hasFractional: false };
    } catch {
      return { ok: false, value: BigInt(0), hasFractional: false, error: "Could not parse integer." };
    }
  }
  if (/^-?\d+\.\d+([eE][+-]?\d+)?$/.test(cleaned) || /^-?\d+[eE][+-]?\d+$/.test(cleaned)) {
    const n = parseFloat(cleaned);
    if (!Number.isFinite(n)) return { ok: false, value: BigInt(0), hasFractional: true, error: "Not a finite number." };
    return { ok: true, value: BigInt(Math.trunc(n)), hasFractional: true, floatValue: n };
  }
  return { ok: false, value: BigInt(0), hasFractional: false, error: "Not a valid decimal number." };
}

export interface DivisionStep {
  step: number;
  dividend: bigint;
  quotient: bigint;
  remainder: 0 | 1;
}

export function divisionSteps(value: bigint): DivisionStep[] {
  const abs = value < BigInt(0) ? -value : value;
  const steps: DivisionStep[] = [];
  let current = abs;
  let i = 1;
  if (current === BigInt(0)) {
    return [{ step: 1, dividend: BigInt(0), quotient: BigInt(0), remainder: 0 }];
  }
  while (current > BigInt(0)) {
    const remainder: 0 | 1 = current % BigInt(2) === BigInt(1) ? 1 : 0;
    const quotient = current / BigInt(2);
    steps.push({ step: i++, dividend: current, quotient, remainder });
    current = quotient;
    if (steps.length > 1024) break;
  }
  return steps;
}

export function toBinary(value: bigint, options: { group: boolean }): string {
  const sign = value < BigInt(0) ? "-" : "";
  const abs = value < BigInt(0) ? -value : value;
  let s = abs.toString(2);
  if (options.group) s = groupBy(s, 4);
  return sign + s;
}

function groupBy(s: string, n: number): string {
  const out: string[] = [];
  for (let i = s.length; i > 0; i -= n) {
    out.unshift(s.slice(Math.max(0, i - n), i));
  }
  return out.join(" ");
}

// ── IEEE 754 encoding ──────────────────────────────────────────────────────

export interface FloatEncode {
  width: 32 | 64;
  /** 32 or 64 bits representing the float (MSB first). */
  bits: string;
  /** Hex representation of the bits. */
  hex: string;
  sign: 0 | 1;
  exponentRaw: number;
  exponent: number;
  mantissa: string;
  classification: "zero" | "subnormal" | "normal" | "infinity" | "nan";
}

export function encodeIeee754(value: number, width: 32 | 64): FloatEncode | null {
  if (typeof value !== "number") return null;
  const buf = new ArrayBuffer(width === 32 ? 4 : 8);
  const view = new DataView(buf);
  if (width === 32) view.setFloat32(0, value, false);
  else view.setFloat64(0, value, false);
  let bits = "";
  for (let i = 0; i < (width === 32 ? 4 : 8); i++) {
    bits += view.getUint8(i).toString(2).padStart(8, "0");
  }
  const sign: 0 | 1 = bits[0] === "1" ? 1 : 0;
  const expBits = width === 32 ? 8 : 11;
  const bias = width === 32 ? 127 : 1023;
  const exponentRaw = parseInt(bits.slice(1, 1 + expBits), 2);
  const exponent = exponentRaw - bias;
  const mantissa = bits.slice(1 + expBits);
  let classification: FloatEncode["classification"];
  if (Number.isNaN(value)) classification = "nan";
  else if (value === Infinity || value === -Infinity) classification = "infinity";
  else if (value === 0) classification = "zero";
  else if (exponentRaw === 0) classification = "subnormal";
  else classification = "normal";

  const hex = ("0".repeat(width / 4) + BigInt("0b" + bits).toString(16)).slice(-(width / 4));
  return {
    width,
    bits,
    hex: "0x" + hex.toUpperCase(),
    sign,
    exponentRaw,
    exponent,
    mantissa,
    classification,
  };
}

// ── Place-value table (re-uses parseBinary's bit table) ─────────────────────

export function placeValueTable(value: bigint) {
  const sign = value < BigInt(0) ? "-" : "";
  const abs = value < BigInt(0) ? -value : value;
  const bin = abs.toString(2);
  return parseBinary(sign + bin).bits;
}

export const DECIMAL_PRESETS = [
  { label: "255 (8-bit max)", value: "255" },
  { label: "65535 (16-bit max)", value: "65535" },
  { label: "2,147,483,647 (i32 max)", value: "2147483647" },
  { label: "ASCII 'A' (65)", value: "65" },
  { label: "PI (3.14159)", value: "3.14159" },
  { label: "Euler's e", value: "2.71828" },
];
