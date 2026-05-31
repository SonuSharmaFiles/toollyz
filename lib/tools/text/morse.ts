// Morse Code Translator engine. ITU/International Morse code with the
// most-common punctuation set. Includes a Web Audio playback helper that
// produces clean square-ish tones at the WPM speed the user selects.

export const MORSE_MAP: Record<string, string> = {
  // Letters
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  // Digits
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  // Punctuation
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  "_": "..--.-",
  '"': ".-..-.",
  "$": "...-..-",
  "@": ".--.-.",
};

// Reverse lookup built once.
const REVERSE_MAP: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const [k, v] of Object.entries(MORSE_MAP)) m[v] = k;
  return m;
})();

export function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map((ch) => {
      if (ch === " ") return "/"; // word separator
      if (ch === "\n") return "\n";
      return MORSE_MAP[ch] ?? "";
    })
    .filter(Boolean)
    .join(" ")
    .replace(/ +/g, " ")
    .trim();
}

export function morseToText(morse: string): string {
  return morse
    .split("\n")
    .map((line) =>
      line
        .trim()
        .split(/\s+\/\s+|\s+\/|\/\s+|\//) // split on " / " word boundary
        .map((word) =>
          word
            .trim()
            .split(/\s+/)
            .map((sym) => REVERSE_MAP[sym] ?? "")
            .join(""),
        )
        .join(" "),
    )
    .join("\n");
}

export interface MorseStats {
  /** Number of letters / digits / punctuation tokens (excludes spaces). */
  symbols: number;
  /** Dots + dashes total (a 'unit length' indicator). */
  units: number;
  /** Estimated transmission time at the user's WPM. */
  durationMs: number;
}

/**
 * Standard PARIS-word reference: a 50-unit word at 1 WPM = 1.2 s per unit.
 * One dot = 1 unit, one dash = 3 units, intra-letter gap = 1 unit, inter-
 * letter gap = 3 units, inter-word gap = 7 units.
 */
export function unitDurationMs(wpm: number): number {
  // 1.2 / WPM seconds per unit = 1200 / WPM milliseconds.
  return 1200 / Math.max(1, wpm);
}

export function statsOf(text: string, wpm = 15): MorseStats {
  let units = 0;
  let symbols = 0;
  for (const ch of text.toUpperCase()) {
    if (ch === " ") {
      units += 7;
      continue;
    }
    const m = MORSE_MAP[ch];
    if (!m) continue;
    symbols++;
    for (const sym of m) {
      units += sym === "." ? 1 : 3;
      units += 1; // intra-letter gap
    }
    units += 2; // bring inter-letter to 3 units (we already added 1)
  }
  return { symbols, units, durationMs: Math.round(units * unitDurationMs(wpm)) };
}

// ─── Web Audio playback ────────────────────────────────────────────────────

export interface PlaybackHandle {
  stop: () => void;
  promise: Promise<void>;
}

export function playMorse(morse: string, wpm = 15, frequency = 600, ctx?: AudioContext): PlaybackHandle {
  if (typeof window === "undefined" || !morse) {
    return { stop: () => {}, promise: Promise.resolve() };
  }
  const audio = ctx ?? new ((window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ?? AudioContext)();
  const unitMs = unitDurationMs(wpm);
  const startTime = audio.currentTime;
  const stopFns: Array<() => void> = [];
  let cursor = startTime;

  function schedule(durationMs: number, on: boolean) {
    if (on) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, cursor);
      gain.gain.linearRampToValueAtTime(0.3, cursor + 0.005);
      gain.gain.setValueAtTime(0.3, cursor + durationMs / 1000 - 0.005);
      gain.gain.linearRampToValueAtTime(0, cursor + durationMs / 1000);
      osc.connect(gain).connect(audio.destination);
      osc.start(cursor);
      osc.stop(cursor + durationMs / 1000 + 0.01);
      stopFns.push(() => {
        try {
          osc.stop();
        } catch {
          /* noop */
        }
      });
    }
    cursor += durationMs / 1000;
  }

  // Tokenise the morse string into letters and word boundaries.
  const words = morse.split(/\s*\/\s*/);
  words.forEach((word, wi) => {
    if (wi > 0) schedule(7 * unitMs, false);
    const letters = word.trim().split(/\s+/).filter(Boolean);
    letters.forEach((letter, li) => {
      if (li > 0) schedule(3 * unitMs, false);
      for (let i = 0; i < letter.length; i++) {
        if (i > 0) schedule(unitMs, false);
        if (letter[i] === ".") schedule(unitMs, true);
        else if (letter[i] === "-") schedule(3 * unitMs, true);
      }
    });
  });

  const totalMs = (cursor - startTime) * 1000;
  const promise = new Promise<void>((resolve) => {
    window.setTimeout(() => resolve(), totalMs + 50);
  });
  return {
    stop: () => stopFns.forEach((f) => f()),
    promise,
  };
}
