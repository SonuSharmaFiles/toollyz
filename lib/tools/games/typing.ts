// Typing-test engine for the Toollyz Typing Speed Test. Provides a bank of
// public-domain sample passages, scoring helpers (WPM and accuracy) and
// localStorage shapes for history. The component owns the timer and the
// character-by-character UI; this file is pure data + math.

export interface Passage { id: string; label: string; text: string }

export const PASSAGES: Passage[] = [
  {
    id: "fox",
    label: "Pangram drills",
    text:
      "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. Sphinx of black quartz, judge my vow. " +
      "How vexingly quick daft zebras jump! Five boxing wizards jump quickly. Crazy Frederick bought many very exquisite opal jewels. " +
      "The five boxing wizards jump quickly. Two driven jocks help fax my big quiz. Jackdaws love my big sphinx of quartz.",
  },
  {
    id: "alice",
    label: "Alice in Wonderland (excerpt)",
    text:
      "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, " +
      "and what is the use of a book, thought Alice, without pictures or conversation? So she was considering in her own mind whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, " +
      "when suddenly a White Rabbit with pink eyes ran close by her.",
  },
  {
    id: "moby",
    label: "Moby-Dick (opening)",
    text:
      "Call me Ishmael. Some years ago — never mind how long precisely — having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. " +
      "It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul, I account it high time to get to sea as soon as I can.",
  },
  {
    id: "code",
    label: "Code snippet (TypeScript)",
    text:
      "function memoize(fn) { const cache = new Map(); return (...args) => { const key = JSON.stringify(args); if (cache.has(key)) return cache.get(key); const value = fn(...args); cache.set(key, value); return value; }; }",
  },
  {
    id: "pi",
    label: "Digits of π",
    text:
      "3.14159265358979323846264338327950288419716939937510 58209749445923078164062862089986280348253421170679",
  },
  {
    id: "common",
    label: "Common English words",
    text:
      "time year people way day man thing woman life child world school state family student group country problem hand part place case week company system program question work government number night point home water room mother area money story fact month lot right study book eye job word business issue side kind head house service friend father power hour game line end member law car city community name president team minute idea kid body information back parent face others level office door health person art war history party result change morning reason research girl guy moment air teacher force education foot boy age policy process music market sense nation plan college interest death experience effect food role government area money story",
  },
];

export type Duration = 15 | 30 | 60 | 120;

export interface Stats {
  /** Words per minute, defined as (correct-chars / 5) / minutes-elapsed. */
  wpm: number;
  /** Raw WPM ignoring errors, useful as a "speed" upper bound. */
  rawWpm: number;
  /** Percent of attempts that landed on the right character (0..100). */
  accuracy: number;
  /** Number of mistakes that landed in the position. */
  errors: number;
  /** How many chars the user has typed correctly. */
  correct: number;
  /** How many chars the user has typed (regardless of correctness). */
  typed: number;
}

export function computeStats(typed: string, target: string, elapsedSec: number, mistakeCount: number): Stats {
  const cmpLen = Math.min(typed.length, target.length);
  let correct = 0;
  for (let i = 0; i < cmpLen; i++) {
    if (typed[i] === target[i]) correct += 1;
  }
  const minutes = Math.max(elapsedSec / 60, 0.0001);
  const wpm = correct / 5 / minutes;
  const rawWpm = typed.length / 5 / minutes;
  const acc = typed.length === 0 ? 100 : Math.max(0, Math.round((correct / typed.length) * 100));
  return {
    wpm: Math.max(0, Math.round(wpm)),
    rawWpm: Math.max(0, Math.round(rawWpm)),
    accuracy: acc,
    errors: mistakeCount,
    correct,
    typed: typed.length,
  };
}

export interface RunRecord {
  ts: number;
  duration: Duration;
  passageId: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  typed: number;
}

export const HISTORY_KEY = "toollyz:typing-history";

export function loadHistory(): RunRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RunRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: RunRecord[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
  } catch {
    /* noop */
  }
}
