// Sentence Rewriter engine. Heuristic, offline — produces multiple
// candidate rewrites of a sentence with adjustable tone and length.
// Not a language model: we apply rule-based transformations + a curated
// synonym thesaurus to surface workable variations the writer can pick from.

export type Tone = "formal" | "casual" | "concise" | "expanded" | "persuasive" | "passive-voice" | "active-voice";

export interface ToneMeta {
  id: Tone;
  label: string;
  hint: string;
}

export const TONES: ToneMeta[] = [
  { id: "formal", label: "More formal", hint: "Replace contractions and casual fillers with full forms." },
  { id: "casual", label: "More casual", hint: "Contractions, shorter words, friendlier transitions." },
  { id: "concise", label: "More concise", hint: "Cut filler phrases and redundant qualifiers." },
  { id: "expanded", label: "More descriptive", hint: "Add context, transitions, and qualifiers." },
  { id: "persuasive", label: "More persuasive", hint: "Add active verbs, stronger claims, addressee 'you'." },
  { id: "passive-voice", label: "Passive voice", hint: "Convert active subjects into passive constructions." },
  { id: "active-voice", label: "Active voice", hint: "Detect passive markers and rewrite as active." },
];

// ── Small curated thesaurus — about 150 entries that cover the workhorse
//    swaps writers reach for. We keep it tight so substitutions stay
//    grounded; a sprawling thesaurus would produce ungrammatical noise.

const SYNONYMS: Record<string, string[]> = {
  // Verbs
  use: ["utilise", "employ", "leverage"],
  used: ["utilised", "employed", "leveraged"],
  make: ["create", "produce", "build", "craft"],
  makes: ["creates", "produces", "builds"],
  made: ["created", "produced", "crafted"],
  start: ["begin", "kick off", "launch"],
  started: ["began", "kicked off", "launched"],
  end: ["finish", "conclude", "wrap up"],
  show: ["demonstrate", "reveal", "highlight", "showcase"],
  showed: ["demonstrated", "revealed", "highlighted"],
  show_n: ["demonstration", "reveal"],
  help: ["assist", "support", "aid"],
  helped: ["assisted", "supported"],
  find: ["discover", "spot", "uncover"],
  found: ["discovered", "spotted", "uncovered"],
  get: ["obtain", "receive", "fetch"],
  got: ["obtained", "received"],
  give: ["provide", "offer", "deliver"],
  gave: ["provided", "offered", "delivered"],
  see: ["observe", "notice", "spot"],
  saw: ["observed", "noticed"],
  think: ["consider", "believe", "reason"],
  thought: ["considered", "believed"],
  say: ["state", "remark", "note"],
  said: ["stated", "remarked", "noted"],
  ask: ["request", "inquire", "enquire"],
  asked: ["requested", "inquired"],
  know: ["understand", "be aware of", "recognise"],
  knew: ["understood", "recognised"],

  // Adjectives
  good: ["solid", "excellent", "strong", "robust"],
  great: ["outstanding", "remarkable", "exceptional"],
  big: ["significant", "substantial", "sizeable"],
  small: ["minor", "compact", "modest"],
  important: ["crucial", "vital", "essential"],
  fast: ["quick", "rapid", "swift"],
  slow: ["sluggish", "gradual", "measured"],
  easy: ["straightforward", "simple", "effortless"],
  hard: ["difficult", "challenging", "demanding"],
  new: ["fresh", "novel", "recent"],
  old: ["established", "long-standing", "veteran"],
  bad: ["poor", "subpar", "lacking"],
  many: ["numerous", "plenty of", "a wealth of"],
  few: ["a handful of", "limited", "scarce"],

  // Adverbs / qualifiers
  very: ["highly", "remarkably", "particularly"],
  really: ["genuinely", "truly", "noticeably"],
  often: ["frequently", "regularly", "commonly"],
  always: ["consistently", "without fail"],
  never: ["at no point", "by no means"],

  // Common connector / opener swaps
  but: ["however", "yet"],
  and: ["plus", "as well as"],
  so: ["therefore", "as a result"],
  also: ["additionally", "moreover"],
  because: ["since", "as", "given that"],
};

// Filler phrases that "concise" mode strips out.
const FILLER_PHRASES = [
  /\bin order to\b/gi,
  /\bdue to the fact that\b/gi,
  /\bat the end of the day\b/gi,
  /\bat this point in time\b/gi,
  /\bin the event that\b/gi,
  /\bjust\b/gi,
  /\bactually\b/gi,
  /\bbasically\b/gi,
  /\bvery\b/gi,
  /\breally\b/gi,
  /\bquite\b/gi,
];

