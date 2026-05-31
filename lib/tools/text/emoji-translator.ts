// Emoji Translator engine. Bi-directional, keyword-driven, no API.
//
// text → emoji: replaces matched keywords with the primary emoji. The match
//   is whole-word, case-insensitive, longest-match-first. Words not in the
//   dictionary pass through unchanged.
// emoji → text: replaces each known emoji with the FIRST keyword (the
//   "canonical name") wrapped in `:colon-form:` for readability.
//
// The dictionary is intentionally small but covers the workhorse cases users
// reach for in chat: emotion, food, weather, animals, transport, hands.

export interface EmojiEntry {
  emoji: string;
  /** First keyword is the canonical name. Order matters for "emoji → text". */
  keywords: string[];
}

export const EMOJI_DICT: EmojiEntry[] = [
  // ── Faces / emotion ─────────────────────────────────────────────────────
  { emoji: "😀", keywords: ["happy", "smile", "grinning", "joy"] },
  { emoji: "😂", keywords: ["lol", "laugh", "haha", "lmao", "rofl"] },
  { emoji: "🥰", keywords: ["love", "loving", "adore"] },
  { emoji: "😍", keywords: ["love", "heart-eyes", "amazing"] },
  { emoji: "😎", keywords: ["cool", "sunglasses", "awesome"] },
  { emoji: "🤔", keywords: ["thinking", "hmm", "wonder"] },
  { emoji: "😢", keywords: ["sad", "crying", "tear"] },
  { emoji: "😭", keywords: ["crying", "sob", "bawling"] },
  { emoji: "😡", keywords: ["angry", "mad", "furious"] },
  { emoji: "😱", keywords: ["shocked", "scream", "wow"] },
  { emoji: "🙄", keywords: ["roll-eyes", "annoyed"] },
  { emoji: "😴", keywords: ["sleep", "sleeping", "tired"] },
  { emoji: "🥳", keywords: ["party", "celebrate", "congratulations"] },
  { emoji: "🤯", keywords: ["mindblown", "wow"] },
  { emoji: "🤗", keywords: ["hug", "hugging"] },
  { emoji: "😘", keywords: ["kiss", "kissing", "muah"] },
  { emoji: "🤩", keywords: ["star-struck", "stars", "wow"] },
  { emoji: "😅", keywords: ["sweat", "phew"] },
  { emoji: "🥺", keywords: ["pleading", "please"] },
  { emoji: "🤤", keywords: ["drooling", "yum"] },

  // ── Hands / gestures ────────────────────────────────────────────────────
  { emoji: "👍", keywords: ["thumbs-up", "yes", "ok", "approve"] },
  { emoji: "👎", keywords: ["thumbs-down", "no", "disapprove"] },
  { emoji: "👏", keywords: ["clap", "applause", "bravo"] },
  { emoji: "🙏", keywords: ["please", "thanks", "thank-you", "pray"] },
  { emoji: "👋", keywords: ["wave", "hi", "hello", "bye"] },
  { emoji: "🤝", keywords: ["handshake", "deal"] },
  { emoji: "🤘", keywords: ["rock", "metal"] },
  { emoji: "✌️", keywords: ["peace", "victory"] },
  { emoji: "🤞", keywords: ["fingers-crossed", "luck"] },
  { emoji: "👌", keywords: ["ok", "good", "perfect"] },
  { emoji: "💪", keywords: ["strong", "muscle", "flex"] },

  // ── Hearts / symbols ────────────────────────────────────────────────────
  { emoji: "❤️", keywords: ["love", "heart", "red-heart"] },
  { emoji: "💙", keywords: ["blue-heart"] },
  { emoji: "💚", keywords: ["green-heart"] },
  { emoji: "💛", keywords: ["yellow-heart"] },
  { emoji: "💜", keywords: ["purple-heart"] },
  { emoji: "🖤", keywords: ["black-heart"] },
  { emoji: "🧡", keywords: ["orange-heart"] },
  { emoji: "🤍", keywords: ["white-heart"] },
  { emoji: "💔", keywords: ["broken-heart", "heartbreak"] },
  { emoji: "💯", keywords: ["100", "hundred", "perfect"] },
  { emoji: "🔥", keywords: ["fire", "lit", "hot"] },
  { emoji: "✨", keywords: ["sparkles", "shiny"] },
  { emoji: "⭐", keywords: ["star"] },
  { emoji: "🌟", keywords: ["glow", "glowing-star"] },
  { emoji: "🎉", keywords: ["party", "celebrate", "tada"] },
  { emoji: "🎊", keywords: ["confetti", "celebrate"] },
  { emoji: "🚀", keywords: ["rocket", "launch", "ship"] },
  { emoji: "💡", keywords: ["idea", "lightbulb"] },
  { emoji: "⚡", keywords: ["lightning", "electric"] },
  { emoji: "🌈", keywords: ["rainbow"] },
  { emoji: "❓", keywords: ["question", "huh"] },
  { emoji: "❗", keywords: ["exclamation", "warning"] },
  { emoji: "⚠️", keywords: ["warning", "alert"] },
  { emoji: "✅", keywords: ["check", "done", "yes", "success"] },
  { emoji: "❌", keywords: ["x", "no", "wrong", "fail"] },

  // ── Food ────────────────────────────────────────────────────────────────
  { emoji: "🍕", keywords: ["pizza"] },
  { emoji: "🍔", keywords: ["burger", "hamburger"] },
  { emoji: "🍟", keywords: ["fries", "chips"] },
  { emoji: "🌭", keywords: ["hotdog", "hot-dog"] },
  { emoji: "🍣", keywords: ["sushi"] },
  { emoji: "🍜", keywords: ["ramen", "noodles"] },
  { emoji: "🍱", keywords: ["bento"] },
  { emoji: "🍦", keywords: ["icecream", "ice-cream"] },
  { emoji: "🍩", keywords: ["donut", "doughnut"] },
  { emoji: "🍪", keywords: ["cookie", "biscuit"] },
  { emoji: "🎂", keywords: ["cake", "birthday"] },
  { emoji: "🍫", keywords: ["chocolate"] },
  { emoji: "🍓", keywords: ["strawberry"] },
  { emoji: "🍎", keywords: ["apple"] },
  { emoji: "🍊", keywords: ["orange"] },
  { emoji: "🍌", keywords: ["banana"] },
  { emoji: "🍉", keywords: ["watermelon"] },
  { emoji: "🍇", keywords: ["grapes", "grape"] },
  { emoji: "🍍", keywords: ["pineapple"] },
  { emoji: "🥑", keywords: ["avocado"] },
  { emoji: "🍞", keywords: ["bread", "toast"] },
  { emoji: "🥐", keywords: ["croissant"] },
  { emoji: "🧀", keywords: ["cheese"] },
  { emoji: "🥚", keywords: ["egg"] },
  { emoji: "🥩", keywords: ["steak", "meat"] },
  { emoji: "🍗", keywords: ["chicken", "drumstick"] },

  // ── Drinks ──────────────────────────────────────────────────────────────
  { emoji: "☕", keywords: ["coffee"] },
  { emoji: "🍵", keywords: ["tea", "matcha"] },
  { emoji: "🍺", keywords: ["beer"] },
  { emoji: "🍷", keywords: ["wine"] },
  { emoji: "🥤", keywords: ["soda", "drink"] },
  { emoji: "🧃", keywords: ["juice"] },
  { emoji: "💧", keywords: ["water", "drop"] },

  // ── Animals ─────────────────────────────────────────────────────────────
  { emoji: "🐶", keywords: ["dog", "puppy"] },
  { emoji: "🐱", keywords: ["cat", "kitten"] },
  { emoji: "🐭", keywords: ["mouse"] },
  { emoji: "🐰", keywords: ["rabbit", "bunny"] },
  { emoji: "🐻", keywords: ["bear"] },
  { emoji: "🐼", keywords: ["panda"] },
  { emoji: "🐨", keywords: ["koala"] },
  { emoji: "🦁", keywords: ["lion"] },
  { emoji: "🐯", keywords: ["tiger"] },
  { emoji: "🐮", keywords: ["cow"] },
  { emoji: "🐷", keywords: ["pig"] },
  { emoji: "🐸", keywords: ["frog"] },
  { emoji: "🐧", keywords: ["penguin"] },
  { emoji: "🦄", keywords: ["unicorn"] },
  { emoji: "🦋", keywords: ["butterfly"] },
  { emoji: "🐝", keywords: ["bee"] },
  { emoji: "🐌", keywords: ["snail"] },
  { emoji: "🐙", keywords: ["octopus"] },
  { emoji: "🐬", keywords: ["dolphin"] },

  // ── Weather / nature ────────────────────────────────────────────────────
  { emoji: "☀️", keywords: ["sun", "sunny", "sunshine"] },
  { emoji: "🌙", keywords: ["moon", "night"] },
  { emoji: "🌧️", keywords: ["rain", "rainy"] },
  { emoji: "❄️", keywords: ["snow", "snowflake"] },
  { emoji: "☁️", keywords: ["cloud", "cloudy"] },
  { emoji: "🌊", keywords: ["wave", "ocean", "sea"] },
  { emoji: "🌸", keywords: ["flower", "blossom", "sakura"] },
  { emoji: "🌹", keywords: ["rose"] },
  { emoji: "🌻", keywords: ["sunflower"] },
  { emoji: "🌳", keywords: ["tree"] },
  { emoji: "🌴", keywords: ["palm-tree"] },

  // ── Transport ───────────────────────────────────────────────────────────
  { emoji: "🚗", keywords: ["car", "automobile"] },
  { emoji: "🚕", keywords: ["taxi"] },
  { emoji: "🚌", keywords: ["bus"] },
  { emoji: "🚲", keywords: ["bike", "bicycle"] },
  { emoji: "🛴", keywords: ["scooter"] },
  { emoji: "🏍️", keywords: ["motorcycle", "bike"] },
  { emoji: "✈️", keywords: ["plane", "airplane", "flight"] },
  { emoji: "🚂", keywords: ["train"] },
  { emoji: "🚢", keywords: ["ship", "boat"] },

  // ── Activities / tech ───────────────────────────────────────────────────
  { emoji: "💻", keywords: ["laptop", "computer", "code"] },
  { emoji: "📱", keywords: ["phone", "mobile"] },
  { emoji: "📷", keywords: ["camera", "photo"] },
  { emoji: "🎮", keywords: ["game", "gaming"] },
  { emoji: "🎵", keywords: ["music", "song", "note"] },
  { emoji: "🎶", keywords: ["music", "notes", "melody"] },
  { emoji: "📚", keywords: ["books", "reading", "study"] },
  { emoji: "📝", keywords: ["write", "note", "memo"] },
  { emoji: "💰", keywords: ["money", "cash", "bag"] },
  { emoji: "💸", keywords: ["money", "spending"] },
  { emoji: "🎁", keywords: ["gift", "present"] },
  { emoji: "💼", keywords: ["work", "job", "briefcase"] },
  { emoji: "🏠", keywords: ["home", "house"] },
  { emoji: "🏡", keywords: ["home", "house"] },
  { emoji: "🌍", keywords: ["world", "earth", "globe"] },
  { emoji: "🕐", keywords: ["time", "clock"] },
  { emoji: "📅", keywords: ["calendar", "date"] },
  { emoji: "💬", keywords: ["chat", "talk", "speech"] },
  { emoji: "🔍", keywords: ["search", "find"] },
  { emoji: "🔒", keywords: ["lock", "secure"] },
  { emoji: "🔑", keywords: ["key"] },
  { emoji: "🛒", keywords: ["cart", "shopping"] },
  { emoji: "🍿", keywords: ["popcorn", "movie"] },
  { emoji: "⚽", keywords: ["soccer", "football"] },
  { emoji: "🏀", keywords: ["basketball"] },
  { emoji: "🎾", keywords: ["tennis"] },
];

