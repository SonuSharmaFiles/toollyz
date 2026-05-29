// Invisible / blank Unicode character utilities: a catalog of zero-width and
// blank characters, generation, presets, platform compatibility, and an
// analyzer that detects & reveals hidden characters. Dependency-free.

export type CharKind = "zero-width" | "blank" | "space" | "format";

export interface InvisibleChar {
  id: string;
  name: string;
  cp: number; // codepoint
  kind: CharKind;
  width: "zero" | "visible"; // does it occupy layout width?
  best?: boolean; // recommended for blank usernames
  desc: string;
}

export const INVISIBLE_CHARS: InvisibleChar[] = [
  { id: "zwsp", name: "Zero Width Space", cp: 0x200b, kind: "zero-width", width: "zero", desc: "The classic invisible character — has no width and is often stripped by platforms that trim whitespace." },
  { id: "zwnj", name: "Zero Width Non-Joiner", cp: 0x200c, kind: "zero-width", width: "zero", desc: "Prevents two characters from joining. Invisible and zero-width." },
  { id: "zwj", name: "Zero Width Joiner", cp: 0x200d, kind: "zero-width", width: "zero", desc: "Joins characters (used in emoji sequences). Invisible on its own." },
  { id: "wj", name: "Word Joiner", cp: 0x2060, kind: "zero-width", width: "zero", desc: "Zero-width, prevents line breaks. A robust invisible character." },
  { id: "bom", name: "Zero Width No-Break Space", cp: 0xfeff, kind: "zero-width", width: "zero", desc: "Also known as the BOM. Zero-width but sometimes interpreted as a byte-order mark." },
  { id: "invsep", name: "Invisible Separator", cp: 0x2063, kind: "format", width: "zero", desc: "An invisible mathematical separator. Zero-width format character." },
  { id: "invtimes", name: "Invisible Times", cp: 0x2062, kind: "format", width: "zero", desc: "An invisible mathematical operator. Zero-width." },
  { id: "hangul", name: "Hangul Filler", cp: 0x3164, kind: "blank", width: "visible", best: true, desc: "Looks empty but occupies real width — the most reliable choice for blank usernames and bios." },
  { id: "braille", name: "Braille Blank", cp: 0x2800, kind: "blank", width: "visible", best: true, desc: "A blank Braille pattern. Visible width but renders empty — great for blank names where pure zero-width is stripped." },
  { id: "ideographic", name: "Ideographic Space", cp: 0x3000, kind: "space", width: "visible", desc: "A full-width (CJK) space. Wider than a normal space and rarely trimmed." },
  { id: "nbsp", name: "No-Break Space", cp: 0x00a0, kind: "space", width: "visible", desc: "A normal-width space that won't break or collapse — useful for spacing that survives trimming." },
];

export const CHAR_BY_ID: Record<string, InvisibleChar> = Object.fromEntries(INVISIBLE_CHARS.map((c) => [c.id, c]));

export function codeU(cp: number): string {
  return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
}
export function toChar(cp: number): string {
  return String.fromCodePoint(cp);
}

export function generate(charId: string, count: number): string {
  const c = CHAR_BY_ID[charId];
  if (!c) return "";
  return toChar(c.cp).repeat(Math.max(0, Math.min(5000, count)));
}

// ─── Developer encoding info ─────────────────────────────────────────────────

export interface EncodingInfo {
  code: string;
  hexUtf16: string;
  hexUtf8: string;
  jsEscape: string;
  htmlEntity: string;
  cssEscape: string;
}

export function encodingInfo(cp: number): EncodingInfo {
  const ch = String.fromCodePoint(cp);
  const utf16 = [...ch].flatMap((c) => {
    const u = c.charCodeAt(0);
    if (c.length > 1 || u > 0xffff) {
      return [c.charCodeAt(0), c.charCodeAt(1)].map((x) => x.toString(16).toUpperCase().padStart(4, "0"));
    }
    return [u.toString(16).toUpperCase().padStart(4, "0")];
  });
  const bytes = typeof TextEncoder !== "undefined" ? Array.from(new TextEncoder().encode(ch)) : [];
  return {
    code: codeU(cp),
    hexUtf16: utf16.map((h) => `0x${h}`).join(" "),
    hexUtf8: bytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" "),
    jsEscape: cp > 0xffff ? `\\u{${cp.toString(16).toUpperCase()}}` : `\\u${cp.toString(16).toUpperCase().padStart(4, "0")}`,
    htmlEntity: `&#${cp};`,
    cssEscape: `\\${cp.toString(16).toUpperCase()}`,
  };
}

// ─── Presets ─────────────────────────────────────────────────────────────────

export interface Preset {
  id: string;
  label: string;
  desc: string;
  charId: string;
  count: number;
}

export const PRESETS: Preset[] = [
  { id: "username", label: "Blank username", desc: "An empty name for games & profiles", charId: "hangul", count: 1 },
  { id: "discord", label: "Empty Discord name", desc: "Invisible nickname", charId: "braille", count: 1 },
  { id: "bio", label: "Invisible bio line", desc: "Blank line for Instagram/TikTok bios", charId: "hangul", count: 3 },
  { id: "message", label: "Blank message", desc: "Send an empty chat message", charId: "braille", count: 1 },
  { id: "separator", label: "Hidden separator", desc: "Zero-width text separator", charId: "wj", count: 1 },
  { id: "spacer", label: "Wide spacer", desc: "Full-width invisible spacing", charId: "ideographic", count: 2 },
];