const FILLER_REPLACEMENTS: Record<string, string> = {
  "in order to": "to",
  "due to the fact that": "because",
  "at the end of the day": "ultimately",
  "at this point in time": "now",
  "in the event that": "if",
};

// Contraction maps
const TO_CONTRACTIONS: Array<[RegExp, string]> = [
  [/\bdo not\b/gi, "don't"],
  [/\bdoes not\b/gi, "doesn't"],
  [/\bdid not\b/gi, "didn't"],
  [/\bcannot\b/gi, "can't"],
  [/\bcan not\b/gi, "can't"],
  [/\bwill not\b/gi, "won't"],
  [/\bwould not\b/gi, "wouldn't"],
  [/\bshould not\b/gi, "shouldn't"],
  [/\bare not\b/gi, "aren't"],
  [/\bis not\b/gi, "isn't"],
  [/\bwas not\b/gi, "wasn't"],
  [/\bwere not\b/gi, "weren't"],
  [/\bhave not\b/gi, "haven't"],
  [/\bhas not\b/gi, "hasn't"],
  [/\bhad not\b/gi, "hadn't"],
  [/\bI am\b/g, "I'm"],
  [/\byou are\b/gi, "you're"],
  [/\bwe are\b/gi, "we're"],
  [/\bthey are\b/gi, "they're"],
  [/\bit is\b/gi, "it's"],
  [/\bthat is\b/gi, "that's"],
  [/\bwill\b/gi, "'ll"],
];

