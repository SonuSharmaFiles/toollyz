import {
  ADJ,
  COOL_NUMS,
  CONSONANTS,
  DEV_SUFFIX,
  GAMING_SUFFIX,
  NOUN,
  PREFIX,
  SOCIAL_PREFIX,
  SOFT_CONSONANTS,
  SUFFIX,
  VOWELS,
  type UsernameMode,
} from "./vocab";

export type Separator = "none" | "underscore" | "dot" | "mixed";
export type Casing = "lower" | "title" | "upper" | "camel";

export interface GenerateOptions {
  mode: UsernameMode;
  count: number;
  minLength: number;
  maxLength: number;
  separator: Separator;
  casing: Casing;
  includeNumbers: boolean;
  includeSpecial: boolean;
  pronounceable: boolean;
  seed?: string; // optional name/keyword
}

// ─── Random helpers ───────────────────────────────────────────────────────
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rng(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function maybe(p: number): boolean {
  return Math.random() < p;
}

// ─── Pronounceable token ──────────────────────────────────────────────────
function pronounceable(length: number): string {
  // alternating consonant/vowel with soft consonants more likely
  const chars: string[] = [];
  let nextVowel = maybe(0.5);
  for (let i = 0; i < length; i++) {
    if (nextVowel) {
      chars.push(VOWELS[Math.floor(Math.random() * VOWELS.length)]);
    } else {
      const src = maybe(0.6) ? SOFT_CONSONANTS : CONSONANTS;
      chars.push(src[Math.floor(Math.random() * src.length)]);
    }
    nextVowel = !nextVowel;
  }
  return chars.join("");
}

function sanitizeSeed(seed: string): string {
  return seed.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// ─── Casing + separator helpers ───────────────────────────────────────────
function applySeparator(parts: string[], sep: Separator): string {
  if (sep === "none") return parts.join("");
  if (sep === "underscore") return parts.join("_");
  if (sep === "dot") return parts.join(".");
  // mixed: random per gap
  let out = parts[0] ?? "";
  for (let i = 1; i < parts.length; i++) {
    const s = pick(["_", ".", ""]);
    out += s + parts[i];
  }
  return out;
}

function applyCase(value: string, casing: Casing): string {
  if (casing === "lower") return value.toLowerCase();
  if (casing === "upper") return value.toUpperCase();
  if (casing === "title") {
    return value
      .split(/([_.])/)
      .map((seg) =>
        /[a-z]/i.test(seg) ? seg.charAt(0).toUpperCase() + seg.slice(1) : seg,
      )
      .join("");
  }
  // camel: capitalize after separators, drop separators
  const cleaned = value.split(/[_.\s-]+/);
  return cleaned
    .map((seg, i) =>
      i === 0
        ? seg.toLowerCase()
        : seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase(),
    )
    .join("");
}

// ─── Per-mode generators ──────────────────────────────────────────────────
type Generator = (opts: GenerateOptions) => string[];

const gen = {
  random: (opts) => {
    const adjPool = [
      ...ADJ.general, ...ADJ.aesthetic, ...ADJ.gaming, ...ADJ.tech, ...ADJ.funny,
    ];
    const nounPool = [
      ...NOUN.general, ...NOUN.aesthetic, ...NOUN.gaming, ...NOUN.tech, ...NOUN.funny,
    ];
    const parts = [pick(adjPool), pick(nounPool)];
    if (opts.includeNumbers && maybe(0.6)) parts.push(pick(COOL_NUMS));
    return parts;
  },

  name: (opts) => {
    const seed = opts.seed ? sanitizeSeed(opts.seed) : pick(NOUN.general);
    const variants: string[][] = [
      [seed, pick(SUFFIX)],
      [pick(PREFIX), seed],
      [seed, pick(COOL_NUMS)],
      [pick(ADJ.general), seed],
      [seed, pick(DEV_SUFFIX)],
    ];
    const choice = pick(variants);
    if (opts.includeNumbers && maybe(0.4) && !choice.some((c) => /\d/.test(c))) {
      choice.push(pick(COOL_NUMS));
    }
    return choice;
  },

  gaming: (opts) => {
    const variants: string[][] = [
      [pick(ADJ.gaming), pick(NOUN.gaming)],
      [pick(ADJ.gaming), pick(NOUN.gaming), pick(COOL_NUMS)],
      ["x", pick(NOUN.gaming), "x"],
      [pick(NOUN.gaming), pick(GAMING_SUFFIX)],
      [pick(ADJ.gaming), pick(NOUN.gaming), pick(GAMING_SUFFIX)],
    ];
    return pick(variants);
  },

  aesthetic: (opts) => {
    const variants: string[][] = [
      [pick(ADJ.aesthetic), pick(NOUN.aesthetic)],
      [pick(NOUN.aesthetic), pick(NOUN.aesthetic)],
      [pick(ADJ.aesthetic), pick(NOUN.aesthetic), pick(NOUN.aesthetic)],
    ];
    return pick(variants);
  },

  professional: (opts) => {
    const seed = opts.seed ? sanitizeSeed(opts.seed) : pick(NOUN.general);
    const variants: string[][] = [
      [seed, pick(SUFFIX)],
      [pick(ADJ.professional), seed],
      [seed, pick(NOUN.professional)],
      [pick(NOUN.professional), seed],
    ];
    return pick(variants);
  },

  tech: (opts) => {
    const seed = opts.seed ? sanitizeSeed(opts.seed) : pick(NOUN.tech);
    const variants: string[][] = [
      [seed, pick(DEV_SUFFIX)],
      [pick(ADJ.tech), pick(NOUN.tech)],
      [pick(NOUN.tech), pick(NOUN.tech)],
      [pick(ADJ.tech), seed],
      [seed, pick(NOUN.tech)],
    ];
    return pick(variants);
  },

  brandable: (opts) => {
    const len = rng(5, 8);
    const tok = pronounceable(len);
    if (opts.includeNumbers && maybe(0.3)) return [tok, pick(COOL_NUMS).slice(0, 2)];
    return [tok];
  },

  funny: (opts) => {
    const variants: string[][] = [
      [pick(ADJ.funny), pick(NOUN.funny)],
      [pick(ADJ.funny), pick(NOUN.general)],
      [pick(NOUN.funny), pick(NOUN.funny)],
      [pick(ADJ.funny), pick(NOUN.funny), pick(COOL_NUMS)],
    ];
    return pick(variants);
  },

  social: (opts) => {
    const seed = opts.seed ? sanitizeSeed(opts.seed) : pick(NOUN.general);
    const variants: string[][] = [
      [pick(SOCIAL_PREFIX), seed],
      [seed, pick(SUFFIX)],
      [seed, pick(COOL_NUMS).slice(0, 2)],
      [pick(SOCIAL_PREFIX), seed, "official"],
      [seed, "xo", "xo"],
    ];
    return pick(variants);
  },

  short: (opts) => {
    const variants: string[][] = [
      [pick(NOUN.general)],
      [pronounceable(rng(4, 6))],
      [pick(NOUN.tech).slice(0, 4)],
      [pick(NOUN.general).slice(0, 4), pick(COOL_NUMS).slice(0, 2)],
    ];
    return pick(variants);
  },
} satisfies Record<UsernameMode, Generator>;

// ─── Core single-username generator ───────────────────────────────────────
function generateOne(opts: GenerateOptions): string {
  const generator = gen[opts.mode];

  for (let attempt = 0; attempt < 15; attempt++) {
    let parts = generator(opts);

    if (opts.pronounceable) {
      parts = parts.map((p) =>
        /[aeiouy]/i.test(p) || /^\d+$/.test(p) || p.length <= 2 ? p : pronounceable(Math.max(4, p.length)),
      );
    }

    let username = applySeparator(parts, opts.separator);

    if (opts.includeSpecial && maybe(0.4)) {
      username = `${pick(["~", "-", "_"])}${username}${pick(["", "x", "~", "-"])}`;
    }

    username = applyCase(username, opts.casing);

    if (
      username.length >= opts.minLength &&
      username.length <= opts.maxLength
    ) {
      return username;
    }

    // adjust for length
    if (username.length > opts.maxLength) {
      username = username.slice(0, opts.maxLength).replace(/[._~-]+$/, "");
      if (username.length >= opts.minLength) return username;
    }
    if (username.length < opts.minLength && opts.includeNumbers) {
      const pad = pick(COOL_NUMS);
      const candidate = (username + pad).slice(0, opts.maxLength);
      if (candidate.length >= opts.minLength) return candidate;
    }
  }
  // give up — return last attempt regardless
  const fallback = applyCase(applySeparator(generator(opts), opts.separator), opts.casing);
  return fallback;
}

export function generateUsernames(opts: GenerateOptions): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  let safety = 0;
  while (out.length < opts.count && safety < opts.count * 12) {
    safety++;
    const u = generateOne(opts);
    if (!seen.has(u.toLowerCase())) {
      seen.add(u.toLowerCase());
      out.push(u);
    }
  }
  return out;
}

// ─── Export helpers ───────────────────────────────────────────────────────
export function toCsv(usernames: string[], mode: UsernameMode): string {
  const headers = "username,length,mode";
  const rows = usernames.map((u) => `${u},${u.length},${mode}`);
  return [headers, ...rows].join("\n");
}

export function toTxt(usernames: string[]): string {
  return usernames.join("\n");
}
