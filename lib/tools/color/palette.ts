import { clamp, hexToHsl, hslToHex, type HSL } from "./color";

export type PaletteStyle =
  | "random"
  | "monochromatic"
  | "analogous"
  | "complementary"
  | "triadic"
  | "pastel"
  | "neon"
  | "earthy"
  | "dark"
  | "minimal";

export const PALETTE_STYLES: { id: PaletteStyle; label: string; hint: string }[] = [
  { id: "random", label: "Random", hint: "Pure chaos — anything goes." },
  { id: "monochromatic", label: "Monochromatic", hint: "One hue, varied lightness." },
  { id: "analogous", label: "Analogous", hint: "Neighbouring hues — smooth, calm." },
  { id: "complementary", label: "Complementary", hint: "Opposites — high-impact contrast." },
  { id: "triadic", label: "Triadic", hint: "Three hues spaced 120° apart." },
  { id: "pastel", label: "Pastel", hint: "Soft, airy, low-saturation." },
  { id: "neon", label: "Neon", hint: "Hyper-saturated electric brights." },
  { id: "earthy", label: "Earthy", hint: "Warm browns, greens, terracottas." },
  { id: "dark", label: "Dark mode", hint: "Deep, low-light UI palette." },
  { id: "minimal", label: "Minimal", hint: "Mostly neutral, subtle accents." },
];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const randomInt = (min: number, max: number) =>
  Math.floor(min + Math.random() * (max - min + 1));

function makeHsl(h: number, s: number, l: number): HSL {
  return {
    h: ((Math.round(h) % 360) + 360) % 360,
    s: clamp(Math.round(s), 0, 100),
    l: clamp(Math.round(l), 0, 100),
  };
}

function generateStyle(style: PaletteStyle, count: number, baseHue?: number): HSL[] {
  const base = baseHue ?? randomInt(0, 359);
  const out: HSL[] = [];

  switch (style) {
    case "random": {
      for (let i = 0; i < count; i++) {
        out.push(makeHsl(randomInt(0, 359), randomInt(40, 90), randomInt(35, 75)));
      }
      break;
    }
    case "monochromatic": {
      for (let i = 0; i < count; i++) {
        const l = 20 + (70 / Math.max(count - 1, 1)) * i;
        const s = 50 + Math.random() * 30;
        out.push(makeHsl(base, s, l));
      }
      break;
    }
    case "analogous": {
      for (let i = 0; i < count; i++) {
        const offset = ((i - Math.floor(count / 2)) * 25);
        out.push(makeHsl(base + offset, rand(55, 80), rand(45, 70)));
      }
      break;
    }
    case "complementary": {
      for (let i = 0; i < count; i++) {
        const useComp = i % 2 === 1;
        const h = useComp ? base + 180 : base;
        out.push(makeHsl(h + rand(-10, 10), rand(55, 85), rand(40, 70)));
      }
      break;
    }
    case "triadic": {
      for (let i = 0; i < count; i++) {
        const h = base + (i % 3) * 120;
        out.push(makeHsl(h + rand(-8, 8), rand(50, 80), rand(45, 70)));
      }
      break;
    }
    case "pastel": {
      for (let i = 0; i < count; i++) {
        out.push(makeHsl(randomInt(0, 359), rand(35, 60), rand(78, 92)));
      }
      break;
    }
    case "neon": {
      for (let i = 0; i < count; i++) {
        out.push(makeHsl(randomInt(0, 359), rand(90, 100), rand(48, 62)));
      }
      break;
    }
    case "earthy": {
      const earthHues = [20, 30, 40, 60, 80, 100, 15, 45];
      for (let i = 0; i < count; i++) {
        out.push(
          makeHsl(
            earthHues[Math.floor(Math.random() * earthHues.length)] + rand(-10, 10),
            rand(25, 55),
            rand(30, 60),
          ),
        );
      }
      break;
    }
    case "dark": {
      for (let i = 0; i < count; i++) {
        out.push(makeHsl(randomInt(0, 359), rand(20, 65), rand(8, 30)));
      }
      break;
    }
    case "minimal": {
      const accentSlot = randomInt(0, count - 1);
      for (let i = 0; i < count; i++) {
        if (i === accentSlot) {
          out.push(makeHsl(base, rand(60, 85), rand(45, 60)));
        } else {
          out.push(makeHsl(base, rand(0, 12), rand(15, 95)));
        }
      }
      break;
    }
  }
  return out;
}

export interface PaletteEntry {
  hex: string;
  hsl: HSL;
  locked: boolean;
}

export function generatePalette(
  style: PaletteStyle,
  count: number,
  locked: PaletteEntry[] = [],
): PaletteEntry[] {
  // If any locked colors, preserve them and only fill empty slots
  const result: PaletteEntry[] = [];
  // Reuse a single base hue from a locked color when available, else random
  const baseHue = locked.find((e) => e?.locked)?.hsl.h;
  const generated = generateStyle(style, count, baseHue);

  for (let i = 0; i < count; i++) {
    const existing = locked[i];
    if (existing && existing.locked) {
      result.push(existing);
    } else {
      const hsl = generated[i] ?? makeHsl(randomInt(0, 359), 60, 50);
      result.push({
        hex: hslToHex(hsl),
        hsl,
        locked: false,
      });
    }
  }
  return result;
}

export function lockEntry(entry: PaletteEntry, locked: boolean): PaletteEntry {
  return { ...entry, locked };
}

export function adjustEntry(
  entry: PaletteEntry,
  delta: { h?: number; s?: number; l?: number },
): PaletteEntry {
  const next = {
    h: ((entry.hsl.h + (delta.h ?? 0)) % 360 + 360) % 360,
    s: clamp(entry.hsl.s + (delta.s ?? 0), 0, 100),
    l: clamp(entry.hsl.l + (delta.l ?? 0), 0, 100),
  };
  return {
    hex: hslToHex(next),
    hsl: next,
    locked: entry.locked,
  };
}

export function fromHex(hex: string, locked = false): PaletteEntry {
  return { hex, hsl: hexToHsl(hex), locked };
}
