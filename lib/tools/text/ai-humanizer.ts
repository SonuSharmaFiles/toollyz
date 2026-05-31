// AI Text Humanizer engine. Heuristic transformations that target the
// telltale rhythm of LLM-generated prose: stiff transitions ("Furthermore,",
// "Moreover,"), constant em-dashes, "It is important to note that" hedges,
// reliable sentence parallelism, and lack of contractions. The output is
// not an LLM rewrite — it's a rule-based pass that breaks the most obvious
// signals so the prose reads more naturally.
//
// Note: this tool can't make text undetectable by AI-text classifiers, and
// we say so prominently in the UI. The point is readability and voice.

export type Persona = "balanced" | "casual" | "expert" | "story";

export interface PersonaMeta {
  id: Persona;
  label: string;
  hint: string;
}

export const PERSONAS: PersonaMeta[] = [
  { id: "balanced", label: "Balanced", hint: "Conservative humanisation — readable everywhere." },
  { id: "casual", label: "Casual / blog", hint: "More contractions, sentence fragments, asides." },
  { id: "expert", label: "Expert voice", hint: "Confident assertions, fewer hedges, plain language." },
  { id: "story", label: "Storytelling", hint: "Concrete nouns, varied rhythm, fewer abstract phrases." },
];

// ─── Telltale phrase detection ──────────────────────────────────────────────

interface Tell {
  id: string;
  label: string;
  detect: RegExp;
}

