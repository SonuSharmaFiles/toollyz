// Tweet Character Counter engine. Implements the X/Twitter weighted-character
// rule: most code points count as 1, but CJK/Japanese ranges and most pictographs
// count as 2. URLs are normalised to the platform's t.co fixed length (23) for
// counting purposes, since the platform always rewrites them at send time.
//
// Refs: https://developer.x.com/en/docs/counting-characters

export const TWEET_LIMIT_FREE = 280;
export const TWEET_LIMIT_PREMIUM = 25000;
export const TWEET_LIMIT_PREMIUM_LONG = 4000; // "long" posts on Premium tier
export const TCO_URL_LENGTH = 23; // every URL is rewritten to t.co/abc23chars
const URL_RE =
  /(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+|www\.[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/gi;
const MENTION_RE = /(^|[^A-Za-z0-9_])@([A-Za-z0-9_]{1,15})/g;
const HASHTAG_RE = /(^|[^&A-Za-z0-9_])#([A-Za-z0-9_]+)/g;

// Twitter's "weighted" ranges from the v2 config — code points within these
// ranges count as 2 instead of 1. See twitter-text/config/v3.json.
const HEAVY_RANGES: [number, number][] = [
  [0x1100, 0x115f], // Hangul Jamo
  [0x2e80, 0x303e], // CJK radicals supplement
  [0x3041, 0x33ff], // Hiragana, Katakana, CJK symbols
  [0x3400, 0x4dbf], // CJK Unified Ideographs Ext A
  [0x4e00, 0x9fff], // CJK Unified Ideographs
  [0xa000, 0xa4cf], // Yi Syllables / Radicals
  [0xac00, 0xd7a3], // Hangul Syllables
  [0xf900, 0xfaff], // CJK Compatibility Ideographs
  [0xfe30, 0xfe4f], // CJK compatibility forms
  [0xff00, 0xff60], // Halfwidth/Fullwidth forms
  [0xffe0, 0xffe6],
  [0x20000, 0x2fffd], // CJK Ext B-F
  [0x30000, 0x3fffd], // CJK Ext G+
];

function isHeavy(cp: number): boolean {
  for (const [lo, hi] of HEAVY_RANGES) {
    if (cp >= lo && cp <= hi) return true;
    if (cp < lo) return false;
  }
  return false;
}

// Most pictographic emoji count as 2 (with ZWJ / VS-16 combinations
// collapsing to the same width). We approximate by treating any code point
// matched by \p{Extended_Pictographic} as heavy and skipping ZWJ joiners.
const ZWJ = 0x200d;
const VS16 = 0xfe0f;
const PICTO_RE = /\p{Extended_Pictographic}/u;

function weighOf(ch: string): number {
  const cp = ch.codePointAt(0);
  if (cp === undefined) return 0;
  if (cp === ZWJ || cp === VS16) return 0; // joiners are absorbed
  if (PICTO_RE.test(ch)) return 2;
  if (isHeavy(cp)) return 2;
  return 1;
}

export interface TweetWeight {
  /** Number of weighted units the tweet consumes. */
  weight: number;
  /** Raw [...string].length (Unicode code points, not UTF-16 units). */
  codepoints: number;
  /** Number of detected URLs (each counted as 23 weighted regardless of length). */
  urlCount: number;
  /** Saved units relative to the literal URL length (so UI can mention it). */
  urlSavings: number;
  /** Twitter @mentions present in the text. */
  mentions: string[];
  /** #hashtags present in the text. */
  hashtags: string[];
}

export function weighTweet(text: string): TweetWeight {
  if (!text) {
    return { weight: 0, codepoints: 0, urlCount: 0, urlSavings: 0, mentions: [], hashtags: [] };
  }

  // Replace URLs with a sentinel so they don't double-count.
  const urls = text.match(URL_RE) ?? [];
  const urlLiteralLen = urls.reduce((sum, u) => sum + [...u].length, 0);
  const stripped = text.replace(URL_RE, "");

  let weight = 0;
  let codepoints = 0;
  for (const ch of stripped) {
    weight += weighOf(ch);
    codepoints += 1;
  }
  // Each URL → fixed 23 char count (regardless of its real length).
  weight += urls.length * TCO_URL_LENGTH;
  codepoints += urlLiteralLen;

  const mentions: string[] = [];
  let mm: RegExpExecArray | null;
  const mentionRe = new RegExp(MENTION_RE.source, "g");
  while ((mm = mentionRe.exec(text))) mentions.push(`@${mm[2]}`);

  const hashtags: string[] = [];
  let hm: RegExpExecArray | null;
  const hashRe = new RegExp(HASHTAG_RE.source, "g");
  while ((hm = hashRe.exec(text))) hashtags.push(`#${hm[2]}`);

  return {
    weight,
    codepoints,
    urlCount: urls.length,
    urlSavings: Math.max(0, urlLiteralLen - urls.length * TCO_URL_LENGTH),
    mentions,
    hashtags,
  };
}

export type TweetLimitId = "free" | "long" | "premium";

export interface TweetLimit {
  id: TweetLimitId;
  label: string;
  limit: number;
  hint: string;
}

export const TWEET_LIMITS: TweetLimit[] = [
  { id: "free", label: "Standard post", limit: TWEET_LIMIT_FREE, hint: "Free X account · 280 weighted characters" },
  { id: "long", label: "Long post", limit: TWEET_LIMIT_PREMIUM_LONG, hint: "Premium Basic — up to 4 000 characters" },
  { id: "premium", label: "Premium+", limit: TWEET_LIMIT_PREMIUM, hint: "Premium+ — up to 25 000 characters" },
];

export type ZoneId = "empty" | "safe" | "warn" | "over";

export interface TweetState {
  used: number;
  remaining: number;
  ratio: number; // 0..1+ — over 1 means too long
  zone: ZoneId;
  limit: TweetLimit;
}

export function evaluateTweet(text: string, limit: TweetLimit): TweetState {
  const { weight } = weighTweet(text);
  const ratio = weight / limit.limit;
  let zone: ZoneId = "empty";
  if (weight === 0) zone = "empty";
  else if (ratio > 1) zone = "over";
  else if (ratio > 0.85) zone = "warn";
  else zone = "safe";
  return {
    used: weight,
    remaining: limit.limit - weight,
    ratio,
    zone,
    limit,
  };
}

// ─── Thread splitting ──────────────────────────────────────────────────────

export interface SplitOptions {
  /** Per-tweet weighted budget. */
  limit: number;
  /** "1/N" markers appended at the end of each piece. Set false to omit. */
  numbering: boolean;
  /** Optional emoji marker prefixed before the "1/N", eg "🧵 1/4". */
  threadMarker: string;
}

export const DEFAULT_SPLIT: SplitOptions = {
  limit: TWEET_LIMIT_FREE,
  numbering: true,
  threadMarker: "🧵",
};

/** Worst-case "x/yy" marker length, padded for 99 tweets. */
function markerCost(opts: SplitOptions, total: number): number {
  if (!opts.numbering) return 0;
  const totalDigits = String(total).length;
  const marker = `${opts.threadMarker ? `${opts.threadMarker} ` : ""}1/${"".padStart(totalDigits, "0") || "1"}`;
  // The leading space we'll prepend gives +1.
  return [...marker].length + 1;
}

function softSplit(input: string, budget: number): string[] {
  const out: string[] = [];
  let buf = "";
  // Prefer to break at the end of a sentence; fall back to whitespace; finally
  // hard-cut on weighted boundary if a single token is bigger than the budget.
  const tokens = input.split(/(\s+)/);

  function pushBuf() {
    if (buf.trim()) out.push(buf.trim());
    buf = "";
  }

  for (const t of tokens) {
    const candidate = buf + t;
    if (weighTweet(candidate).weight > budget) {
      // Look for the last sentence break in buf — that's the prettiest spot.
      // We scan manually to avoid the `s` regex flag (needs ES2018+ TS target).
      let breakAt = -1;
      for (let k = buf.length - 1; k >= 0; k--) {
        const c = buf[k];
        if ((c === "." || c === "!" || c === "?") && k + 1 < buf.length && /\s/.test(buf[k + 1])) {
          breakAt = k;
          break;
        }
      }
      if (breakAt >= 0) {
        const head = buf.slice(0, breakAt + 1).trim();
        const tail = buf.slice(breakAt + 1).replace(/^\s+/, "");
        out.push(head);
        buf = `${tail}${t}`;
        if (weighTweet(buf).weight > budget) {
          pushBuf();
          buf = t;
        }
      } else {
        pushBuf();
        buf = t;
      }
    } else {
      buf = candidate;
    }
    // Pathological case: a single word exceeds the budget — hard-cut on
    // weighted units so we never emit an oversize chunk.
    while (weighTweet(buf).weight > budget) {
      let cut = "";
      let w = 0;
      for (const ch of buf) {
        const cw = weighOf(ch);
        if (w + cw > budget) break;
        cut += ch;
        w += cw;
      }
      out.push(cut);
      buf = buf.slice(cut.length);
    }
  }
  pushBuf();
  return out;
}

export interface ThreadPiece {
  index: number;
  total: number;
  text: string;
  weight: number;
}

export function splitThread(text: string, opts: SplitOptions = DEFAULT_SPLIT): ThreadPiece[] {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];

  // Pessimistic first pass: budget is the limit minus a worst-case marker
  // estimate. We re-run with the real total once we know how many parts there
  // are so the numbering's actual cost is reflected.
  const firstBudget = Math.max(1, opts.limit - markerCost(opts, 99));
  const first = softSplit(clean, firstBudget);
  if (first.length === 0) return [];

  const realBudget = Math.max(1, opts.limit - markerCost(opts, first.length));
  const pieces = first.length === 1 ? first : softSplit(clean, realBudget);
  const total = pieces.length;

  return pieces.map((body, i) => {
    const marker = opts.numbering && total > 1
      ? ` ${opts.threadMarker ? `${opts.threadMarker} ` : ""}${i + 1}/${total}`
      : "";
    const composed = `${body}${marker}`.trim();
    const w = weighTweet(composed).weight;
    return { index: i + 1, total, text: composed, weight: w };
  });
}

export interface ThreadSummary {
  pieces: ThreadPiece[];
  totalPosts: number;
  totalWeight: number;
  fitsInOne: boolean;
}

export function summariseThread(text: string, opts: SplitOptions = DEFAULT_SPLIT): ThreadSummary {
  const pieces = splitThread(text, opts);
  const totalWeight = pieces.reduce((sum, p) => sum + p.weight, 0);
  return {
    pieces,
    totalPosts: pieces.length,
    totalWeight,
    fitsInOne: pieces.length <= 1,
  };
}