// Pre-build lookup maps for speed.
type Lookup = Map<string, string>;
let TEXT_TO_EMOJI: Lookup | null = null;
let EMOJI_TO_TEXT: Map<string, string> | null = null;

function buildLookups() {
  if (TEXT_TO_EMOJI && EMOJI_TO_TEXT) return;
  TEXT_TO_EMOJI = new Map();
  EMOJI_TO_TEXT = new Map();
  for (const entry of EMOJI_DICT) {
    EMOJI_TO_TEXT.set(entry.emoji, entry.keywords[0]);
    for (const k of entry.keywords) {
      // Only set the first time so longest-word entries don't overwrite.
      if (!TEXT_TO_EMOJI.has(k.toLowerCase())) {
        TEXT_TO_EMOJI.set(k.toLowerCase(), entry.emoji);
      }
    }
  }
}

export interface TextToEmojiOptions {
  /** When "replace", every match is replaced; "append" appends the emoji after the matched word. */
  mode: "replace" | "append";
  /** When true, multi-word phrases with the same key are tried longest-first. */
  longestMatchFirst: boolean;
}

export const DEFAULT_TEXT_TO_EMOJI: TextToEmojiOptions = {
  mode: "replace",
  longestMatchFirst: true,
};

export function textToEmoji(input: string, opt: TextToEmojiOptions = DEFAULT_TEXT_TO_EMOJI): string {
  if (!input) return "";
  buildLookups();
  const lookup = TEXT_TO_EMOJI!;

  // Tokenise into words and separators so we can preserve original spacing.
  const tokens = input.split(/(\W+)/u);
  const out: string[] = [];
  for (const tok of tokens) {
    if (!/\w/.test(tok)) {
      out.push(tok);
      continue;
    }
    const key = tok.toLowerCase();
    const emoji = lookup.get(key);
    if (emoji) {
      out.push(opt.mode === "append" ? `${tok} ${emoji}` : emoji);
    } else {
      // try stripping a trailing 's' for plural support
      const singular = key.endsWith("s") ? key.slice(0, -1) : "";
      const altEmoji = singular ? lookup.get(singular) : undefined;
      out.push(altEmoji ? (opt.mode === "append" ? `${tok} ${altEmoji}` : altEmoji) : tok);
    }
    void opt.longestMatchFirst; // reserved for future phrase matching
  }
  return out.join("");
}