const FROM_CONTRACTIONS: Array<[RegExp, string]> = [
  [/\bdon't\b/gi, "do not"],
  [/\bdoesn't\b/gi, "does not"],
  [/\bdidn't\b/gi, "did not"],
  [/\bcan't\b/gi, "cannot"],
  [/\bwon't\b/gi, "will not"],
  [/\bwouldn't\b/gi, "would not"],
  [/\bshouldn't\b/gi, "should not"],
  [/\baren't\b/gi, "are not"],
  [/\bisn't\b/gi, "is not"],
  [/\bwasn't\b/gi, "was not"],
  [/\bweren't\b/gi, "were not"],
  [/\bhaven't\b/gi, "have not"],
  [/\bhasn't\b/gi, "has not"],
  [/\bhadn't\b/gi, "had not"],
  [/\bI'm\b/g, "I am"],
  [/\byou're\b/gi, "you are"],
  [/\bwe're\b/gi, "we are"],
  [/\bthey're\b/gi, "they are"],
  [/\bit's\b/gi, "it is"],
  [/\bthat's\b/gi, "that is"],
];

const PERSUASIVE_TRANSITIONS = [
  "Notice that ",
  "Imagine if ",
  "Here's the thing: ",
  "The truth is ",
];

function preserveCase(original: string, replacement: string): string {
  if (!original) return replacement;
  if (original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function applySynonymSwap(sentence: string, intensity: number): string {
  const words = sentence.split(/(\s+|[.,;:!?])/);
  const candidates: number[] = [];
  for (let i = 0; i < words.length; i++) {
    const key = words[i].toLowerCase();
    if (SYNONYMS[key]) candidates.push(i);
  }
  // Apply replacements to a deterministic-but-varying subset based on intensity.
  // intensity 1 = swap first candidate, 2 = first two, etc.
  const targets = candidates.slice(0, Math.max(1, intensity));
  for (const idx of targets) {
    const key = words[idx].toLowerCase();
    const opts = SYNONYMS[key];
    if (!opts || opts.length === 0) continue;
    const choice = opts[(intensity - 1) % opts.length];
    words[idx] = preserveCase(words[idx], choice);
  }
  return words.join("");
}

function toFormal(text: string): string {
  let s = text;
  for (const [re, rep] of FROM_CONTRACTIONS) s = s.replace(re, rep);
  // Replace casual fillers
  s = s.replace(/\bso\b/gi, "therefore");
  s = s.replace(/\bbut\b/gi, "however,");
  return s;
}

function toCasual(text: string): string {
  let s = text;
  for (const [re, rep] of TO_CONTRACTIONS) {
    if (rep.startsWith("'")) continue; // 'll handled with care
    s = s.replace(re, rep);
  }
  s = s.replace(/\bhowever,?\b/gi, "but");
  s = s.replace(/\btherefore\b/gi, "so");
  return s;
}

function toConcise(text: string): string {
  let s = text;
  for (const [re, key] of FILLER_PHRASES.map((re) => [re, re.source.replace(/\\b|\(|\)/g, "")] as [RegExp, string])) {
    const repl = FILLER_REPLACEMENTS[key.toLowerCase()];
    s = repl ? s.replace(re, repl) : s.replace(re, "");
  }
  // Strip double spaces.
  return s.replace(/\s{2,}/g, " ").replace(/\s+([.,;:!?])/g, "$1").trim();
}

function toExpanded(text: string): string {
  let s = text.trim();
  if (!/^(however|therefore|moreover|in addition|notably|crucially)/i.test(s)) {
    s = `In particular, ${s.charAt(0).toLowerCase()}${s.slice(1)}`;
  }
  return s;
}

function toPersuasive(text: string): string {
  let s = text.trim();
  // Switch first-person to second-person where reasonable.
  s = s.replace(/\bone (can|may|should|might)\b/gi, "you $1");
  s = s.replace(/\bpeople (can|may|should|might)\b/gi, "you $1");
  // Lead with a hook if missing.
  const hook = PERSUASIVE_TRANSITIONS[s.length % PERSUASIVE_TRANSITIONS.length];
  if (!/^(notice|imagine|here'?s|the truth)/i.test(s)) {
    s = `${hook}${s.charAt(0).toLowerCase()}${s.slice(1)}`;
  }
  return s;
}

function toPassive(text: string): string {
  // Detect "X verb Y" patterns; convert to "Y was verb-ed by X".
  // We only handle the simplest pattern — proper-noun + simple-past + object.
  // For everything else, return original.
  const m = /^(.+?)\s+(builds?|made|created|designed|wrote|sent|kicked|launched|published|released|delivered)\s+(.+?)\.?$/i.exec(
    text.trim(),
  );
  if (!m) return text;
  const subject = m[1];
  const verb = m[2].toLowerCase();
  const obj = m[3];
  const past: Record<string, string> = {
    builds: "built",
    build: "built",
    made: "made",
    created: "created",
    designed: "designed",
    wrote: "written",
    sent: "sent",
    kicked: "kicked",
    launched: "launched",
    published: "published",
    released: "released",
    delivered: "delivered",
  };
  const verbForm = past[verb] ?? verb;
  return `${obj.charAt(0).toUpperCase()}${obj.slice(1)} was ${verbForm} by ${subject.toLowerCase()}.`;
}

function toActive(text: string): string {
  // Reverse the simplest passive pattern: "X was Y by Z." → "Z Y X."
  const m = /^(.+?) (?:was|were) (\w+) by (.+?)\.?$/i.exec(text.trim());
  if (!m) return text;
  const obj = m[1];
  const verb = m[2];
  const subject = m[3];
  return `${subject.charAt(0).toUpperCase()}${subject.slice(1)} ${verb} ${obj.toLowerCase()}.`;
}

function applyTone(text: string, tone: Tone): string {
  switch (tone) {
    case "formal": return toFormal(text);
    case "casual": return toCasual(text);
    case "concise": return toConcise(text);
    case "expanded": return toExpanded(text);
    case "persuasive": return toPersuasive(text);
    case "passive-voice": return toPassive(text);
    case "active-voice": return toActive(text);
  }
}

export interface RewriteResult {
  variations: string[];
  /** Words per variation, in order, for the stat row. */
  wordCounts: number[];
}

export function rewriteSentence(input: string, tone: Tone, count = 5): RewriteResult {
  const cleaned = input.trim();
  if (!cleaned) return { variations: [], wordCounts: [] };
  const baseToned = applyTone(cleaned, tone);
  const variations: string[] = [];
  for (let i = 1; i <= count; i++) {
    const v = applySynonymSwap(baseToned, i);
    if (!variations.includes(v)) variations.push(v);
  }
  // Make sure we always have at least one result.
  if (variations.length === 0) variations.push(baseToned);
  const wordCounts = variations.map((v) => v.trim().split(/\s+/).filter(Boolean).length);
  return { variations, wordCounts };
}

export interface BatchInput {
  text: string;
  tone: Tone;
  variationsPerSentence: number;
}

export function rewriteBatch(input: BatchInput): { original: string; rewrites: string[] }[] {
  // Treat each paragraph or sentence as a unit.
  const sentences = input.text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.map((s) => ({
    original: s,
    rewrites: rewriteSentence(s, input.tone, input.variationsPerSentence).variations,
  }));
}
