// Instagram Caption Formatter engine. Instagram strips many forms of
// formatting on Web → mobile and silently collapses blank lines. This module
// applies the standard workarounds:
//   - Replace blank lines with a zero-width / invisible-separator character
//     so the gap survives (the "ig line break trick").
//   - Add a single invisible spacer line between the body and the hashtag
//     block so hashtags drop below the "more" fold.
//   - Cap the caption at 2,200 visible characters (Instagram's limit) and
//     surface a warning when the post will be truncated.
//   - Track hashtag count against Instagram's 30-max rule and recommend the
//     5–11 hashtag sweet spot.

import { applyStyle, buildHashtags, DEFAULT_HASHTAGS } from "./social-post";
import type { HashtagInput, SocialStyleId } from "./social-post";

export const INSTAGRAM_LIMIT = 2200;
export const INSTAGRAM_MORE_CUTOFF = 125; // ~125 characters before "...more"
export const INSTAGRAM_MAX_HASHTAGS = 30;
export const INSTAGRAM_HASHTAG_SWEETSPOT = [5, 11] as const;

// Instagram is the platform that's most reliable with U+2063 INVISIBLE SEPARATOR.
// We avoid U+200B ZERO WIDTH SPACE because Meta's spam filter has historically
// flagged it.
const SPACER = "⁣";

export type InstagramStyleId = SocialStyleId | "none";

export interface InstagramInput {
  body: string;
  /** Style for the entire caption body. */
  bodyStyle: InstagramStyleId;
  hashtags: HashtagInput;
  /** Add an invisible separator line between body and hashtag block. */
  hideHashtagsBelowMore: boolean;
  /** How many invisible "spacer" lines between body and hashtags. */
  spacerLines: number;
}

export const DEFAULT_INSTAGRAM_INPUT: InstagramInput = {
  body: "",
  bodyStyle: "none",
  hashtags: { ...DEFAULT_HASHTAGS, newlineBefore: false, dedupe: true, ensureHash: true },
  hideHashtagsBelowMore: true,
  spacerLines: 5,
};

export interface InstagramOutput {
  composed: string;
  characters: number;
  visibleCharacters: number;
  hookText: string;
  hashtagCount: number;
  remainingHashtagSlots: number;
  warnings: string[];
}

/** Preserve blank lines by replacing each empty line with the invisible
 *  separator. Instagram strips genuinely-empty newlines on mobile. */
function fixLineBreaks(text: string): string {
  return text
    .split("\n")
    .map((line) => (line.trim() === "" ? SPACER : line))
    .join("\n");
}

/** Strip invisible separator characters so we report a "human" character
 *  count alongside Instagram's stricter count. */
function visibleLength(text: string): number {
  return [...text.replace(/[​‌‍⁠⁣]/g, "")].length;
}

export function composeInstagramCaption(input: InstagramInput): InstagramOutput {
  const styledBody = input.bodyStyle === "none" ? input.body : applyStyle(input.body, input.bodyStyle);
  const fixed = fixLineBreaks(styledBody);
  const tagsRaw = buildHashtags({ ...input.hashtags, newlineBefore: false });

  let composed = fixed;
  if (tagsRaw) {
    if (input.hideHashtagsBelowMore) {
      const spacerCount = Math.max(0, Math.min(8, input.spacerLines));
      const block = Array.from({ length: spacerCount }, () => SPACER).join("\n");
      composed = `${fixed}\n${block}\n${tagsRaw}`;
    } else {
      composed = `${fixed}\n\n${tagsRaw}`;
    }
  }

  const characters = [...composed].length;
  const vis = visibleLength(composed);
  const arr = [...composed];
  const hookText = arr.slice(0, INSTAGRAM_MORE_CUTOFF).join("");
  const hashtagCount = (composed.match(/#\w+/g) ?? []).length;
  const remainingHashtagSlots = Math.max(0, INSTAGRAM_MAX_HASHTAGS - hashtagCount);

  const warnings: string[] = [];
  if (characters > INSTAGRAM_LIMIT)
    warnings.push(`Caption is ${characters - INSTAGRAM_LIMIT} chars over Instagram's ${INSTAGRAM_LIMIT}-char limit.`);
  if (hashtagCount > INSTAGRAM_MAX_HASHTAGS)
    warnings.push(`Instagram allows at most ${INSTAGRAM_MAX_HASHTAGS} hashtags per post.`);
  if (hashtagCount > 0 && hashtagCount < INSTAGRAM_HASHTAG_SWEETSPOT[0])
    warnings.push(`Use ${INSTAGRAM_HASHTAG_SWEETSPOT[0]}–${INSTAGRAM_HASHTAG_SWEETSPOT[1]} hashtags for the best discoverability — currently using ${hashtagCount}.`);
  if (input.bodyStyle !== "none" && /\p{Extended_Pictographic}/u.test(input.body))
    warnings.push("Unicode style transforms don't apply to emoji — they pass through as the original glyphs.");

  return {
    composed,
    characters,
    visibleCharacters: vis,
    hookText,
    hashtagCount,
    remainingHashtagSlots,
    warnings,
  };
}