export function emojiToText(input: string): string {
  if (!input) return "";
  buildLookups();
  const lookup = EMOJI_TO_TEXT!;
  // Split graphemes so we keep ZWJ-joined emoji intact.
  const segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;
  const graphemes: string[] = segmenter
    ? Array.from(segmenter.segment(input), (s) => s.segment)
    : [...input];
  let out = "";
  for (const g of graphemes) {
    const name = lookup.get(g);
    if (name) {
      out += `:${name}:`;
    } else {
      out += g;
    }
  }
  return out;
}

export interface TranslateStats {
  /** Number of source words/graphemes that matched a known entry. */
  matches: number;
  /** Total words considered in text→emoji direction. */
  words: number;
  /** Coverage 0–1 = matches / words (text→emoji). */
  coverage: number;
  /** Number of emoji recognised in input (emoji→text direction). */
  emojiSeen: number;
}

export function statsText(input: string): TranslateStats {
  if (!input) return { matches: 0, words: 0, coverage: 0, emojiSeen: 0 };
  buildLookups();
  const lookup = TEXT_TO_EMOJI!;
  let matches = 0;
  let words = 0;
  for (const m of input.matchAll(/[\p{L}\p{N}]+/gu)) {
    words++;
    if (lookup.has(m[0].toLowerCase())) matches++;
  }
  return { matches, words, coverage: words === 0 ? 0 : matches / words, emojiSeen: 0 };
}

export function statsEmoji(input: string): TranslateStats {
  if (!input) return { matches: 0, words: 0, coverage: 0, emojiSeen: 0 };
  buildLookups();
  const lookup = EMOJI_TO_TEXT!;
  const segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;
  const graphemes = segmenter
    ? Array.from(segmenter.segment(input), (s) => s.segment)
    : [...input];
  let emojiSeen = 0;
  let matches = 0;
  for (const g of graphemes) {
    if (/\p{Extended_Pictographic}/u.test(g)) {
      emojiSeen++;
      if (lookup.has(g)) matches++;
    }
  }
  return { matches, words: 0, coverage: emojiSeen === 0 ? 0 : matches / emojiSeen, emojiSeen };
}
