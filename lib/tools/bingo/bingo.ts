export type GridSize = 3 | 4 | 5 | 6;
export type ContentSource =
  | "numbers"
  | "emoji"
  | "animals"
  | "party"
  | "classroom"
  | "custom";

export interface BingoTheme {
  id: string;
  label: string;
  cardBg: string;
  headerBg: string;
  headerText: string;
  cellBg: string;
  cellAltBg: string;
  cellText: string;
  border: string;
  freeBg: string;
  freeText: string;
  radius: number; // px
}

export const THEMES: BingoTheme[] = [
  {
    id: "minimal",
    label: "Minimal modern",
    cardBg: "#ffffff",
    headerBg: "#0f172a",
    headerText: "#ffffff",
    cellBg: "#ffffff",
    cellAltBg: "#f8fafc",
    cellText: "#0f172a",
    border: "#e2e8f0",
    freeBg: "#4f46e5",
    freeText: "#ffffff",
    radius: 12,
  },
  {
    id: "classroom",
    label: "Classroom",
    cardBg: "#fffbeb",
    headerBg: "#0d9488",
    headerText: "#ffffff",
    cellBg: "#ffffff",
    cellAltBg: "#f0fdfa",
    cellText: "#134e4a",
    border: "#99f6e4",
    freeBg: "#f59e0b",
    freeText: "#ffffff",
    radius: 14,
  },
  {
    id: "neon",
    label: "Neon",
    cardBg: "#0b1020",
    headerBg: "#22d3ee",
    headerText: "#04121a",
    cellBg: "#0f172a",
    cellAltBg: "#111c33",
    cellText: "#67e8f9",
    border: "#1e3a8a",
    freeBg: "#a855f7",
    freeText: "#ffffff",
    radius: 12,
  },
  {
    id: "birthday",
    label: "Birthday party",
    cardBg: "#fff1f2",
    headerBg: "#ec4899",
    headerText: "#ffffff",
    cellBg: "#ffffff",
    cellAltBg: "#fce7f3",
    cellText: "#831843",
    border: "#fbcfe8",
    freeBg: "#f59e0b",
    freeText: "#ffffff",
    radius: 18,
  },
  {
    id: "christmas",
    label: "Christmas",
    cardBg: "#f0fdf4",
    headerBg: "#b91c1c",
    headerText: "#ffffff",
    cellBg: "#ffffff",
    cellAltBg: "#dcfce7",
    cellText: "#14532d",
    border: "#86efac",
    freeBg: "#15803d",
    freeText: "#ffffff",
    radius: 14,
  },
  {
    id: "halloween",
    label: "Halloween",
    cardBg: "#1c1917",
    headerBg: "#ea580c",
    headerText: "#1c1917",
    cellBg: "#292524",
    cellAltBg: "#1c1917",
    cellText: "#fb923c",
    border: "#44403c",
    freeBg: "#7c3aed",
    freeText: "#ffffff",
    radius: 12,
  },
  {
    id: "corporate",
    label: "Corporate event",
    cardBg: "#ffffff",
    headerBg: "#1e293b",
    headerText: "#ffffff",
    cellBg: "#ffffff",
    cellAltBg: "#f1f5f9",
    cellText: "#1e293b",
    border: "#cbd5e1",
    freeBg: "#0ea5e9",
    freeText: "#ffffff",
    radius: 8,
  },
  {
    id: "kids",
    label: "Kids colorful",
    cardBg: "#eff6ff",
    headerBg: "#7c3aed",
    headerText: "#ffffff",
    cellBg: "#ffffff",
    cellAltBg: "#ede9fe",
    cellText: "#4c1d95",
    border: "#c4b5fd",
    freeBg: "#f43f5e",
    freeText: "#ffffff",
    radius: 20,
  },
  {
    id: "retro",
    label: "Retro arcade",
    cardBg: "#18181b",
    headerBg: "#facc15",
    headerText: "#18181b",
    cellBg: "#27272a",
    cellAltBg: "#18181b",
    cellText: "#fde047",
    border: "#3f3f46",
    freeBg: "#ec4899",
    freeText: "#ffffff",
    radius: 6,
  },
];

export const THEME_BY_ID: Record<string, BingoTheme> = Object.fromEntries(
  THEMES.map((t) => [t.id, t]),
);

// ─── Content presets ───────────────────────────────────────────────────────

