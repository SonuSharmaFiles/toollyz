import {
  GraduationCap,
  Gift,
  Users,
  Ticket,
  Trophy,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";

// ─── Templates ──────────────────────────────────────────────────────────────

export interface DrawTemplate {
  id: string;
  label: string;
  icon: LucideIcon;
  title: string;
  prize: string;
  participants: string[];
}

function range(prefix: string, n: number, pad = 0): string[] {
  return Array.from({ length: n }, (_, i) =>
    `${prefix}${String(i + 1).padStart(pad, "0")}`,
  );
}

const SAMPLE_NAMES = [
  "Ava", "Liam", "Olivia", "Noah", "Emma", "Oliver", "Sophia", "Elijah",
  "Isabella", "Lucas", "Mia", "Mason", "Amelia", "Ethan", "Harper", "Logan",
  "Evelyn", "James", "Abigail", "Aiden", "Ella", "Jack", "Scarlett", "Leo",
];

export const DRAW_TEMPLATES: DrawTemplate[] = [
  {
    id: "classroom",
    label: "Classroom picker",
    icon: GraduationCap,
    title: "Class Lucky Draw",
    prize: "Star student",
    participants: SAMPLE_NAMES.slice(0, 16),
  },
  {
    id: "giveaway",
    label: "Giveaway draw",
    icon: Gift,
    title: "Giveaway Winner",
    prize: "Grand prize",
    participants: [
      "@alex_codes", "@maria.designs", "@devjenny", "@thereal_sam", "@kncreates",
      "@bytewizard", "@pixelpriya", "@noah.builds", "@studiolune", "@captaincode",
      "@minty_dev", "@roamingrae", "@hello.world", "@frostbyte", "@sunny.dev",
    ],
  },
  {
    id: "team",
    label: "Team selection",
    icon: Users,
    title: "Team Draw",
    prize: "Team captain",
    participants: SAMPLE_NAMES.slice(0, 12),
  },
  {
    id: "raffle",
    label: "Raffle winner",
    icon: Ticket,
    title: "Raffle Draw",
    prize: "Lucky ticket",
    participants: range("Ticket #", 40, 3),
  },
  {
    id: "tournament",
    label: "Tournament draw",
    icon: Trophy,
    title: "Tournament Bracket",
    prize: "Seed #1",
    participants: range("Player ", 16),
  },
  {
    id: "party",
    label: "Party lucky draw",
    icon: PartyPopper,
    title: "Party Lucky Draw",
    prize: "Door prize",
    participants: SAMPLE_NAMES.slice(0, 20),
  },
];

// ─── Random ─────────────────────────────────────────────────────────────────

function secureInt(max: number): number {
  if (max <= 0) return 0;
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let v: number;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % max;
}

export function randomItem<T>(arr: T[]): T {
  return arr[secureInt(arr.length)];
}

// Fisher-Yates then slice → n unique winners
export function pickWinners(participants: string[], n: number): string[] {
  const a = [...participants];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}

export function parseParticipants(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function dedupeParticipants(list: string[]): {
  unique: string[];
  removed: number;
} {
  const unique = Array.from(new Set(list));
  return { unique, removed: list.length - unique.length };
}

// ─── Prize tier labels ────────────────────────────────────────────────────

export function tierLabel(index: number): { medal: string; place: string } {
  if (index === 0) return { medal: "🥇", place: "1st place" };
  if (index === 1) return { medal: "🥈", place: "2nd place" };
  if (index === 2) return { medal: "🥉", place: "3rd place" };
  return { medal: "🎖️", place: `${index + 1}th place` };
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
  osc.frequency.value = 1100 + Math.random() * 400;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.04, now + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.04);
}

export function playCountdown() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 660;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.32);
}

export function playWin() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  notes.forEach((freq, i) => {
    const t = now + i * 0.09;
    const osc = c.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.42);
  });
}

// ─── Export ─────────────────────────────────────────────────────────────────

export function winnersToCsv(winners: string[]): string {
  const rows = winners.map((w, i) => `${i + 1},${w.replace(/,/g, " ")}`);
  return ["place,winner", ...rows].join("\n");
}

export function winnerCardCanvas(
  winners: string[],
  title: string,
  prize: string,
): HTMLCanvasElement {
  const scale = 2;
  const w = 600;
  const lineH = 56;
  const top = 180;
  const h = top + winners.length * lineH + 60;
  const canvas = document.createElement("canvas");
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx2 = canvas.getContext("2d")!;
  ctx2.scale(scale, scale);

  // Background gradient
  const grad = ctx2.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#1e1b4b");
  grad.addColorStop(1, "#312e81");
  ctx2.fillStyle = grad;
  ctx2.fillRect(0, 0, w, h);

  // Title
  ctx2.textAlign = "center";
  ctx2.fillStyle = "#fbbf24";
  ctx2.font = "bold 14px system-ui, sans-serif";
  ctx2.fillText(prize.toUpperCase(), w / 2, 60);
  ctx2.fillStyle = "#ffffff";
  ctx2.font = "bold 34px system-ui, sans-serif";
  ctx2.fillText(title, w / 2, 100);
  ctx2.fillStyle = "rgba(255,255,255,0.5)";
  ctx2.font = "13px system-ui, sans-serif";
  ctx2.fillText(
    winners.length === 1 ? "Winner" : `${winners.length} winners`,
    w / 2,
    132,
  );

  // Winner rows
  winners.forEach((winner, i) => {
    const y = top + i * lineH;
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🎖️";
    ctx2.fillStyle = "rgba(255,255,255,0.06)";
    roundRect(ctx2, 60, y - 30, w - 120, 44, 12);
    ctx2.fill();
    ctx2.textAlign = "left";
    ctx2.font = "26px system-ui, sans-serif";
    ctx2.fillText(medal, 76, y);
    ctx2.fillStyle = "#ffffff";
    ctx2.font = "bold 20px system-ui, sans-serif";
    ctx2.fillText(winner.length > 28 ? winner.slice(0, 27) + "…" : winner, 116, y);
  });

  // Footer
  ctx2.textAlign = "center";
  ctx2.fillStyle = "rgba(255,255,255,0.4)";
  ctx2.font = "12px system-ui, sans-serif";
  ctx2.fillText("Drawn fairly at toollyz.com", w / 2, h - 24);

  return canvas;
}

function roundRect(
  ctx2: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx2.beginPath();
  ctx2.moveTo(x + r, y);
  ctx2.arcTo(x + w, y, x + w, y + h, r);
  ctx2.arcTo(x + w, y + h, x, y + h, r);
  ctx2.arcTo(x, y + h, x, y, r);
  ctx2.arcTo(x, y, x + w, y, r);
  ctx2.closePath();
}
