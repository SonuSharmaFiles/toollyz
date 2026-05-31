// LinkedIn Post Formatter engine. Built on top of the social-post formatter
// but with LinkedIn-specific knowledge:
//   - Posts get truncated with "…see more" around 210 characters on the feed,
//     so we surface a hook score and underline the cut-off.
//   - LinkedIn collapses standalone blank lines on mobile; we use the same
//     zero-width spacer trick as social-post for reliable rendering.
//   - The platform supports up to ~3 000 characters and ~30 hashtags but
//     posts perform best with 3–5 niche hashtags at the bottom.

import { applySpacing, applyStyle, buildHashtags, DEFAULT_HASHTAGS } from "./social-post";
import type { HashtagInput, SocialStyleId, SpacingOptions } from "./social-post";

export const LINKEDIN_LIMIT = 3000;
export const LINKEDIN_HOOK_CUTOFF = 210;
export const LINKEDIN_HASHTAG_SWEETSPOT = 5;

export type LinkedinStyleId = SocialStyleId | "none";

export interface LinkedinInput {
  body: string;
  /** Style applied to the WHOLE body (everything). */
  bodyStyle: LinkedinStyleId;
  /** Style applied ONLY to the first line — emphasises the hook. */
  hookStyle: LinkedinStyleId;
  hashtags: HashtagInput;
  spacing: SpacingOptions;
}

export const DEFAULT_LINKEDIN_INPUT: LinkedinInput = {
  body: "",
  bodyStyle: "none",
  hookStyle: "bold",
  hashtags: { ...DEFAULT_HASHTAGS },
  spacing: { preserveBlankLines: true, doubleSpace: false },
};

export interface LinkedinOutput {
  composed: string;
  characters: number;
  /** The first ~210 characters as the user will see them before "see more". */
  hookText: string;
  /** Characters in the hook (out of LINKEDIN_HOOK_CUTOFF). */
  hookChars: number;
  hashtagCount: number;
  lines: number;
  warnings: string[];
  /** Where the "…see more" cut lands inside the composed string. */
  cutoffAt: number;
}

function styleLine(text: string, style: LinkedinStyleId): string {
  return style === "none" ? text : applyStyle(text, style);
}

export function composeLinkedinPost(input: LinkedinInput): LinkedinOutput {
  const lines = input.body.split("\n");
  let bodyText: string;
  if (input.hookStyle !== "none" && lines.length > 0 && lines[0].trim() !== "") {
    const head = styleLine(lines[0], input.hookStyle);
    const rest = lines.slice(1).join("\n");
    const restStyled = input.bodyStyle === "none" ? rest : styleLine(rest, input.bodyStyle);
    bodyText = restStyled ? `${head}\n${restStyled}` : head;
  } else if (input.bodyStyle !== "none") {
    bodyText = styleLine(input.body, input.bodyStyle);
  } else {
    bodyText = input.body;
  }

  const spaced = applySpacing(bodyText, input.spacing);
  const tagsBlock = buildHashtags(input.hashtags);
  const composed = `${spaced}${tagsBlock}`;
  const characters = [...composed].length;
  const lineCount = composed.split("\n").length;
  const hashtagCount = (composed.match(/#\w+/g) ?? []).length;

  // Hook preview = first N visible characters (by Unicode code point).
  const arr = [...composed];
  const hookText = arr.slice(0, LINKEDIN_HOOK_CUTOFF).join("");
  const hookChars = arr.slice(0, LINKEDIN_HOOK_CUTOFF).length;
  const cutoffAt = characters > LINKEDIN_HOOK_CUTOFF ? LINKEDIN_HOOK_CUTOFF : characters;

  const warnings: string[] = [];
  if (characters > LINKEDIN_LIMIT)
    warnings.push(`Post is ${characters - LINKEDIN_LIMIT} chars over LinkedIn's ${LINKEDIN_LIMIT}-character limit.`);
  if (hashtagCount > 10)
    warnings.push(`Used ${hashtagCount} hashtags — LinkedIn rewards 3–5 niche tags far more than long hashtag walls.`);
  if (lines[0] && lines[0].length > LINKEDIN_HOOK_CUTOFF)
    warnings.push("First line is already past the 210-char hook cutoff — readers will see '…see more' before your point lands.");

  return {
    composed,
    characters,
    hookText,
    hookChars,
    hashtagCount,
    lines: lineCount,
    warnings,
    cutoffAt,
  };
}

export interface HookCheck {
  id: "length" | "question" | "number" | "emoji" | "you";
  label: string;
  passed: boolean;
  hint: string;
}

export function evaluateHook(firstLine: string): HookCheck[] {
  const trimmed = firstLine.trim();
  return [
    {
      id: "length",
      label: "Hook ≤ 210 chars",
      passed: [...trimmed].length <= LINKEDIN_HOOK_CUTOFF,
      hint: "Keep the first line short so the whole hook shows before '…see more'.",
    },
    {
      id: "question",
      label: "Asks a question or makes a claim",
      passed: /[?]/.test(trimmed) || /^(?:i (?:just|finally|learned|noticed|realised))/i.test(trimmed),
      hint: "Open with a question, a bold claim or a vulnerable confession — they outperform bland statements.",
    },
    {
      id: "number",
      label: "Contains a number",
      passed: /\d/.test(trimmed),
      hint: "Numbers in the hook ('5 lessons…', 'After 12 months…') stop the scroll.",
    },
    {
      id: "emoji",
      label: "Has at most one emoji",
      passed: [...trimmed.matchAll(/\p{Extended_Pictographic}/gu)].length <= 1,
      hint: "More than one emoji in the hook reads as spammy.",
    },
    {
      id: "you",
      label: "Talks to the reader",
      passed: /\byou\b|\byour\b/i.test(trimmed),
      hint: "Use 'you' / 'your' early — it makes the post feel personal.",
    },
  ];
}
