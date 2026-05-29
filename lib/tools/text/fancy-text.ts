// Fancy text engine: transforms plain text into Unicode style variants using
// Mathematical Alphanumeric Symbols, enclosed/full-width blocks and combining
// marks, plus a decoration + symbol library. Dependency-free.

const UP = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LO = "abcdefghijklmnopqrstuvwxyz";
const DI = "0123456789";

// Build a map from a contiguous Mathematical Alphanumeric block, with explicit
// overrides for the "holes" that live in the Letterlike Symbols block.
function mathMap(
  upperBase: number | null,
  lowerBase: number | null,
  digitBase: number | null,
  holes: Record<string, number> = {},
): Record<string, string> {
  const m: Record<string, string> = {};
  if (upperBase !== null) [...UP].forEach((c, i) => { m[c] = String.fromCodePoint(holes[c] ?? upperBase + i); });
  if (lowerBase !== null) [...LO].forEach((c, i) => { m[c] = String.fromCodePoint(holes[c] ?? lowerBase + i); });
  if (digitBase !== null) [...DI].forEach((c, i) => { m[c] = String.fromCodePoint(digitBase + i); });
  return m;
}

// Build a map from explicit glyph strings (must be in alphabetical order).
function listMap(letters: string, glyphs: string[]): Record<string, string> {
  const m: Record<string, string> = {};
  [...letters].forEach((c, i) => { if (glyphs[i]) m[c] = glyphs[i]; });
  return m;
}

const SCRIPT_HOLES = { B: 0x212c, E: 0x2130, F: 0x2131, H: 0x210b, I: 0x2110, L: 0x2112, M: 0x2133, R: 0x211b, e: 0x212f, g: 0x210a, o: 0x2134 };
const FRAKTUR_HOLES = { C: 0x212d, H: 0x210c, I: 0x2111, R: 0x211c, Z: 0x2128 };
const DBL_HOLES = { C: 0x2102, H: 0x210d, N: 0x2115, P: 0x2119, Q: 0x211a, R: 0x211d, Z: 0x2124 };

const SMALL_CAPS = listMap(LO, "ᴀ ʙ ᴄ ᴅ ᴇ ꜰ ɢ ʜ ɪ ᴊ ᴋ ʟ ᴍ ɴ ᴏ ᴘ q ʀ s ᴛ ᴜ ᴠ ᴡ x ʏ ᴢ".split(" "));
const SUPER = { ...listMap(LO, "ᵃ ᵇ ᶜ ᵈ ᵉ ᶠ ᵍ ʰ ⁱ ʲ ᵏ ˡ ᵐ ⁿ ᵒ ᵖ q ʳ ˢ ᵗ ᵘ ᵛ ʷ ˣ ʸ ᶻ".split(" ")), ...listMap(DI, "⁰ ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹".split(" ")) };
const SUB = { ...listMap(LO, "ₐ b c d ₑ f g ₕ ᵢ ⱼ ₖ ₗ ₘ ₙ ₒ ₚ q ᵣ ₛ ₜ ᵤ ᵥ w ₓ y z".split(" ")), ...listMap(DI, "₀ ₁ ₂ ₃ ₄ ₅ ₆ ₇ ₈ ₉".split(" ")) };

const FLIP = (() => {
  const pairs = "a:ɐ b:q c:ɔ d:p e:ǝ f:ɟ g:ƃ h:ɥ i:ᴉ j:ɾ k:ʞ l:l m:ɯ n:u o:o p:d q:b r:ɹ s:s t:ʇ u:n v:ʌ w:ʍ x:x y:ʎ z:z 1:Ɩ 2:ᄅ 3:Ɛ 4:ㄣ 5:ϛ 6:9 7:ㄥ 8:8 9:6 0:0 .:˙ ,:' ?:¿ !:¡".split(" ");
  const m: Record<string, string> = {};
  for (const p of pairs) { const idx = p.indexOf(":"); if (idx > 0) m[p.slice(0, idx)] = p.slice(idx + 1); }
  return m;
})();