export const TELLS: Tell[] = [
  { id: "furthermore", label: "Stiff transitions (Furthermore / Moreover)", detect: /\b(furthermore|moreover|additionally|in conclusion)\b/gi },
  { id: "it-is-important", label: '"It is important to note that"', detect: /\b(it is (important|worth noting) to note that|it should be noted that|notably,)/gi },
  { id: "delve", label: 'Overused verbs (delve / leverage / utilize)', detect: /\b(delve|leverage|utili[sz]e|elucidate|elucidates)\b/gi },
  { id: "in-the-realm", label: '"In the realm of …" / "In today\'s world"', detect: /\b(in the (realm|world|landscape|sphere) of|in today'?s (world|society|fast-paced))\b/gi },
  { id: "navigating", label: 'Buzzword openers (Navigating / Embarking)', detect: /\b(navigating|embarking on (a|the)|setting the stage)\b/gi },
  { id: "long-em-dash", label: "Repeated em-dashes (— … — …)", detect: /—.{1,40}—/g },
  { id: "tapestry", label: '"Tapestry / mosaic / symphony of …"', detect: /\b(tapestry|mosaic|symphony|kaleidoscope) of\b/gi },
  { id: "ensure", label: 'Hollow assurance (ensure / guarantee)', detect: /\b(ensures? that|guarantees? that)\b/gi },
  { id: "parallel-tricolon", label: "Tricolons of three (X, Y, and Z)", detect: /\b\w+(?:,\s*\w+){2}(?:,\s*and\s*\w+)\b/g },
];

export interface DetectedTell {
  id: string;
  label: string;
  count: number;
}

export function detectTells(text: string): DetectedTell[] {
  const out: DetectedTell[] = [];
  for (const t of TELLS) {
    const matches = text.match(t.detect);
    const n = matches ? matches.length : 0;
    if (n > 0) out.push({ id: t.id, label: t.label, count: n });
  }
  return out;
}

// ─── Rewriting passes ──────────────────────────────────────────────────────

const STIFF_TRANSITIONS: Array<[RegExp, string[]]> = [
  [/\bfurthermore\b,?/gi, ["Also,", "On top of that,", "And"]],
  [/\bmoreover\b,?/gi, ["What's more,", "Besides,", "And"]],
  [/\badditionally\b,?/gi, ["Also,", "Plus,"]],
  [/\bin conclusion\b,?/gi, ["In short,", "So,"]],
  [/\bin essence\b,?/gi, ["Really,", "Basically,"]],
];

const VERB_REPLACEMENTS: Record<string, string> = {
  delve: "explore",
  delves: "explores",
  utilise: "use",
  utilize: "use",
  utilises: "uses",
  utilizes: "uses",
  leverage: "use",
  leverages: "uses",
  elucidate: "explain",
  elucidates: "explains",
  facilitate: "make",
  facilitates: "makes",
  encompass: "include",
  encompasses: "includes",
};

const HEDGE_PHRASES: Array<[RegExp, string]> = [
  [/\bit is important to (note|remember) that\b/gi, ""],
  [/\bit is worth (noting|mentioning) that\b/gi, ""],
  [/\bit should be noted that\b/gi, ""],
  [/\bin order to\b/gi, "to"],
  [/\bdue to the fact that\b/gi, "because"],
  [/\bat this point in time\b/gi, "now"],
  [/\bin today'?s fast-paced world\b/gi, "today"],
];

const BUZZWORD_OPENERS: Array<[RegExp, string]> = [
  [/^Navigating the (\w+) landscape,/gi, "In $1,"],
  [/^Embarking on a journey through\b/gi, "Looking at"],
  [/^Setting the stage for\b/gi, "Before we discuss"],
  [/^In the (realm|sphere|world) of (\w+),/gi, "In $2,"],
];

const CONTRACT_PATTERNS: Array<[RegExp, string]> = [
  [/\bdo not\b/gi, "don't"],
  [/\bdoes not\b/gi, "doesn't"],
  [/\bdid not\b/gi, "didn't"],
  [/\bare not\b/gi, "aren't"],
  [/\bis not\b/gi, "isn't"],
  [/\bwas not\b/gi, "wasn't"],
  [/\bwere not\b/gi, "weren't"],
  [/\bcannot\b/gi, "can't"],
  [/\bwill not\b/gi, "won't"],
  [/\bwould not\b/gi, "wouldn't"],
  [/\bshould not\b/gi, "shouldn't"],
  [/\bit is\b/gi, "it's"],
  [/\bthat is\b/gi, "that's"],
  [/\byou are\b/gi, "you're"],
  [/\bwe are\b/gi, "we're"],
  [/\bthey are\b/gi, "they're"],
  [/\bI am\b/g, "I'm"],
];

function replaceVerbs(text: string): string {
  return text.replace(/\b(\w+)\b/g, (m) => {
    const lower = m.toLowerCase();
    const rep = VERB_REPLACEMENTS[lower];
    if (!rep) return m;
    if (m[0] === m[0].toUpperCase()) return rep.charAt(0).toUpperCase() + rep.slice(1);
    return rep;
  });
}

function rotate(transitions: string[], i: number): string {
  return transitions[i % transitions.length];
}

function dehedge(text: string): string {
  let s = text;
  for (const [re, rep] of HEDGE_PHRASES) {
    s = s.replace(re, rep);
  }
  return s.replace(/\s{2,}/g, " ").replace(/\s+([.,;:!?])/g, "$1").trim();
}

function relaxTransitions(text: string): string {
  let s = text;
  let i = 0;
  for (const [re, opts] of STIFF_TRANSITIONS) {
    s = s.replace(re, () => rotate(opts, i++));
  }
  return s;
}

function smashEmDashes(text: string): string {
  // Replace inline "— X —" pairs with parens for variety.
  return text.replace(/—\s*([^—]{2,60})\s*—/g, " ($1)");
}

function vaporiseBuzzwordOpeners(text: string): string {
  let s = text;
  for (const [re, rep] of BUZZWORD_OPENERS) s = s.replace(re, rep);
  return s;
}

function addContractions(text: string): string {
  let s = text;
  for (const [re, rep] of CONTRACT_PATTERNS) s = s.replace(re, rep);
  return s;
}

function breakRhythm(text: string): string {
  // Convert one in three sentences from a long form to a short one by
  // chopping at the first comma.
  const parts = text.split(/(?<=[.!?])\s+/);
  return parts
    .map((p, i) => {
      if (i % 3 !== 2) return p;
      const commaIdx = p.indexOf(",");
      if (commaIdx > 8 && commaIdx < p.length - 4) {
        const head = p.slice(0, commaIdx).trim();
        let tail = p.slice(commaIdx + 1).trim();
        if (tail) tail = tail.charAt(0).toUpperCase() + tail.slice(1);
        return `${head}. ${tail}`;
      }
      return p;
    })
    .join(" ");
}

function expertVoice(text: string): string {
  // Strip more hedges, replace "may" / "might" with "can" sometimes.
  let s = text;
  s = s.replace(/\bmay (be|have)\b/gi, "can $1");
  s = s.replace(/\bone could argue that\b/gi, "");
  s = s.replace(/\barguably\b,?\s*/gi, "");
  return s.trim();
}

function storyVoice(text: string): string {
  // Replace abstract phrases with concrete fillers; bias sentences to start
  // with the subject.
  let s = text;
  s = s.replace(/\bin (recent|the recent past) (months|years)\b/gi, "lately");
  s = s.replace(/\bnumerous individuals\b/gi, "many people");
  s = s.replace(/\bin various (industries|sectors|domains)\b/gi, "across the industry");
  return s;
}

export interface HumanizeResult {
  output: string;
  stats: {
    inputWords: number;
    outputWords: number;
    detected: DetectedTell[];
    /** Sentence-length variance proxy — std dev of word counts. */
    variance: number;
    /** Number of contractions in the output. */
    contractions: number;
  };
}

function variance(arr: number[]): number {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((s, n) => s + n, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, n) => s + Math.pow(n - mean, 2), 0) / arr.length);
}

function countContractions(text: string): number {
  return (text.match(/\b\w+'(s|t|m|re|ve|ll|d)\b/g) ?? []).length;
}

export function humanize(text: string, persona: Persona = "balanced"): HumanizeResult {
  let out = text.trim();
  const inputWords = out.split(/\s+/).filter(Boolean).length;
  const detected = detectTells(out);

  out = vaporiseBuzzwordOpeners(out);
  out = relaxTransitions(out);
  out = dehedge(out);
  out = replaceVerbs(out);
  out = smashEmDashes(out);

  if (persona === "casual") {
    out = addContractions(out);
    out = breakRhythm(out);
  } else if (persona === "expert") {
    out = expertVoice(out);
    out = addContractions(out);
  } else if (persona === "story") {
    out = storyVoice(out);
    out = breakRhythm(out);
  } else {
    // balanced — light contractions, light rhythm break
    out = addContractions(out);
  }

  const outputWords = out.split(/\s+/).filter(Boolean).length;
  const sentenceLens = out
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim().split(/\s+/).filter(Boolean).length)
    .filter((n) => n > 0);
  return {
    output: out,
    stats: {
      inputWords,
      outputWords,
      detected,
      variance: Math.round(variance(sentenceLens) * 10) / 10,
      contractions: countContractions(out),
    },
  };
}
