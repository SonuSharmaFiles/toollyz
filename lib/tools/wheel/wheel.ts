export interface WheelTheme {
  id: string;
  label: string;
  colors: string[]; // segment palette (cycled)
  pointer: string;
  centerBg: string;
  centerText: string;
  stroke: string;
  segmentText: string; // "#fff" or "#0f172a" — auto-contrast handled per segment
}

export const WHEEL_THEMES: WheelTheme[] = [
  {
    id: "neon",
    label: "Neon",
    colors: ["#22d3ee", "#a855f7", "#ec4899", "#34d399", "#facc15", "#3b82f6"],
    pointer: "#f8fafc",
    centerBg: "#0f172a",
    centerText: "#22d3ee",
    stroke: "#0b1020",
    segmentText: "#0b1020",
  },
  {
    id: "casino",
    label: "Casino",
    colors: ["#dc2626", "#0f172a", "#dc2626", "#0f172a", "#dc2626", "#0f172a"],
    pointer: "#facc15",
    centerBg: "#facc15",
    centerText: "#0f172a",
    stroke: "#facc15",
    segmentText: "#ffffff",
  },
  {
    id: "classroom",
    label: "Classroom",
    colors: ["#0d9488", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#10b981"],
    pointer: "#0f172a",
    centerBg: "#ffffff",
    centerText: "#0d9488",
    stroke: "#ffffff",
    segmentText: "#ffffff",
  },
  {
    id: "corporate",
    label: "Corporate",
    colors: ["#1e293b", "#0ea5e9", "#475569", "#38bdf8", "#334155", "#7dd3fc"],
    pointer: "#0ea5e9",
    centerBg: "#ffffff",
    centerText: "#1e293b",
    stroke: "#ffffff",
    segmentText: "#ffffff",
  },
  {
    id: "minimal",
    label: "Minimal modern",
    colors: ["#4f46e5", "#818cf8", "#6366f1", "#a5b4fc", "#4338ca", "#c7d2fe"],
    pointer: "#0f172a",
    centerBg: "#ffffff",
    centerText: "#4f46e5",
    stroke: "#ffffff",
    segmentText: "#ffffff",
  },
  {
    id: "birthday",
    label: "Birthday party",
    colors: ["#ec4899", "#f59e0b", "#8b5cf6", "#06b6d4", "#f43f5e", "#10b981"],
    pointer: "#ffffff",
    centerBg: "#ec4899",
    centerText: "#ffffff",
    stroke: "#ffffff",
    segmentText: "#ffffff",
  },
  {
    id: "gaming",
    label: "Gaming",
    colors: ["#7c3aed", "#06b6d4", "#22c55e", "#f43f5e", "#eab308", "#3b82f6"],
    pointer: "#22c55e",
    centerBg: "#0f172a",
    centerText: "#22c55e",
    stroke: "#0f172a",
    segmentText: "#ffffff",
  },
  {
    id: "retro",
    label: "Retro arcade",
    colors: ["#facc15", "#ec4899", "#06b6d4", "#f97316", "#a855f7", "#84cc16"],
    pointer: "#18181b",
    centerBg: "#18181b",
    centerText: "#facc15",
    stroke: "#18181b",
    segmentText: "#18181b",
  },
  {
    id: "luxury",
    label: "Luxury gold",
    colors: ["#b45309", "#1c1917", "#d97706", "#292524", "#f59e0b", "#0c0a09"],
    pointer: "#fde68a",
    centerBg: "#1c1917",
    centerText: "#fde68a",
    stroke: "#1c1917",
    segmentText: "#ffffff",
  },
  {
    id: "dark",
    label: "Dark mode",
    colors: ["#334155", "#475569", "#1e293b", "#64748b", "#0f172a", "#94a3b8"],
    pointer: "#6366f1",
    centerBg: "#6366f1",
    centerText: "#ffffff",
    stroke: "#0f172a",
    segmentText: "#ffffff",
  },
];

export const THEME_BY_ID: Record<string, WheelTheme> = Object.fromEntries(
  WHEEL_THEMES.map((t) => [t.id, t]),
);

// ─── Geometry ──────────────────────────────────────────────────────────────

// Convert polar (angle measured clockwise from top) to cartesian on a circle.
export function polarToXY(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

export function segmentPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const [x1, y1] = polarToXY(cx, cy, r, startAngle);
  const [x2, y2] = polarToXY(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

// Compute the final rotation so that `winnerIndex` lands under the top pointer.
export function computeTargetRotation(
  currentRotation: number,
  winnerIndex: number,
  totalSegments: number,
  extraSpins = 6,
): number {
  const seg = 360 / totalSegments;
  const winnerCenter = winnerIndex * seg + seg / 2;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  const targetMod = ((360 - winnerCenter) % 360 + 360) % 360;
  const delta = (targetMod - currentMod + 360) % 360;
  return currentRotation + extraSpins * 360 + delta;
}

// ─── Fair random ─────────────────────────────────────────────────────────

export function fairIndex(n: number): number {
  if (n <= 0) return 0;
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / n) * n;
  let v: number;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % n;
}

// Weighted random pick — weights align with entries by index.
export function weightedIndex(weights: number[]): number {
  const total = weights.reduce((a, b) => a + Math.max(0, b), 0);
  if (total <= 0) return fairIndex(weights.length);
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  let target = (buf[0] / 0xffffffff) * total;
  for (let i = 0; i < weights.length; i++) {
    target -= Math.max(0, weights[i]);
    if (target <= 0) return i;
  }
  return weights.length - 1;
}

// ─── Text contrast ─────────────────────────────────────────────────────────

export function readableText(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#0f172a" : "#ffffff";
}

// ─── Sounds ─────────────────────────────────────────────────────────────────

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function playTick() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "square";
  osc.frequency.value = 1400;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.05, now + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.05);
}

export function playWin() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const t = now + i * 0.1;
    const osc = c.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  });
}

// ─── Parsing ─────────────────────────────────────────────────────────────

export function parseEntries(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
