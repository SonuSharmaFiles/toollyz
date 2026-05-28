export type FlipResult = "heads" | "tails";

export type CoinStyle = "gold" | "silver" | "minimal" | "casino" | "neon";

export interface CoinStyleConfig {
  id: CoinStyle;
  label: string;
  // tailwind/inline style fragments
  face: string; // gradient classes for the coin face
  ring: string; // edge ring
  text: string; // label text color
  glow: string; // box-shadow / glow
}

export const COIN_STYLES: CoinStyleConfig[] = [
  {
    id: "gold",
    label: "Classic gold",
    face: "radial-gradient(circle at 35% 30%, #fde68a, #f59e0b 55%, #b45309)",
    ring: "#92400e",
    text: "#78350f",
    glow: "0 12px 40px rgba(245, 158, 11, 0.45)",
  },
  {
    id: "silver",
    label: "Silver",
    face: "radial-gradient(circle at 35% 30%, #f8fafc, #cbd5e1 55%, #64748b)",
    ring: "#475569",
    text: "#334155",
    glow: "0 12px 40px rgba(148, 163, 184, 0.45)",
  },
  {
    id: "minimal",
    label: "Minimal",
    face: "radial-gradient(circle at 35% 30%, #ffffff, #e2e8f0 60%, #cbd5e1)",
    ring: "#cbd5e1",
    text: "#0f172a",
    glow: "0 10px 30px rgba(15, 23, 42, 0.18)",
  },
  {
    id: "casino",
    label: "Casino chip",
    face: "radial-gradient(circle at 35% 30%, #fb7185, #e11d48 55%, #9f1239)",
    ring: "#ffffff",
    text: "#ffffff",
    glow: "0 12px 40px rgba(225, 29, 72, 0.45)",
  },
  {
    id: "neon",
    label: "Neon",
    face: "radial-gradient(circle at 35% 30%, #1e1b4b, #0f172a 60%, #020617)",
    ring: "#22d3ee",
    text: "#22d3ee",
    glow: "0 0 50px rgba(34, 211, 238, 0.55)",
  },
];

export const COIN_STYLE_BY_ID: Record<CoinStyle, CoinStyleConfig> =
  Object.fromEntries(COIN_STYLES.map((c) => [c.id, c])) as Record<
    CoinStyle,
    CoinStyleConfig
  >;

// Cryptographically fair coin flip
export function fairFlip(): FlipResult {
  const buf = new Uint8Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] & 1) === 0 ? "heads" : "tails";
}

export function fairFlipMany(count: number): FlipResult[] {
  const buf = new Uint8Array(count);
  crypto.getRandomValues(buf);
  const out: FlipResult[] = [];
  for (let i = 0; i < count; i++) {
    out.push((buf[i] & 1) === 0 ? "heads" : "tails");
  }
  return out;
}

export interface FlipRecord {
  id: string;
  result: FlipResult;
  at: number;
}

export interface FlipStats {
  total: number;
  heads: number;
  tails: number;
  headsPct: number;
  tailsPct: number;
  currentStreak: { result: FlipResult; length: number } | null;
  longestStreak: { result: FlipResult; length: number } | null;
}

export function computeStats(history: FlipRecord[]): FlipStats {
  const total = history.length;
  const heads = history.filter((h) => h.result === "heads").length;
  const tails = total - heads;

  // History is newest-first; reverse to chronological for streak math
  const chrono = [...history].reverse();
  let longest: FlipStats["longestStreak"] = null;
  let runResult: FlipResult | null = null;
  let runLen = 0;
  for (const rec of chrono) {
    if (rec.result === runResult) {
      runLen++;
    } else {
      runResult = rec.result;
      runLen = 1;
    }
    if (!longest || runLen > longest.length) {
      longest = { result: rec.result, length: runLen };
    }
  }

  // Current streak (from newest backwards)
  let current: FlipStats["currentStreak"] = null;
  if (history.length) {
    const r = history[0].result;
    let len = 0;
    for (const rec of history) {
      if (rec.result === r) len++;
      else break;
    }
    current = { result: r, length: len };
  }

  return {
    total,
    heads,
    tails,
    headsPct: total ? Math.round((heads / total) * 1000) / 10 : 0,
    tailsPct: total ? Math.round((tails / total) * 1000) / 10 : 0,
    currentStreak: current,
    longestStreak: longest,
  };
}

export type DecisionMode = "heads-tails" | "yes-no" | "true-dare" | "team";

export const DECISION_LABELS: Record<
  DecisionMode,
  { heads: string; tails: string; label: string }
> = {
  "heads-tails": { heads: "Heads", tails: "Tails", label: "Heads / Tails" },
  "yes-no": { heads: "Yes", tails: "No", label: "Yes / No" },
  "true-dare": { heads: "Truth", tails: "Dare", label: "Truth / Dare" },
  team: { heads: "Team A", tails: "Team B", label: "Team picker" },
};

// ─── Synthesized sounds ─────────────────────────────────────────────────────
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

export function playFlipSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  // whoosh: filtered noise sweep
  const bufferSize = ctx.sampleRate * 0.3;
  const noise = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(400, now);
  filter.frequency.exponentialRampToValueAtTime(2500, now + 0.25);
  filter.Q.value = 1.2;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(now);
  src.stop(now + 0.3);
}

export function playLandSound() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.26);
}

export function flipsToCsv(history: FlipRecord[]): string {
  const rows = [...history]
    .reverse()
    .map((h, i) => `${i + 1},${h.result},${new Date(h.at).toISOString()}`);
  return ["flip,result,timestamp", ...rows].join("\n");
}
