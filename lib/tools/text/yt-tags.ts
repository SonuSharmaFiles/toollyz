// YouTube Tag Extractor engine. Takes a video description (or any text)
// and pulls out three categories of "tags":
//   1) hashtags — #word followed by alphanum/underscore. YT shows these
//      above the title and indexes them; first three appear on the page.
//   2) comma-separated tags — many creators paste `tag1, tag2, tag3` at
//      the end of the description for crawlers.
//   3) keywords — the highest-density bigrams / trigrams after removing
//      stop words. Mimics what YT would surface from on-page text.
//
// Returns counts (hashtag chars vs 60-char YT limit, total tags vs 500
// soft-limit) and a recommended copy-paste block.

export interface YtTagsResult {
  hashtags: string[];
  /** Comma-separated 'tags:' style. */
  commaTags: string[];
  keywords: string[];
  stats: {
    hashtagChars: number;
    /** YT shows max 60 chars worth of hashtags above the title. */
    hashtagsLimitOk: boolean;
    /** YT enforces 500-char tag-string cap on the back-end. */
    commaTagsChars: number;
    commaTagsLimitOk: boolean;
  };
  copyBlock: string;
}

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have",
  "he", "in", "is", "it", "its", "of", "on", "or", "that", "the", "to", "was",
  "were", "will", "with", "you", "your", "i", "we", "they", "this", "but", "not",
  "if", "then", "so", "do", "does", "did", "my", "me", "our", "us", "their",
  "them", "she", "him", "her", "his", "what", "when", "where", "who", "why",
  "how", "more", "less", "than", "all", "any", "some", "no", "yes", "can",
  "just", "now", "today", "tomorrow", "yesterday", "very", "really",
]);

export function analyse(text: string): YtTagsResult {
  // 1) Hashtags
  const hashSeen = new Set<string>();
  const hashtags: string[] = [];
  for (const m of text.matchAll(/#([\p{L}0-9_]+)/giu)) {
    const tag = m[1].toLowerCase();
    if (hashSeen.has(tag)) continue;
    hashSeen.add(tag);
    hashtags.push(`#${m[1]}`);
  }

  // 2) Comma-separated tags — look for sections like `tags: a, b, c` or
  // the last 3 lines if they look like a list.
  const commaSet = new Set<string>();
  const commaTags: string[] = [];
  const labelMatch = /(?:^|\n)\s*(?:tags|keywords|labels)\s*[:\-=]\s*([\s\S]+?)(?:\n\s*\n|$)/i.exec(text);
  if (labelMatch) {
    for (const raw of labelMatch[1].split(/[,;\n]/)) {
      const tag = raw.trim().replace(/^#/, "");
      if (tag && tag.length <= 50 && !commaSet.has(tag.toLowerCase())) {
        commaSet.add(tag.toLowerCase());
        commaTags.push(tag);
      }
    }
  } else {
    // Otherwise infer from the last line if it has ≥ 5 commas.
    const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 4); i--) {
      const commas = (lines[i].match(/,/g) ?? []).length;
      if (commas >= 4) {
        for (const raw of lines[i].split(/[,;]/)) {
          const tag = raw.trim().replace(/^#/, "");
          if (tag && tag.length <= 50 && !commaSet.has(tag.toLowerCase())) {
            commaSet.add(tag.toLowerCase());
            commaTags.push(tag);
          }
        }
        break;
      }
    }
  }

  // 3) Keyword extraction — unigrams and bigrams, frequency-ranked.
  const cleaned = text
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[#@][\p{L}0-9_]+/giu, " ")
    .replace(/[^\p{L}0-9 \-']/giu, " ")
    .toLowerCase();
  const words = cleaned.split(/\s+/).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  const uniFreq = new Map<string, number>();
  for (const w of words) uniFreq.set(w, (uniFreq.get(w) ?? 0) + 1);
  const biFreq = new Map<string, number>();
  for (let i = 0; i < words.length - 1; i++) {
    const bi = `${words[i]} ${words[i + 1]}`;
    biFreq.set(bi, (biFreq.get(bi) ?? 0) + 1);
  }
  const keywords: string[] = [];
  const ranked = [
    ...Array.from(biFreq.entries()).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]),
    ...Array.from(uniFreq.entries()).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]),
  ];
  const seen = new Set<string>();
  for (const [k] of ranked) {
    if (seen.has(k)) continue;
    seen.add(k);
    keywords.push(k);
    if (keywords.length >= 24) break;
  }

  // Stats
  const hashtagChars = hashtags.join(" ").length;
  const commaTagsChars = commaTags.join(", ").length;

  const copyBlock = [
    hashtags.length ? hashtags.slice(0, 12).join(" ") : "",
    commaTags.length || keywords.length
      ? [...commaTags, ...keywords.filter((k) => !commaTags.some((c) => c.toLowerCase() === k))]
          .slice(0, 40)
          .join(", ")
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    hashtags,
    commaTags,
    keywords,
    stats: {
      hashtagChars,
      hashtagsLimitOk: hashtagChars <= 60,
      commaTagsChars,
      commaTagsLimitOk: commaTagsChars <= 500,
    },
    copyBlock,
  };
}

export const SAMPLE_DESCRIPTION = `Welcome back to the channel! Today we're building a privacy-first
toolbox in the browser using Next.js 16 and Tailwind. We'll cover the
registry-driven architecture, dynamic imports, and how to ship over 250
tools without a single backend.

If this video helped you, please like and subscribe!

Chapters:
00:00 Intro
01:42 Registry pattern
06:30 Dynamic imports
11:05 Tailwind + shadcn
17:22 Outro

#nextjs #webdev #typescript #toollyz #opensource

tags: next.js 16, app router, static export, tailwind css, shadcn ui,
typescript, browser tools, privacy first, no backend, react server
components, jamstack, vercel`;