export const PRESETS: Record<Exclude<ContentSource, "custom" | "numbers">, string[]> = {
  emoji: [
    "🎉", "🎈", "🎁", "🍰", "🍕", "🍦", "🌈", "⭐", "🎵", "🎸", "🚀", "🌟",
    "🦄", "🐱", "🐶", "🦊", "🐼", "🐧", "🌸", "🍀", "☀️", "🌙", "⚡", "🔥",
    "💎", "🎯", "🎲", "🏆", "👑", "🎨", "📚", "✈️", "🚗", "⚽", "🏀", "🎮",
    "🍎", "🍓", "🥑", "🌻", "🦋", "🐢", "🐙", "🦜", "🎃", "❄️", "🍩", "🧁",
  ],
  animals: [
    "Lion", "Tiger", "Elephant", "Giraffe", "Zebra", "Panda", "Koala", "Kangaroo",
    "Penguin", "Dolphin", "Whale", "Shark", "Octopus", "Owl", "Eagle", "Falcon",
    "Fox", "Wolf", "Bear", "Deer", "Rabbit", "Squirrel", "Hedgehog", "Otter",
    "Cheetah", "Leopard", "Rhino", "Hippo", "Crocodile", "Turtle", "Frog", "Snake",
    "Parrot", "Flamingo", "Peacock", "Butterfly", "Bee", "Ladybug", "Dragonfly", "Snail",
  ],
  party: [
    "Confetti", "Balloons", "Cake", "Music", "Dancing", "Gifts", "Streamers", "Candles",
    "Toast", "Cheers", "Selfie", "Karaoke", "Games", "Snacks", "Punch", "Fireworks",
    "Photobooth", "Hat", "Sparklers", "Pizza", "Friends", "Laughter", "Surprise", "Disco",
    "Glitter", "Banner", "Cupcakes", "Lemonade", "Playlist", "Countdown", "Wishes", "Hugs",
  ],
  classroom: [
    "Read", "Write", "Listen", "Speak", "Count", "Add", "Subtract", "Multiply",
    "Divide", "Science", "History", "Geography", "Music", "Art", "Recess", "Library",
    "Pencil", "Notebook", "Teacher", "Student", "Homework", "Quiz", "Project", "Group",
    "Question", "Answer", "Globe", "Map", "Ruler", "Eraser", "Crayon", "Backpack",
    "Lunch", "Bell", "Whiteboard", "Marker", "Calendar", "Calculator", "Microscope", "Experiment",
  ],
};

export interface BingoCard {
  id: string;
  cells: string[]; // size*size
  freeIndex: number | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const j = buf[0] % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildPool(
  source: ContentSource,
  customText: string,
  size: GridSize,
): string[] {
  if (source === "numbers") {
    // classic-ish range; enough numbers for the grid
    const max = Math.max(75, size * size * 3);
    return Array.from({ length: max }, (_, i) => String(i + 1));
  }
  if (source === "custom") {
    const items = customText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return Array.from(new Set(items));
  }
  return PRESETS[source];
}

export interface GenerateOptions {
  source: ContentSource;
  customText: string;
  size: GridSize;
  count: number;
  freeSpace: boolean;
  freeText: string;
}

export interface GenerateResult {
  cards: BingoCard[];
  error?: string;
}

export function generateCards(opts: GenerateOptions): GenerateResult {
  const pool = buildPool(opts.source, opts.customText, opts.size);
  const total = opts.size * opts.size;
  const center = Math.floor(total / 2);
  const useFree = opts.freeSpace && opts.size % 2 === 1; // only odd grids have a true center
  const needed = useFree ? total - 1 : total;

  if (pool.length < needed) {
    return {
      cards: [],
      error: `You need at least ${needed} unique entries for a ${opts.size}×${opts.size} card — you have ${pool.length}.`,
    };
  }

  const cards: BingoCard[] = [];
  for (let c = 0; c < opts.count; c++) {
    const picked = shuffle(pool).slice(0, needed);
    const cells: string[] = [];
    let p = 0;
    for (let i = 0; i < total; i++) {
      if (useFree && i === center) {
        cells.push(opts.freeText || "FREE");
      } else {
        cells.push(picked[p++]);
      }
    }
    cards.push({
      id: crypto.randomUUID(),
      cells,
      freeIndex: useFree ? center : null,
    });
  }
  return { cards };
}

// ─── PNG export (canvas) ───────────────────────────────────────────────────

export function cardToCanvas(
  card: BingoCard,
  size: GridSize,
  theme: BingoTheme,
  title: string,
  cardNumber?: number,
): HTMLCanvasElement {
  const scale = 2; // retina
  const cell = 120;
  const pad = 24;
  const headerH = title ? 70 : 0;
  const footerH = 28;
  const w = pad * 2 + cell * size;
  const h = pad * 2 + headerH + cell * size + footerH;

  const canvas = document.createElement("canvas");
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // Card background
  ctx.fillStyle = theme.cardBg;
  ctx.fillRect(0, 0, w, h);

  // Header
  if (title) {
    roundRect(ctx, pad, pad, w - pad * 2, headerH - 12, theme.radius);
    ctx.fillStyle = theme.headerBg;
    ctx.fill();
    ctx.fillStyle = theme.headerText;
    ctx.font = "bold 30px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, w / 2, pad + (headerH - 12) / 2);
  }

  // Grid
  const gridTop = pad + headerH;
  for (let i = 0; i < card.cells.length; i++) {
    const row = Math.floor(i / size);
    const col = i % size;
    const x = pad + col * cell;
    const y = gridTop + row * cell;
    const isFree = i === card.freeIndex;
    const alt = (row + col) % 2 === 1;

    roundRect(ctx, x + 4, y + 4, cell - 8, cell - 8, theme.radius * 0.6);
    ctx.fillStyle = isFree ? theme.freeBg : alt ? theme.cellAltBg : theme.cellBg;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = theme.border;
    ctx.stroke();

    // text (auto-shrink for long content)
    const text = card.cells[i];
    ctx.fillStyle = isFree ? theme.freeText : theme.cellText;
    let fontSize = text.length > 8 ? 16 : text.length > 4 ? 22 : 30;
    if (/\p{Emoji}/u.test(text)) fontSize = 42;
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    wrapText(ctx, text, x + cell / 2, y + cell / 2, cell - 16, fontSize + 2);
  }

  // Footer
  ctx.fillStyle = theme.cellText;
  ctx.globalAlpha = 0.5;
  ctx.font = "13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `${cardNumber ? `Card #${cardNumber} · ` : ""}toollyz.com`,
    w / 2,
    h - footerH / 2,
  );
  ctx.globalAlpha = 1;

  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  const startY = cy - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, cx, startY + i * lineHeight));
}
