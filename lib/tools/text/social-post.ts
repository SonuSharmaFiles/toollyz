// Social Media Post Formatter engine. Applies Unicode-Mathematical-Alphanumeric
// styles (bold / italic / bold-italic / sans / mono / strike / underline) so
// the formatting survives copy-paste into platforms that strip rich text:
// X / Twitter, Mastodon, Bluesky, Facebook, Threads, Reddit.
//
// We also produce safe "line break boosters" — short zero-width-joiner sequences
// that prevent platforms from collapsing standalone newlines into single spaces.

import { FANCY_STYLES } from "./fancy-text";

export type SocialStyleId =
  | "bold"
  | "italic"
  | "bold-italic"
  | "sans-bold"
  | "sans-italic"
  | "sans-bold-italic"
  | "mono"
  | "strike"
  | "underline"
  | "small-caps";

export interface SocialStyleMeta {
  id: SocialStyleId;
  label: string;
  hint: string;
}

export const SOCIAL_STYLES: SocialStyleMeta[] = [
  { id: "bold", label: "Bold", hint: "𝐁𝐨𝐥𝐝 — works everywhere" },
  { id: "italic", label: "Italic", hint: "𝐼𝑡𝑎𝑙𝑖𝑐" },
  { id: "bold-italic", label: "Bold + Italic", hint: "𝑩𝒐𝒍𝒅 𝑰𝒕𝒂𝒍𝒊𝒄" },
  { id: "sans-bold", label: "Sans Bold", hint: "𝗦𝗮𝗻𝘀 𝗕𝗼𝗹𝗱" },
  { id: "sans-italic", label: "Sans Italic", hint: "𝘚𝘢𝘯𝘴 𝘐𝘵𝘢𝘭𝘪𝘤" },
  { id: "sans-bold-italic", label: "Sans Bold Italic", hint: "𝙎𝙖𝙣𝙨 𝘽𝙊𝙇𝘿 𝙄𝙏𝘼𝙇𝙄𝘾" },
  { id: "mono", label: "Monospace", hint: "𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎" },
  { id: "small-caps", label: "Small Caps", hint: "sᴍᴀʟʟ ᴄᴀᴘs" },
  { id: "strike", label: "Strikethrough", hint: "S̶t̶r̶i̶k̶e̶" },
  { id: "underline", label: "Underline", hint: "U̲n̲d̲e̲r̲l̲i̲n̲e̲" },
];

function styleFor(id: SocialStyleId) {
  return FANCY_STYLES.find((s) => s.id === id)?.transform ?? ((t: string) => t);
}

export function applyStyle(text: string, id: SocialStyleId): string {
  return styleFor(id)(text);
}

// ─── Line-break boosters ───────────────────────────────────────────────────
//
// Platforms collapse consecutive newlines or short whitespace-only lines.
// Inserting an invisible "spacer" character on otherwise-empty lines forces
// the gap to render. Zero-width characters work best — they take no visible
// space but count as content.

const SPACER = "⁣"; // U+2063 INVISIBLE SEPARATOR

export interface SpacingOptions {
  /** Replace empty lines with an invisible spacer so the gap survives. */
  preserveBlankLines: boolean;
  /** When >1, expand consecutive newlines so each blank gets the spacer. */
  doubleSpace: boolean;
}

export const DEFAULT_SPACING: SpacingOptions = {
  preserveBlankLines: true,
  doubleSpace: false,
};

export function applySpacing(text: string, opt: SpacingOptions = DEFAULT_SPACING): string {
  if (!opt.preserveBlankLines && !opt.doubleSpace) return text;
  let out = text;
  if (opt.preserveBlankLines) {
    // Any line that's empty after trim → replace its content with the spacer.
    out = out
      .split("\n")
      .map((line) => (line.trim() === "" ? SPACER : line))
      .join("\n");
  }
  if (opt.doubleSpace) {
    out = out.split("\n").join(`\n${SPACER}\n`);
  }
  return out;
}

// ─── Hashtags / mentions ───────────────────────────────────────────────────

export interface HashtagInput {
  /** Free-text input the user types — may contain mixed commas / spaces / # / @. */
  raw: string;
  /** Drop duplicates (case-insensitive). */
  dedupe: boolean;
  /** Insert a hard newline before the hashtag block. */
  newlineBefore: boolean;
  /** Add the # prefix automatically when missing. */
  ensureHash: boolean;
  /** Lowercase the tag body. */
  lowercase: boolean;
}

export const DEFAULT_HASHTAGS: HashtagInput = {
  raw: "",
  dedupe: true,
  newlineBefore: true,
  ensureHash: true,
  lowercase: false,
};

export function buildHashtags(opt: HashtagInput): string {
  const tokens = opt.raw
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tokens) {
    let tag = t.replace(/^[#＃]+/, "").replace(/[^\p{L}\p{N}_]/gu, "");
    if (!tag) continue;
    if (opt.lowercase) tag = tag.toLowerCase();
    const key = tag.toLowerCase();
    if (opt.dedupe && seen.has(key)) continue;
    seen.add(key);
    out.push(`${opt.ensureHash ? "#" : ""}${tag}`);
  }
  if (out.length === 0) return "";
  return opt.newlineBefore ? `\n\n${out.join(" ")}` : out.join(" ");
}

// ─── Composite formatter ───────────────────────────────────────────────────

export interface PostInput {
  body: string;
  hashtags: HashtagInput;
  spacing: SpacingOptions;
  /** Style id applied to the entire body when not "none". */
  bodyStyle: SocialStyleId | "none";
}

export interface PostOutput {
  composed: string;
  characters: number;
  lines: number;
  hashtagCount: number;
  warnings: string[];
}

export function composePost(input: PostInput): PostOutput {
  const styled = input.bodyStyle === "none" ? input.body : applyStyle(input.body, input.bodyStyle);
  const spaced = applySpacing(styled, input.spacing);
  const tags = buildHashtags(input.hashtags);
  const composed = `${spaced}${tags}`;
  const characters = [...composed].length;
  const lines = composed.split("\n").length;
  const hashtagCount = (composed.match(/#\w+/g) ?? []).length;
  const warnings: string[] = [];
  if (characters > 5000) warnings.push("Some platforms (Twitter free, Mastodon default) won't accept posts this long.");
  if (input.bodyStyle === "strike" || input.bodyStyle === "underline")
    warnings.push("Combining marks (strike / underline) can render poorly on some Android keyboards.");
  return { composed, characters, lines, hashtagCount, warnings };
}
