// Roman numeral converter. Supports the standard 1-3,999 range plus the
// classical vinculum (overline) extension that pushes the ceiling to
// 3,999,999: M̄ = 1,000 × 1,000 = 1,000,000. We render the overlines using
// the U+0305 combining macron so the output is plain Unicode (no SVG).
//
// Conversion is bidirectional and validated — the parser rejects invalid
// patterns like "IIII", "VV" or wrong subtractive pairs ("IC", "XM").

const VALUES: Array<[number, string]> = [
  [1_000_000, "M̄"],
  [900_000, "C̄M̄"],
  [500_000, "D̄"],
  [400_000, "C̄D̄"],
  [100_000, "C̄"],
  [90_000, "X̄C̄"],
  [50_000, "L̄"],
  [40_000, "X̄L̄"],
  [10_000, "X̄"],
  [9_000, "ĪX̄"],
  [5_000, "V̄"],
  [4_000, "ĪV̄"],
  [1_000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export const ROMAN_MIN = 1;
export const ROMAN_MAX = 3_999_999;

export interface ToRomanResult {
  ok: boolean;
  /** Roman numeral with combining macron overlines for ≥ 4000. */
  roman: string;
  /** Same value without overlines (useful for ≤ 3999). */
  plainRoman?: string;
  /** When the input is 4000-3,999,999, also a fallback Mn notation (e.g. M_X = 10 000 × M). */
  notes: string[];
  error?: string;
}

export function intToRoman(n: number): ToRomanResult {
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { ok: false, roman: "", notes: [], error: "Enter an integer." };
  }
  if (n < ROMAN_MIN || n > ROMAN_MAX) {
    return {
      ok: false,
      roman: "",
      notes: [],
      error: `Out of range — supports ${ROMAN_MIN.toLocaleString()} to ${ROMAN_MAX.toLocaleString()}.`,
    };
  }
  let remaining = n;
  let roman = "";
  for (const [val, sym] of VALUES) {
    while (remaining >= val) {
      roman += sym;
      remaining -= val;
    }
  }
  const notes: string[] = [];
  let plainRoman: string | undefined;
  if (n <= 3999) {
    plainRoman = roman;
  } else {
    notes.push("Numbers above 3 999 use the classical vinculum (overline) — each overlined letter is multiplied by 1 000.");
  }
  return { ok: true, roman, plainRoman, notes };
}

// ─── Parser ───────────────────────────────────────────────────────────────
// Strict — rejects invalid repetitions (IIII, VV, LL, DD) and disallowed
// subtractive pairs (IL, IC, VX, …).

const SYMBOL_VALUE: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

const VALID_SUBTRACT = new Set(["IV", "IX", "XL", "XC", "CD", "CM"]);

function parsePlain(s: string): number | null {
  // Validate the repetition rule: I, X, C, M repeat ≤ 3; V, L, D never repeat.
  if (/IIII|XXXX|CCCC|MMMM|VV|LL|DD/.test(s)) return null;
  // Walk left-to-right; if a smaller symbol precedes a larger, only allow validated pairs.
  let i = 0;
  let total = 0;
  while (i < s.length) {
    const cur = SYMBOL_VALUE[s[i]];
    const next = SYMBOL_VALUE[s[i + 1]];
    if (cur === undefined) return null;
    if (next && cur < next) {
      const pair = s.slice(i, i + 2);
      if (!VALID_SUBTRACT.has(pair)) return null;
      total += next - cur;
      i += 2;
    } else {
      total += cur;
      i++;
    }
  }
  return total;
}

export interface FromRomanResult {
  ok: boolean;
  value: number;
  /** Whether we used the vinculum extension. */
  hasVinculum: boolean;
  error?: string;
}

/** Parse a Roman numeral, supporting the combining-macron extension. */
export function romanToInt(input: string): FromRomanResult {
  const cleaned = input.trim().toUpperCase();
  if (!cleaned) return { ok: false, value: 0, hasVinculum: false, error: "Enter a Roman numeral." };

  // Split into vinculum (combining macron) chars and plain chars.
  let large = "";
  let plain = "";
  let i = 0;
  let hasVinculum = false;
  while (i < cleaned.length) {
    const ch = cleaned[i];
    const next = cleaned[i + 1];
    if (next === "̅") {
      large += ch;
      hasVinculum = true;
      i += 2;
    } else if (SYMBOL_VALUE[ch] !== undefined) {
      plain += ch;
      i++;
    } else {
      return { ok: false, value: 0, hasVinculum, error: `Unknown character: '${ch}'` };
    }
  }

  const largeValue = parsePlain(large);
  if (large && largeValue === null) return { ok: false, value: 0, hasVinculum, error: "Invalid Roman numeral in the overlined portion." };
  const plainValue = parsePlain(plain);
  if (plain && plainValue === null) return { ok: false, value: 0, hasVinculum, error: "Invalid Roman numeral (check repetition and subtraction rules)." };

  const total = (largeValue ?? 0) * 1000 + (plainValue ?? 0);
  if (total < ROMAN_MIN || total > ROMAN_MAX) {
    return { ok: false, value: total, hasVinculum, error: "Result out of range." };
  }
  return { ok: true, value: total, hasVinculum };
}

export const ROMAN_REFERENCE = [
  { value: 1, symbol: "I" },
  { value: 4, symbol: "IV" },
  { value: 5, symbol: "V" },
  { value: 9, symbol: "IX" },
  { value: 10, symbol: "X" },
  { value: 40, symbol: "XL" },
  { value: 50, symbol: "L" },
  { value: 90, symbol: "XC" },
  { value: 100, symbol: "C" },
  { value: 400, symbol: "CD" },
  { value: 500, symbol: "D" },
  { value: 900, symbol: "CM" },
  { value: 1_000, symbol: "M" },
  { value: 4_000, symbol: "ĪV̄" },
  { value: 5_000, symbol: "V̄" },
  { value: 10_000, symbol: "X̄" },
  { value: 50_000, symbol: "L̄" },
  { value: 100_000, symbol: "C̄" },
  { value: 500_000, symbol: "D̄" },
  { value: 1_000_000, symbol: "M̄" },
];

export const ROMAN_RULES = [
  "Symbols are added left-to-right when each value is the same or larger than the next.",
  "When a smaller value precedes a larger one, it's subtracted — but only these pairs are valid: IV, IX, XL, XC, CD, CM.",
  "I, X, C and M may repeat up to 3 times in a row. V, L and D never repeat.",
  "An overline (vinculum) multiplies any symbol by 1 000 — V̄ = 5 000, M̄ = 1 000 000.",
];