function mapStyle(map: Record<string, string>) {
  return (text: string) => [...text].map((ch) => map[ch] ?? ch).join("");
}
function combineStyle(mark: string) {
  return (text: string) => [...text].map((ch) => (ch === " " || ch === "\n" ? ch : ch + mark)).join("");
}
function wideStyle(text: string) {
  return [...text].join(" ").replace(/\n /g, "\n");
}
function flipStyle(text: string) {
  return [...text.toLowerCase()].reverse().map((ch) => FLIP[ch] ?? ch).join("");
}
function zalgo(text: string) {
  const up = ["̀", "́", "̂", "̃", "̄", "̆", "̇", "̈", "̊", "̋", "̒", "̓", "̔", "̽", "͆"];
  const down = ["̖", "̗", "̘", "̙", "̜", "̝", "̣", "̤", "̥", "̦", "̩", "̪", "̫", "̱", "̲"];
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  return [...text].map((ch) => {
    if (ch === " " || ch === "\n") return ch;
    let out = ch;
    const n = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) out += pick(Math.random() > 0.5 ? up : down);
    return out;
  }).join("");
}

export type StyleCategory = "Bold & Italic" | "Cursive & Script" | "Gothic" | "Enclosed" | "Aesthetic" | "Effects";

export interface FancyStyle {
  id: string;
  label: string;
  category: StyleCategory;
  transform: (text: string) => string;
}

export const FANCY_STYLES: FancyStyle[] = [
  { id: "bold", label: "Bold", category: "Bold & Italic", transform: mapStyle(mathMap(0x1d400, 0x1d41a, 0x1d7ce)) },
  { id: "italic", label: "Italic", category: "Bold & Italic", transform: mapStyle(mathMap(0x1d434, 0x1d44e, null)) },
  { id: "bold-italic", label: "Bold Italic", category: "Bold & Italic", transform: mapStyle(mathMap(0x1d468, 0x1d482, null)) },
  { id: "sans-bold", label: "Sans Bold", category: "Bold & Italic", transform: mapStyle(mathMap(0x1d5d4, 0x1d5ee, 0x1d7ec)) },
  { id: "sans-italic", label: "Sans Italic", category: "Bold & Italic", transform: mapStyle(mathMap(0x1d608, 0x1d622, null)) },
  { id: "sans-bold-italic", label: "Sans Bold Italic", category: "Bold & Italic", transform: mapStyle(mathMap(0x1d63c, 0x1d656, null)) },
  { id: "mono", label: "Monospace", category: "Bold & Italic", transform: mapStyle(mathMap(0x1d670, 0x1d68a, 0x1d7f6)) },

  { id: "script", label: "Script", category: "Cursive & Script", transform: mapStyle(mathMap(0x1d49c, 0x1d4b6, null, SCRIPT_HOLES)) },
  { id: "bold-script", label: "Bold Script", category: "Cursive & Script", transform: mapStyle(mathMap(0x1d4d0, 0x1d4ea, null)) },

  { id: "fraktur", label: "Fraktur", category: "Gothic", transform: mapStyle(mathMap(0x1d504, 0x1d51e, null, FRAKTUR_HOLES)) },
  { id: "bold-fraktur", label: "Bold Fraktur", category: "Gothic", transform: mapStyle(mathMap(0x1d56c, 0x1d586, null)) },
  { id: "double-struck", label: "Double Struck", category: "Gothic", transform: mapStyle(mathMap(0x1d538, 0x1d552, 0x1d7d8, DBL_HOLES)) },

  { id: "circled", label: "Circled", category: "Enclosed", transform: mapStyle({ ...mathMap(0x24b6, 0x24d0, null), "0": "⓪", ...listMap(DI.slice(1), "① ② ③ ④ ⑤ ⑥ ⑦ ⑧ ⑨".split(" ")) }) },
  { id: "circled-neg", label: "Circled Filled", category: "Enclosed", transform: mapStyle({ ...listMap(UP, [...UP].map((_, i) => String.fromCodePoint(0x1f150 + i))) }) },
  { id: "squared", label: "Squared", category: "Enclosed", transform: mapStyle({ ...listMap(UP, [...UP].map((_, i) => String.fromCodePoint(0x1f130 + i))) }) },
  { id: "squared-neg", label: "Squared Filled", category: "Enclosed", transform: mapStyle({ ...listMap(UP, [...UP].map((_, i) => String.fromCodePoint(0x1f170 + i))) }) },
  { id: "paren", label: "Parenthesized", category: "Enclosed", transform: mapStyle({ ...mathMap(0x1f110, 0x249c, null), ...listMap(DI.slice(1), "⑴ ⑵ ⑶ ⑷ ⑸ ⑹ ⑺ ⑻ ⑼".split(" ")) }) },

  { id: "fullwidth", label: "Vaporwave", category: "Aesthetic", transform: (t) => [...t].map((c) => (c === " " ? "　" : c >= "!" && c <= "~" ? String.fromCodePoint(c.codePointAt(0)! + 0xfee0) : c)).join("") },
  { id: "small-caps", label: "Small Caps", category: "Aesthetic", transform: mapStyle(SMALL_CAPS) },
  { id: "wide", label: "Wide Spaced", category: "Aesthetic", transform: wideStyle },
  { id: "super", label: "Superscript", category: "Aesthetic", transform: mapStyle(SUPER) },
  { id: "sub", label: "Subscript", category: "Aesthetic", transform: mapStyle(SUB) },
  { id: "tiny", label: "Tiny Caps", category: "Aesthetic", transform: mapStyle({ ...SUPER, ...SMALL_CAPS }) },

  { id: "strike", label: "Strikethrough", category: "Effects", transform: combineStyle("̶") },
  { id: "underline", label: "Underline", category: "Effects", transform: combineStyle("̲") },
  { id: "double-under", label: "Double Underline", category: "Effects", transform: combineStyle("̳") },
  { id: "slash", label: "Slashed", category: "Effects", transform: combineStyle("̷") },
  { id: "upside", label: "Upside Down", category: "Effects", transform: flipStyle },
  { id: "glitch", label: "Glitch", category: "Effects", transform: zalgo },
];

