import { hexToRgb, type RGB } from "./color";

// WCAG relative luminance
function srgbToLin(v: number): number {
  const x = v / 255;
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: RGB): number {
  const r = srgbToLin(rgb.r);
  const g = srgbToLin(rgb.g);
  const b = srgbToLin(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexToRgb(hexA));
  const b = relativeLuminance(hexToRgb(hexB));
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface WcagGrades {
  ratio: number;
  AANormal: boolean;
  AALarge: boolean;
  AAANormal: boolean;
  AAALarge: boolean;
}

export function gradeContrast(ratio: number): WcagGrades {
  return {
    ratio,
    AANormal: ratio >= 4.5,
    AALarge: ratio >= 3,
    AAANormal: ratio >= 7,
    AAALarge: ratio >= 4.5,
  };
}

// Suggest white or black text on a given background based on luminance
export function bestTextColor(hex: string): "#FFFFFF" | "#0F172A" {
  const lum = relativeLuminance(hexToRgb(hex));
  return lum > 0.5 ? "#0F172A" : "#FFFFFF";
}
