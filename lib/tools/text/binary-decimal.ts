// Binary ↔ Decimal focused engine. Re-uses BigInt under the hood (via the
// base-convert engine pattern) but adds two things the hex converter
// doesn't: a per-bit position table for educational use, and IEEE 754
// (single + double precision) float decoding for engineers debugging
// binary representations of floats.

const SIGN = (v: bigint): "+" | "-" => (v < BigInt(0) ? "-" : "+");

export interface ParseBinaryResult {
  ok: boolean;
  value: bigint;
  /** Per-bit table from MSB to LSB. */
  bits: { position: number; bit: 0 | 1; value: bigint }[];
  /** Number of bits in the absolute value. */
  bitLength: number;
  error?: string;
}

function cleanBinary(input: string): { sign: "+" | "-"; digits: string } | null {
  let s = input.trim().replace(/[_,\s]/g, "");
  if (!s) return null;
  let sign: "+" | "-" = "+";
  if (s.startsWith("-")) {
    sign = "-";
    s = s.slice(1);
  } else if (s.startsWith("+")) {
    s = s.slice(1);
  }
  s = s.replace(/^0b/i, "");
  if (!/^[01]+$/.test(s)) return null;
  return { sign, digits: s };
}

export function parseBinary(input: string): ParseBinaryResult {
  const cleaned = cleanBinary(input);
  if (!cleaned) {
    return { ok: false, value: BigInt(0), bits: [], bitLength: 0, error: "Not a valid binary number — use only 0s and 1s (optional 0b prefix)." };
  }
  let value = BigInt(0);
  for (const ch of cleaned.digits) value = value * BigInt(2) + BigInt(ch === "1" ? 1 : 0);
  if (cleaned.sign === "-") value = -value;
  const abs = value < BigInt(0) ? -value : value;
  const length = abs === BigInt(0) ? 1 : abs.toString(2).length;
  const bits: ParseBinaryResult["bits"] = [];
  let pos = length - 1;
  for (const ch of (abs === BigInt(0) ? "0" : abs.toString(2))) {
    const bit: 0 | 1 = ch === "1" ? 1 : 0;
    bits.push({
      position: pos,
      bit,
      value: bit === 1 ? BigInt(1) << BigInt(pos) : BigInt(0),
    });
    pos--;
  }
  return { ok: true, value, bits, bitLength: length };
}

// ── IEEE 754 decoding ──────────────────────────────────────────────────────

export interface FloatDecode {
  /** 32 or 64 — width of the decoded float. */
  width: 32 | 64;
  /** Sign bit. */
  sign: 0 | 1;
  /** Biased exponent. */
  exponentRaw: number;
  /** Effective exponent (raw - bias). */
  exponent: number;
  /** Mantissa bits (after the implicit leading 1 for normal values). */
  mantissa: string;
  /** Decoded floating point value. */
  value: number;
  /** Special classification. */
  classification: "zero" | "subnormal" | "normal" | "infinity" | "nan";
}

const EXPONENT_BITS = { 32: 8, 64: 11 } as const;
const MANTISSA_BITS = { 32: 23, 64: 52 } as const;
const BIAS = { 32: 127, 64: 1023 } as const;

export function decodeIeee754(bits: string, width: 32 | 64): FloatDecode | null {
  if (bits.length !== width) return null;
  if (!/^[01]+$/.test(bits)) return null;
  const sign = bits[0] === "1" ? 1 : 0;
  const expBits = bits.slice(1, 1 + EXPONENT_BITS[width]);
  const mantBits = bits.slice(1 + EXPONENT_BITS[width]);
  const exponentRaw = parseInt(expBits, 2);
  const exponent = exponentRaw - BIAS[width];

  let classification: FloatDecode["classification"];
  let value: number;

  if (exponentRaw === 0) {
    if (/^0+$/.test(mantBits)) {
      classification = "zero";
      value = sign === 1 ? -0 : 0;
    } else {
      classification = "subnormal";
      let mantissa = 0;
      for (let i = 0; i < mantBits.length; i++) {
        if (mantBits[i] === "1") mantissa += Math.pow(2, -(i + 1));
      }
      value = mantissa * Math.pow(2, 1 - BIAS[width]);
      if (sign === 1) value = -value;
    }
  } else if (exponentRaw === Math.pow(2, EXPONENT_BITS[width]) - 1) {
    if (/^0+$/.test(mantBits)) {
      classification = "infinity";
      value = sign === 1 ? -Infinity : Infinity;
    } else {
      classification = "nan";
      value = NaN;
    }
  } else {
    classification = "normal";
    let mantissa = 1;
    for (let i = 0; i < mantBits.length; i++) {
      if (mantBits[i] === "1") mantissa += Math.pow(2, -(i + 1));
    }
    value = mantissa * Math.pow(2, exponent);
    if (sign === 1) value = -value;
  }

  return {
    width,
    sign: sign as 0 | 1,
    exponentRaw,
    exponent,
    mantissa: mantBits,
    value,
    classification,
  };
}

export interface DecimalSummary {
  /** Decimal representation (or "NaN"/"Infinity"). */
  decimal: string;
  /** Signed magnitude. */
  signedMagnitude: string;
  /** Bit length. */
  bitLength: number;
  /** Power-of-two breakdown — sum of 2^n for each set bit. */
  breakdown: string;
}

export function decimalSummary(value: bigint, bits: ParseBinaryResult["bits"]): DecimalSummary {
  const decimal = value.toString();
  const abs = value < BigInt(0) ? -value : value;
  const setBits = bits.filter((b) => b.bit === 1);
  const breakdown = setBits.length === 0
    ? "0"
    : setBits.map((b) => `2^${b.position}`).join(" + ") +
      " = " +
      setBits.map((b) => b.value.toString()).join(" + ");
  return {
    decimal,
    signedMagnitude: `${SIGN(value)}${abs.toString(2)}`,
    bitLength: bits.length,
    breakdown,
  };
}

export const BINARY_PRESETS = [
  { label: "8-bit (255)", value: "11111111" },
  { label: "16-bit (65535)", value: "1111111111111111" },
  { label: "32-bit unsigned max", value: "11111111111111111111111111111111" },
  { label: "ASCII 'A' (65)", value: "01000001" },
  { label: "Negative 42", value: "-101010" },
  { label: "IEEE float π (32-bit)", value: "01000000010010010000111111011011" },
  { label: "IEEE double e (64-bit)", value: "0100000000000101101111110000101010001011000101000101011101101001" },
];