// ─── Platform compatibility ──────────────────────────────────────────────────

export type Support = "works" | "limited" | "strips";

export interface PlatformCompat {
  id: string;
  name: string;
  support: Support;
  note: string;
}

export const PLATFORMS: PlatformCompat[] = [
  { id: "instagram", name: "Instagram", support: "works", note: "Blank chars (Braille/Hangul filler) work in bios & names." },
  { id: "tiktok", name: "TikTok", support: "works", note: "Works in captions and profile fields." },
  { id: "discord", name: "Discord", support: "works", note: "Great for invisible names and messages." },
  { id: "whatsapp", name: "WhatsApp", support: "works", note: "Send blank messages and status." },
  { id: "telegram", name: "Telegram", support: "works", note: "Works in messages and usernames where allowed." },
  { id: "x", name: "X (Twitter)", support: "limited", note: "Some zero-width chars are trimmed; blank chars work." },
  { id: "facebook", name: "Facebook", support: "limited", note: "Often collapses leading/trailing invisible text." },
  { id: "snapchat", name: "Snapchat", support: "limited", note: "Variable support depending on field." },
  { id: "youtube", name: "YouTube", support: "limited", note: "Works in comments; channel names are restricted." },
  { id: "reddit", name: "Reddit", support: "strips", note: "Trims most invisible characters from titles & flair." },
];

export const GAMES: { id: string; name: string; note: string }[] = [
  { id: "freefire", name: "Free Fire", note: "Use a Braille blank for an invisible name." },
  { id: "pubg", name: "PUBG / BGMI", note: "Hangul filler works for blank nicknames." },
  { id: "roblox", name: "Roblox", note: "Display names accept blank chars in some regions." },
  { id: "fortnite", name: "Fortnite", note: "Limited — many fields reject invisible text." },
  { id: "discord", name: "Discord", note: "Fully supports invisible names & tags." },
  { id: "steam", name: "Steam", note: "Works for profile names and aliases." },
];

// ─── Analyzer / detector ─────────────────────────────────────────────────────

const KNOWN = new Map(INVISIBLE_CHARS.map((c) => [c.cp, c.name]));

// Extra invisible/blank codepoints worth detecting (not all are in the catalog).
const EXTRA_NAMES: Record<number, string> = {
  0x2061: "Function Application",
  0x2064: "Invisible Plus",
  0x180e: "Mongolian Vowel Separator",
  0x115f: "Hangul Choseong Filler",
  0x1160: "Hangul Jungseong Filler",
  0xffa0: "Halfwidth Hangul Filler",
  0x1680: "Ogham Space Mark",
  0x2000: "En Quad", 0x2001: "Em Quad", 0x2002: "En Space", 0x2003: "Em Space",
  0x2004: "Three-Per-Em Space", 0x2005: "Four-Per-Em Space", 0x2006: "Six-Per-Em Space",
  0x2007: "Figure Space", 0x2008: "Punctuation Space", 0x2009: "Thin Space",
  0x200a: "Hair Space", 0x202f: "Narrow No-Break Space", 0x205f: "Medium Mathematical Space",
  0x00ad: "Soft Hyphen", 0x034f: "Combining Grapheme Joiner", 0x061c: "Arabic Letter Mark",
  0x200e: "Left-to-Right Mark", 0x200f: "Right-to-Left Mark",
};

export function isHidden(cp: number): boolean {
  if (KNOWN.has(cp)) return true;
  if (cp in EXTRA_NAMES) return true;
  // zero-width & directional formatting range
  if (cp >= 0x200b && cp <= 0x200f) return true;
  if (cp >= 0x2060 && cp <= 0x2064) return true;
  if (cp >= 0x202a && cp <= 0x202e) return true; // bidi embedding
  if (cp >= 0x2066 && cp <= 0x2069) return true; // bidi isolates
  return false;
}

export function charName(cp: number): string {
  return KNOWN.get(cp) ?? EXTRA_NAMES[cp] ?? "Unknown invisible character";
}

export interface AnalysisHit {
  cp: number;
  name: string;
  count: number;
}
export interface Analysis {
  totalChars: number;
  visibleChars: number;
  hiddenChars: number;
  revealed: string;
  hits: AnalysisHit[];
}

export function analyze(text: string): Analysis {
  let visible = 0;
  let hidden = 0;
  let total = 0;
  const counts = new Map<number, number>();
  let revealed = "";
  for (const ch of text) {
    total++;
    const cp = ch.codePointAt(0)!;
    if (isHidden(cp)) {
      hidden++;
      counts.set(cp, (counts.get(cp) ?? 0) + 1);
      revealed += `⟦${codeU(cp)}⟧`;
    } else {
      visible++;
      revealed += ch;
    }
  }
  const hits: AnalysisHit[] = [...counts.entries()]
    .map(([cp, count]) => ({ cp, name: charName(cp), count }))
    .sort((a, b) => b.count - a.count);
  return { totalChars: total, visibleChars: visible, hiddenChars: hidden, revealed, hits };
}