export const STYLE_CATEGORIES: StyleCategory[] = ["Bold & Italic", "Cursive & Script", "Gothic", "Enclosed", "Aesthetic", "Effects"];

// ─── Decorations (wrap the text) ─────────────────────────────────────────────

export interface Decoration { id: string; label: string; wrap: (t: string) => string }

export const DECORATIONS: Decoration[] = [
  { id: "kawaii", label: "꧁ ꧂", wrap: (t) => `꧁${t}꧂` },
  { id: "star", label: "★ ★", wrap: (t) => `★彡 ${t} 彡★` },
  { id: "heart", label: "♡ ♡", wrap: (t) => `♡ ${t} ♡` },
  { id: "sparkle", label: "✦ ✦", wrap: (t) => `✦ ${t} ✦` },
  { id: "crown", label: "♛ ♛", wrap: (t) => `♛ ${t} ♛` },
  { id: "bracket", label: "『 』", wrap: (t) => `『${t}』` },
  { id: "corner", label: "「 」", wrap: (t) => `「${t}」` },
  { id: "wave", label: "≪ ≫", wrap: (t) => `≪ ${t} ≫` },
  { id: "fire", label: "🔥 🔥", wrap: (t) => `🔥 ${t} 🔥` },
  { id: "flower", label: "❀ ❀", wrap: (t) => `❀ ${t} ❀` },
  { id: "arrow", label: "➤ ", wrap: (t) => `➤ ${t}` },
  { id: "lenny", label: "( ͡° ͜ʖ ͡°)", wrap: (t) => `${t} ( ͡° ͜ʖ ͡°)` },
  { id: "katana", label: "︻デ═一", wrap: (t) => `${t} ︻デ═一` },
  { id: "dots", label: "•° °•", wrap: (t) => `•°${t}°•` },
  { id: "diamond", label: "◈ ◈", wrap: (t) => `◈ ${t} ◈` },
  { id: "skull", label: "☠ ☠", wrap: (t) => `☠ ${t} ☠` },
];

