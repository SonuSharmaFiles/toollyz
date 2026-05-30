// Barcode generator metadata for the Toollyz Barcode Generator. The
// rendering itself is delegated to JsBarcode (lazy-loaded in the component);
// this file is just format catalogues, sensible defaults and a friendly
// lint pass before JsBarcode's stricter validator gets the value.

export type BarcodeFormat =
  | "CODE128"
  | "CODE128A"
  | "CODE128B"
  | "CODE128C"
  | "CODE39"
  | "EAN13"
  | "EAN8"
  | "EAN5"
  | "EAN2"
  | "UPC"
  | "UPCE"
  | "ITF14"
  | "ITF"
  | "MSI"
  | "MSI10"
  | "MSI11"
  | "MSI1010"
  | "MSI1110"
  | "pharmacode"
  | "codabar";

export interface FormatInfo {
  id: BarcodeFormat;
  label: string;
  group: "Retail" | "Logistics" | "Industrial" | "Pharma" | "Generic";
  description: string;
  /** Example input that validates for this format. */
  sample: string;
  /** Inline lint message returned for clearly-wrong inputs (purely advisory;
   * JsBarcode's validate runs on top). */
  hint?: string;
}

export const FORMATS: FormatInfo[] = [
  {
    id: "CODE128",
    label: "Code 128 (auto)",
    group: "Generic",
    description: "Variable-length, alphanumeric + control; the most common general-purpose 1D barcode.",
    sample: "TOOLLYZ-128",
  },
  {
    id: "CODE128A",
    label: "Code 128 A",
    group: "Generic",
    description: "Uppercase A–Z, 0–9, control characters.",
    sample: "HELLO 123",
  },
  {
    id: "CODE128B",
    label: "Code 128 B",
    group: "Generic",
    description: "Full ASCII, including lowercase.",
    sample: "Hello 123",
  },
  {
    id: "CODE128C",
    label: "Code 128 C",
    group: "Generic",
    description: "Numeric only, encoded as pairs — best density for digits.",
    sample: "1234567890",
    hint: "Code 128 C accepts only digit pairs (even length).",
  },
  {
    id: "CODE39",
    label: "Code 39",
    group: "Industrial",
    description: "Uppercase A–Z, 0–9 and -.$/+%*<space>. Common in automotive and defence.",
    sample: "TOOLLYZ-39",
  },
  {
    id: "EAN13",
    label: "EAN-13",
    group: "Retail",
    description: "13-digit retail barcode (the one on the back of nearly every product).",
    sample: "5901234123457",
    hint: "EAN-13 requires exactly 12 digits (a 13th check digit is added automatically) or all 13.",
  },
  {
    id: "EAN8",
    label: "EAN-8",
    group: "Retail",
    description: "Short retail barcode (8 digits) for small packaging.",
    sample: "12345670",
    hint: "EAN-8 requires 7 digits (check digit added) or 8.",
  },
  {
    id: "UPC",
    label: "UPC-A",
    group: "Retail",
    description: "12-digit North American retail barcode.",
    sample: "123456789012",
    hint: "UPC-A requires 11 digits (check digit added) or 12.",
  },
  {
    id: "UPCE",
    label: "UPC-E",
    group: "Retail",
    description: "Compressed 8-digit UPC, used on tiny packages.",
    sample: "01234565",
    hint: "UPC-E requires 8 digits starting with 0 or 1.",
  },
  {
    id: "ITF14",
    label: "ITF-14",
    group: "Logistics",
    description: "Interleaved 2 of 5, 14-digit case-level shipping barcode.",
    sample: "10012345678902",
    hint: "ITF-14 requires 13 digits (check digit added) or 14.",
  },
  {
    id: "ITF",
    label: "Interleaved 2 of 5",
    group: "Logistics",
    description: "Variable-length numeric barcode; the input must have an even number of digits.",
    sample: "123456",
    hint: "ITF requires an even number of digits.",
  },
  {
    id: "MSI",
    label: "MSI Plessey",
    group: "Industrial",
    description: "Variable-length numeric, mostly for shelf labels.",
    sample: "1234567",
  },
  {
    id: "pharmacode",
    label: "Pharmacode",
    group: "Pharma",
    description: "1–6 digit pharmaceutical packaging code (3 – 131070).",
    sample: "1234",
    hint: "Pharmacode accepts integers from 3 to 131070.",
  },
  {
    id: "codabar",
    label: "Codabar",
    group: "Generic",
    description: "Numeric + a few symbols (-$:./+); used in libraries and blood banks.",
    sample: "A12345B",
  },
];

export interface BarcodeOptions {
  format: BarcodeFormat;
  value: string;
  fg: string;
  bg: string;
  barWidth: number;
  height: number;
  displayValue: boolean;
  text: string;
  fontSize: number;
  textMargin: number;
  margin: number;
  flat: boolean;
}

export const DEFAULT_OPTIONS: BarcodeOptions = {
  format: "CODE128",
  value: "TOOLLYZ-128",
  fg: "#000000",
  bg: "#ffffff",
  barWidth: 2,
  height: 100,
  displayValue: true,
  text: "",
  fontSize: 18,
  textMargin: 4,
  margin: 12,
  flat: false,
};

/**
 * Light client-side check before JsBarcode runs its own validator. Returns
 * an array of (advisory) lint warnings rather than hard failures.
 */
export function lint(value: string, format: BarcodeFormat): string[] {
  const out: string[] = [];
  if (!value) {
    out.push("Add the value to encode.");
    return out;
  }
  switch (format) {
    case "EAN13":
      if (!/^\d{12,13}$/.test(value)) out.push("EAN-13 needs 12 or 13 digits.");
      break;
    case "EAN8":
      if (!/^\d{7,8}$/.test(value)) out.push("EAN-8 needs 7 or 8 digits.");
      break;
    case "UPC":
      if (!/^\d{11,12}$/.test(value)) out.push("UPC-A needs 11 or 12 digits.");
      break;
    case "UPCE":
      if (!/^[01]\d{6,7}$/.test(value)) out.push("UPC-E needs 7 or 8 digits starting with 0 or 1.");
      break;
    case "ITF14":
      if (!/^\d{13,14}$/.test(value)) out.push("ITF-14 needs 13 or 14 digits.");
      break;
    case "ITF":
      if (!/^\d+$/.test(value)) out.push("ITF (Interleaved 2 of 5) accepts digits only.");
      else if (value.length % 2 !== 0) out.push("ITF needs an even number of digits.");
      break;
    case "CODE39":
      if (!/^[0-9A-Z\-.$/+% ]+$/.test(value)) out.push("Code 39 accepts uppercase A–Z, 0–9 and -.$/+%<space>.");
      break;
    case "CODE128C":
      if (!/^\d+$/.test(value)) out.push("Code 128 C is numeric only.");
      else if (value.length % 2 !== 0) out.push("Code 128 C needs an even number of digits.");
      break;
    case "MSI":
    case "MSI10":
    case "MSI11":
    case "MSI1010":
    case "MSI1110":
      if (!/^\d+$/.test(value)) out.push("MSI Plessey is numeric only.");
      break;
    case "pharmacode": {
      const n = Number(value);
      if (!Number.isInteger(n) || n < 3 || n > 131070) out.push("Pharmacode accepts integers from 3 to 131070.");
      break;
    }
    case "codabar":
      if (!/^[0-9\-$:./+ABCDabcd]+$/.test(value)) out.push("Codabar accepts digits and -$:./+; A–D delimiters allowed.");
      break;
  }
  return out;
}