// ─── Symbol library ──────────────────────────────────────────────────────────

export const SYMBOL_GROUPS: { id: string; label: string; symbols: string[] }[] = [
  { id: "stars", label: "Stars", symbols: "★ ☆ ✦ ✧ ⭐ ✨ ⋆ ✩ ✫ ✬ ✭ ✮ ✯ ❋ ꙰ 𓆩 𓆪".split(" ") },
  { id: "hearts", label: "Hearts", symbols: "♡ ♥ ❤ ❥ ❣ 💕 💖 ღ ც♥ ❦ ❧ 𖥦 ♡̶".split(" ") },
  { id: "flowers", label: "Flowers", symbols: "✿ ❀ ❁ ✾ ❃ ❊ ⚘ 🌸 🌺 🌼 ｡✿ ✽".split(" ") },
  { id: "arrows", label: "Arrows", symbols: "→ ← ↑ ↓ ↔ ⇒ ⇐ ➤ ➜ ➔ ↪ ↬ ⤳ ➹ ➸".split(" ") },
  { id: "crowns", label: "Crowns", symbols: "♔ ♕ ♛ ♚ 👑 ꙰ ࿐ ꒰ ꒱ ☬".split(" ") },
  { id: "gaming", label: "Gaming", symbols: "⚔ ☠ ✠ ⚡ ♨ ⛧ 𒆜 ⩩ 〆 ☣ ⚜ ⛥ 米 气".split(" ") },
  { id: "japanese", label: "Japanese", symbols: "彡 〆 气 米 卄 丹 乇 几 爪 卂 尺 丅 ๛ ⁂ の".split(" ") },
  { id: "dividers", label: "Dividers", symbols: "•°• ✦•·· ─━─ ⋅•⋅ ✦⋆ ๑ ⊹ ⟡ ⊱ ⊰ ꒰꒱ ◈".split(" ") },
];

// ─── Username & bio generators ───────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const PREFIXES = ["꧁", "★彡", "☆", "༺", "▌│█║", "ᶜᵒᵒᴸ", "xX", "꧂", "⚡", "ꜱ", "༒"];
const SUFFIXES = ["꧂", "彡★", "☆", "༻", "║█│▌", "Xx", "⚡", "༒", "✿"];

export function generateUsernames(name: string): string[] {
  const base = (name || "Player").replace(/\s+/g, "");
  const styled = FANCY_STYLES.filter((s) => ["bold", "fraktur", "double-struck", "script", "bold-script", "small-caps", "fullwidth", "circled", "squared-neg"].includes(s.id));
  const out = new Set<string>();
  for (let i = 0; out.size < 10 && i < 60; i++) {
    const s = pick(styled);
    const styledName = s.transform(base);
    const variant = pick([
      `${pick(PREFIXES)}${styledName}${pick(SUFFIXES)}`,
      `${pick(DECORATIONS).wrap(styledName)}`,
      `${pick(["乂", "ꜱ", "꧁", "★", "༺"])}${styledName}${pick(["乂", "ꜱ", "꧂", "★", "༻"])}`,
      `${styledName}${pick(["⚡", "彡", "ツ", "亗", "꯭"])}`,
      `${pick(["xX", "ᴹᴿ", "ꜱᴋ", "ᴳᴼᴰ"])}${styledName}`,
    ]);
    out.add(variant);
  }
  return [...out];
}

export function generateBio(name: string): string {
  const n = (name || "your name").trim();
  const star = FANCY_STYLES.find((s) => s.id === "script")!;
  const small = FANCY_STYLES.find((s) => s.id === "small-caps")!;
  return [
    `꧁ ${star.transform(n)} ꧂`,
    "˗ˏˋ ✦ ´ˎ˗",
    `${small.transform("dreamer")} ⋆ ${small.transform("creator")} ⋆ ${small.transform("explorer")}`,
    "♡ welcome to my world ♡",
    "✧･ﾟ: *✧･ﾟ:* ✿ *:･ﾟ✧*:･ﾟ✧",
  ].join("\n");
}
