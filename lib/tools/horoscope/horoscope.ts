// Zodiac dataset, deterministic horoscope generation, compatibility math and
// share-image rendering. No external APIs — astrology content is generated
// locally and is stable for a given sign + period (entertainment use).

export type ElementId = "fire" | "earth" | "air" | "water";
export type ModalityId = "cardinal" | "fixed" | "mutable";
export type HoroscopePeriod = "daily" | "weekly" | "monthly" | "yearly";
export type HoroscopeFocus =
  | "general"
  | "love"
  | "career"
  | "health"
  | "finance"
  | "friendship";

export type SignId =
  | "aries" | "taurus" | "gemini" | "cancer" | "leo" | "virgo"
  | "libra" | "scorpio" | "sagittarius" | "capricorn" | "aquarius" | "pisces";

export interface ZodiacSign {
  id: SignId;
  name: string;
  symbol: string; // unicode glyph
  dates: string;
  element: ElementId;
  modality: ModalityId;
  planet: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  gradient: [string, string];
  accent: string;
  start: [number, number]; // [month 1-12, day]
  end: [number, number];
}

export const ZODIAC: ZodiacSign[] = [
  {
    id: "aries", name: "Aries", symbol: "♈", dates: "Mar 21 – Apr 19",
    element: "fire", modality: "cardinal", planet: "Mars",
    traits: ["Bold", "Driven", "Competitive", "Spontaneous"],
    strengths: ["Courageous", "Energetic", "Confident", "Honest"],
    weaknesses: ["Impatient", "Impulsive", "Short-tempered"],
    gradient: ["#ef4444", "#f97316"], accent: "#f97316",
    start: [3, 21], end: [4, 19],
  },
  {
    id: "taurus", name: "Taurus", symbol: "♉", dates: "Apr 20 – May 20",
    element: "earth", modality: "fixed", planet: "Venus",
    traits: ["Grounded", "Loyal", "Sensual", "Patient"],
    strengths: ["Reliable", "Devoted", "Practical", "Patient"],
    weaknesses: ["Stubborn", "Possessive", "Resistant to change"],
    gradient: ["#16a34a", "#65a30d"], accent: "#22c55e",
    start: [4, 20], end: [5, 20],
  },
  {
    id: "gemini", name: "Gemini", symbol: "♊", dates: "May 21 – Jun 20",
    element: "air", modality: "mutable", planet: "Mercury",
    traits: ["Curious", "Witty", "Adaptable", "Expressive"],
    strengths: ["Versatile", "Communicative", "Clever", "Sociable"],
    weaknesses: ["Indecisive", "Restless", "Inconsistent"],
    gradient: ["#eab308", "#06b6d4"], accent: "#06b6d4",
    start: [5, 21], end: [6, 20],
  },
  {
    id: "cancer", name: "Cancer", symbol: "♋", dates: "Jun 21 – Jul 22",
    element: "water", modality: "cardinal", planet: "Moon",
    traits: ["Nurturing", "Intuitive", "Protective", "Sentimental"],
    strengths: ["Loyal", "Empathetic", "Tenacious", "Caring"],
    weaknesses: ["Moody", "Over-sensitive", "Clingy"],
    gradient: ["#0ea5e9", "#6366f1"], accent: "#38bdf8",
    start: [6, 21], end: [7, 22],
  },
  {
    id: "leo", name: "Leo", symbol: "♌", dates: "Jul 23 – Aug 22",
    element: "fire", modality: "fixed", planet: "Sun",
    traits: ["Charismatic", "Generous", "Proud", "Warm"],
    strengths: ["Creative", "Confident", "Generous", "Loyal"],
    weaknesses: ["Arrogant", "Stubborn", "Self-centered"],
    gradient: ["#f59e0b", "#ef4444"], accent: "#f59e0b",
    start: [7, 23], end: [8, 22],
  },
  {
    id: "virgo", name: "Virgo", symbol: "♍", dates: "Aug 23 – Sep 22",
    element: "earth", modality: "mutable", planet: "Mercury",
    traits: ["Analytical", "Practical", "Diligent", "Modest"],
    strengths: ["Meticulous", "Reliable", "Kind", "Hardworking"],
    weaknesses: ["Overcritical", "Worrying", "Perfectionist"],
    gradient: ["#10b981", "#14b8a6"], accent: "#14b8a6",
    start: [8, 23], end: [9, 22],
  },
  {
    id: "libra", name: "Libra", symbol: "♎", dates: "Sep 23 – Oct 22",
    element: "air", modality: "cardinal", planet: "Venus",
    traits: ["Diplomatic", "Charming", "Fair", "Social"],
    strengths: ["Cooperative", "Gracious", "Balanced", "Idealistic"],
    weaknesses: ["Indecisive", "Avoids conflict", "People-pleasing"],
    gradient: ["#ec4899", "#a855f7"], accent: "#ec4899",
    start: [9, 23], end: [10, 22],
  },
  {
    id: "scorpio", name: "Scorpio", symbol: "♏", dates: "Oct 23 – Nov 21",
    element: "water", modality: "fixed", planet: "Pluto",
    traits: ["Intense", "Magnetic", "Passionate", "Perceptive"],
    strengths: ["Resourceful", "Brave", "Devoted", "Focused"],
    weaknesses: ["Jealous", "Secretive", "Resentful"],
    gradient: ["#7c3aed", "#db2777"], accent: "#a855f7",
    start: [10, 23], end: [11, 21],
  },
  {
    id: "sagittarius", name: "Sagittarius", symbol: "♐", dates: "Nov 22 – Dec 21",
    element: "fire", modality: "mutable", planet: "Jupiter",
    traits: ["Adventurous", "Optimistic", "Free-spirited", "Honest"],
    strengths: ["Generous", "Idealistic", "Funny", "Open-minded"],
    weaknesses: ["Tactless", "Restless", "Overconfident"],
    gradient: ["#f97316", "#a855f7"], accent: "#fb923c",
    start: [11, 22], end: [12, 21],
  },
  {
    id: "capricorn", name: "Capricorn", symbol: "♑", dates: "Dec 22 – Jan 19",
    element: "earth", modality: "cardinal", planet: "Saturn",
    traits: ["Ambitious", "Disciplined", "Patient", "Pragmatic"],
    strengths: ["Responsible", "Self-controlled", "Persistent", "Loyal"],
    weaknesses: ["Pessimistic", "Unforgiving", "Rigid"],
    gradient: ["#475569", "#0f766e"], accent: "#64748b",
    start: [12, 22], end: [1, 19],
  },
  {
    id: "aquarius", name: "Aquarius", symbol: "♒", dates: "Jan 20 – Feb 18",
    element: "air", modality: "fixed", planet: "Uranus",
    traits: ["Innovative", "Independent", "Humanitarian", "Original"],
    strengths: ["Progressive", "Inventive", "Loyal", "Idealistic"],
    weaknesses: ["Aloof", "Unpredictable", "Detached"],
    gradient: ["#06b6d4", "#6366f1"], accent: "#22d3ee",
    start: [1, 20], end: [2, 18],
  },
  {
    id: "pisces", name: "Pisces", symbol: "♓", dates: "Feb 19 – Mar 20",
    element: "water", modality: "mutable", planet: "Neptune",
    traits: ["Compassionate", "Artistic", "Dreamy", "Intuitive"],
    strengths: ["Empathetic", "Gentle", "Wise", "Creative"],
    weaknesses: ["Escapist", "Over-trusting", "Indecisive"],
    gradient: ["#6366f1", "#8b5cf6"], accent: "#818cf8",
    start: [2, 19], end: [3, 20],
  },
];

export const SIGN_BY_ID: Record<SignId, ZodiacSign> = Object.fromEntries(
  ZODIAC.map((s) => [s.id, s]),
) as Record<SignId, ZodiacSign>;

export const ELEMENTS: Record<
  ElementId,
  { label: string; emoji: string; gradient: [string, string]; blurb: string; signs: SignId[] }
> = {
  fire: {
    label: "Fire", emoji: "🔥", gradient: ["#ef4444", "#f97316"],
    blurb: "Passionate, dynamic and bold — Fire signs lead with energy and instinct.",
    signs: ["aries", "leo", "sagittarius"],
  },
  earth: {
    label: "Earth", emoji: "🌿", gradient: ["#16a34a", "#0d9488"],
    blurb: "Grounded, practical and dependable — Earth signs build things that last.",
    signs: ["taurus", "virgo", "capricorn"],
  },
  air: {
    label: "Air", emoji: "💨", gradient: ["#06b6d4", "#6366f1"],
    blurb: "Curious, social and intellectual — Air signs live in ideas and connection.",
    signs: ["gemini", "libra", "aquarius"],
  },
  water: {
    label: "Water", emoji: "🌊", gradient: ["#0ea5e9", "#8b5cf6"],
    blurb: "Emotional, intuitive and deep — Water signs feel everything profoundly.",
    signs: ["cancer", "scorpio", "pisces"],
  },
};

export const PERIOD_LABEL: Record<HoroscopePeriod, string> = {
  daily: "Today", weekly: "This week", monthly: "This month", yearly: "This year",
};

export const FOCUS_META: Record<HoroscopeFocus, { label: string; emoji: string }> = {
  general: { label: "Overview", emoji: "✨" },
  love: { label: "Love", emoji: "💖" },
  career: { label: "Career", emoji: "💼" },
  health: { label: "Health", emoji: "🧘" },
  finance: { label: "Finance", emoji: "💰" },
  friendship: { label: "Friendship", emoji: "🤝" },
};

// ─── Card themes ─────────────────────────────────────────────────────────────

export interface CosmicTheme {
  id: string;
  label: string;
  from: string;
  to: string;
  text: string;
  sub: string;
  accent: string;
}

export const THEMES: CosmicTheme[] = [
  { id: "cosmic", label: "Cosmic indigo", from: "#1e1b4b", to: "#4c1d95", text: "#f5f3ff", sub: "#c4b5fd", accent: "#fbbf24" },
  { id: "midnight", label: "Midnight blue", from: "#0f172a", to: "#1e3a8a", text: "#eff6ff", sub: "#93c5fd", accent: "#facc15" },
  { id: "nebula", label: "Nebula rose", from: "#4a044e", to: "#831843", text: "#fdf4ff", sub: "#f0abfc", accent: "#fcd34d" },
  { id: "aurora", label: "Aurora", from: "#042f2e", to: "#164e63", text: "#ecfeff", sub: "#5eead4", accent: "#fde047" },
  { id: "dusk", label: "Golden dusk", from: "#451a03", to: "#7c2d12", text: "#fff7ed", sub: "#fdba74", accent: "#fde68a" },
];

export const THEME_BY_ID: Record<string, CosmicTheme> = Object.fromEntries(
  THEMES.map((t) => [t.id, t]),
);

// ─── Deterministic RNG ───────────────────────────────────────────────────────

function hashStr(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type RNG = () => number;

function pick<T>(rng: RNG, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickN<T>(rng: RNG, arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

function range(rng: RNG, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// ─── Period keys ─────────────────────────────────────────────────────────────

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function periodKey(period: HoroscopePeriod, d: Date): string {
  const y = d.getFullYear();
  if (period === "yearly") return `${y}`;
  if (period === "monthly") return `${y}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  if (period === "weekly") return `${y}-W${isoWeek(d)}`;
  return isoDate(d);
}

export function periodDateLabel(period: HoroscopePeriod, d: Date): string {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (period === "yearly") return `${d.getFullYear()}`;
  if (period === "monthly") return `${months[d.getMonth()]} ${d.getFullYear()}`;
  if (period === "weekly") return `Week of ${months[d.getMonth()]} ${d.getDate()}`;
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// ─── Sign from birth date ────────────────────────────────────────────────────

export function signFromDate(month1to12: number, day: number): ZodiacSign {
  for (const s of ZODIAC) {
    const [sm, sd] = s.start;
    const [em, ed] = s.end;
    if (sm <= em) {
      if ((month1to12 === sm && day >= sd) || (month1to12 === em && day <= ed) ||
          (month1to12 > sm && month1to12 < em)) {
        return s;
      }
    } else {
      // wraps year-end (Capricorn)
      if ((month1to12 === sm && day >= sd) || (month1to12 === em && day <= ed) ||
          month1to12 > sm || month1to12 < em) {
        return s;
      }
    }
  }
  return SIGN_BY_ID.aries;
}

// ─── Phrase banks ────────────────────────────────────────────────────────────

const HEADLINES: Record<HoroscopeFocus, string[]> = {
  general: [
    "The stars align in your favor",
    "A day to trust your instincts",
    "Cosmic momentum is building",
    "Clarity arrives through stillness",
    "The universe rewards your patience",
    "A turning point glimmers ahead",
    "Energy shifts toward new beginnings",
    "Quiet confidence is your superpower",
  ],
  love: [
    "Hearts open under a tender sky",
    "Connection deepens beautifully",
    "Love speaks in small gestures",
    "Vulnerability becomes your strength",
    "A spark waits to be noticed",
    "Romance flows when you slow down",
  ],
  career: [
    "Ambition meets opportunity",
    "Your effort is finally seen",
    "A bold move pays off",
    "Focus turns ideas into results",
    "Recognition is closer than it seems",
    "Lead with vision, not volume",
  ],
  health: [
    "Your body asks for balance",
    "Rest is productive too",
    "Energy returns through routine",
    "Listen to what your body whispers",
    "Small habits, big renewal",
    "Calm is your medicine today",
  ],
  finance: [
    "Abundance favors the prepared",
    "A smart choice steadies your path",
    "Patience protects your resources",
    "Value clarity over impulse",
    "Steady steps build real security",
    "Opportunity hides in the details",
  ],
  friendship: [
    "Your circle grows warmer",
    "A friend becomes a mirror",
    "Connection over perfection",
    "Reach out — someone is waiting",
    "Loyalty is quietly rewarded",
    "Shared laughter lifts the day",
  ],
};

const MAIN: Record<HoroscopeFocus, string[]> = {
  general: [
    "The cosmos invites you to move with intention today. What felt heavy recently begins to lighten as you release the need to control every outcome. Trust the timing of your life — the right doors are opening quietly.",
    "A gentle but powerful shift is underway. You may feel pulled between comfort and change; lean toward growth. The energy around you supports honest decisions and small acts of courage that compound into something meaningful.",
    "Your intuition is unusually sharp right now. Pay attention to the synchronicities, the repeated thoughts, the names that keep surfacing. The universe communicates in patterns, and you are finally fluent enough to read them.",
    "This is a season of recalibration. Instead of forcing progress, let clarity find you in moments of stillness. The most important breakthrough today may arrive disguised as a pause rather than a push.",
    "Momentum is on your side, but the planets ask for discernment. Channel your energy into what truly matters and let the rest fall away. You are being guided toward simplicity, focus and quiet self-respect.",
    "An old chapter is closing to make room for something brighter. Honor what you've learned, then turn the page without fear. The stars remind you that endings and beginnings are the same doorway seen from two sides.",
  ],
  love: [
    "In matters of the heart, sincerity outshines grand gestures today. Whether single or partnered, the most magnetic thing you can offer is your authentic presence. Let someone see the real you — that's where intimacy begins.",
    "Venus encourages tenderness and patience. If a relationship has felt distant, a small, genuine reach-out can rebuild the bridge. If you're searching, stop performing and start being; the right connection is drawn to your truth.",
    "Emotions run deep but beautifully. This is a moment to express what you usually hold back. Honesty, offered gently, deepens the bonds that matter and gracefully loosens the ones that don't.",
    "Love asks you to balance giving and receiving. You pour so much into others — today, let yourself be cared for too. The cosmos is realigning your relationships around mutual respect and warmth.",
  ],
  career: [
    "Professionally, the stars favor focused ambition. A project or idea you've nurtured is ready for a bolder step. Speak up, share your vision, and let your competence — not your anxiety — do the talking.",
    "Recognition may come from an unexpected direction. Keep doing excellent work even when no one seems to notice; the universe is keeping score. A conversation today could quietly reshape your trajectory.",
    "Discipline turns potential into momentum. Resist the urge to chase every shiny distraction and protect your deep-work hours. One well-finished task will move you further than ten half-started ones.",
    "Leadership energy surrounds you. Whether or not you hold the title, others are looking to your steadiness. Lead with clarity and generosity, and doors that once felt locked will begin to open.",
  ],
  health: [
    "Your wellbeing thrives on rhythm today. Sleep, water, movement and a little sunlight will do more than any quick fix. Treat rest as a form of ambition — your future self is built in these quiet habits.",
    "The body and mind are speaking the same language now. Notice where you hold tension and breathe into it. A short walk, a real meal, or simply unplugging could reset your entire energy field.",
    "Balance is the theme. If you've been running on adrenaline, the stars gently insist on recovery. Protect your peace, lower the noise, and let your nervous system catch up with your ambitions.",
    "Vitality returns through small, kind choices. You don't need a dramatic overhaul — just one healthier decision repeated. Your energy is a garden; water it consistently and it will bloom.",
  ],
  finance: [
    "Financially, clarity beats impulse today. Review before you commit, and let patience be your strategy. A measured choice now protects the abundance you're steadily building.",
    "The planets favor practical optimism around money. An opportunity may appear, but read the fine print. Security grows not from luck but from the calm, consistent decisions you make this week.",
    "Resources flow toward focus. Trim what drains you — subscriptions, obligations, habits — and redirect that energy toward what genuinely grows. Value is hiding in the details you usually skip.",
    "This is a moment to align spending with values. When your money reflects what truly matters to you, anxiety fades and confidence returns. The stars reward intention over impulse.",
  ],
  friendship: [
    "Your social world is warming up. A message you send today could mean more to someone than you realize. Friendship is built in the small, unglamorous moments of showing up — so show up.",
    "The cosmos highlights your chosen family. Reconnect with someone who knows the real you; their perspective could be exactly the clarity you need. Generosity of attention is your gift today.",
    "Loyalty is quietly tested and rewarded. Be the friend you wish you had — listen more than you advise. The bonds you nurture now become the support system of your future self.",
    "Laughter is medicine and connection is currency. Step away from the screen and into a real conversation. The universe is reminding you that you are not meant to do this alone.",
  ],
};

const ADVICE = [
  "Don't mistake busyness for progress — choose one thing and do it well.",
  "Guard your energy; not every invitation deserves a yes.",
  "Say the kind thing out loud before the moment passes.",
  "Avoid reacting from old wounds; respond from who you're becoming.",
  "Let go of needing to be understood by everyone.",
  "Rest before you're empty, not after.",
  "Trust the quiet voice over the loud crowd.",
  "Finish what you started before chasing something new.",
  "Protect your mornings — they set the tone for everything.",
  "Forgive yourself for the version of you that didn't know better.",
  "Beware of overthinking a decision your heart already made.",
  "Be generous, but not at the cost of your own peace.",
];

const MOODS = [
  { word: "Radiant", emoji: "✨" },
  { word: "Reflective", emoji: "🌙" },
  { word: "Energized", emoji: "⚡" },
  { word: "Serene", emoji: "🕊️" },
  { word: "Passionate", emoji: "🔥" },
  { word: "Focused", emoji: "🎯" },
  { word: "Dreamy", emoji: "💫" },
  { word: "Grounded", emoji: "🌿" },
  { word: "Curious", emoji: "🔮" },
  { word: "Hopeful", emoji: "🌅" },
  { word: "Magnetic", emoji: "🧲" },
  { word: "Playful", emoji: "🎈" },
];

const LUCKY_COLORS = [
  { name: "Crimson", hex: "#dc2626" }, { name: "Gold", hex: "#f59e0b" },
  { name: "Emerald", hex: "#10b981" }, { name: "Sapphire", hex: "#0ea5e9" },
  { name: "Amethyst", hex: "#8b5cf6" }, { name: "Rose", hex: "#ec4899" },
  { name: "Turquoise", hex: "#14b8a6" }, { name: "Coral", hex: "#fb7185" },
  { name: "Indigo", hex: "#6366f1" }, { name: "Silver", hex: "#94a3b8" },
  { name: "Ruby", hex: "#e11d48" }, { name: "Jade", hex: "#22c55e" },
  { name: "Topaz", hex: "#eab308" }, { name: "Lavender", hex: "#a78bfa" },
];

const LUCKY_TIMES = [
  "6:00 AM", "7:30 AM", "9:00 AM", "10:30 AM", "Noon", "1:15 PM",
  "3:00 PM", "4:45 PM", "6:30 PM", "8:00 PM", "9:45 PM", "Midnight",
];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ─── Reading ─────────────────────────────────────────────────────────────────

export interface LuckyColor { name: string; hex: string }

export interface Reading {
  signId: SignId;
  period: HoroscopePeriod;
  focus: HoroscopeFocus;
  dateLabel: string;
  key: string;
  headline: string;
  main: string;
  sections: Record<Exclude<HoroscopeFocus, "general">, string>;
  mood: { word: string; emoji: string };
  meters: { energy: number; love: number; career: number; health: number; luck: number };
  lucky: { numbers: number[]; colors: LuckyColor[]; time: string; day: string };
  compatibleToday: SignId[];
  advice: string;
}

const LIFE_AREAS: Exclude<HoroscopeFocus, "general">[] = [
  "love", "career", "health", "finance", "friendship",
];

export function generateHoroscope(
  signId: SignId,
  period: HoroscopePeriod,
  focus: HoroscopeFocus,
  date: Date = new Date(),
): Reading {
  const key = periodKey(period, date);
  const seed = hashStr(`${signId}|${key}|${period}`);
  const rng = mulberry32(seed);

  const headline = pick(rng, HEADLINES[focus]);
  const main = pick(rng, MAIN[focus]);

  const sections = {} as Record<Exclude<HoroscopeFocus, "general">, string>;
  for (const area of LIFE_AREAS) {
    const r = mulberry32(hashStr(`${signId}|${key}|${area}`));
    sections[area] = pick(r, MAIN[area]);
  }

  const numbers = pickN(rng, Array.from({ length: 60 }, (_, i) => i + 1), 4).sort((a, b) => a - b);
  const colors = pickN(rng, LUCKY_COLORS, 2);
  const time = pick(rng, LUCKY_TIMES);
  const day = pick(rng, WEEKDAYS);

  const compatibleToday = rankCompatibility(signId)
    .slice(0, 5)
    .map((c) => c.id);
  const compat = pickN(rng, compatibleToday, 3);

  return {
    signId, period, focus, key,
    dateLabel: periodDateLabel(period, date),
    headline, main, sections,
    mood: pick(rng, MOODS),
    meters: {
      energy: range(rng, 45, 99),
      love: range(rng, 40, 99),
      career: range(rng, 45, 99),
      health: range(rng, 45, 99),
      luck: range(rng, 50, 99),
    },
    lucky: { numbers, colors, time, day },
    compatibleToday: compat,
    advice: pick(rng, ADVICE),
  };
}

// ─── Compatibility ───────────────────────────────────────────────────────────

const ELEMENT_GROUP: Record<ElementId, SignId[]> = {
  fire: ELEMENTS.fire.signs,
  earth: ELEMENTS.earth.signs,
  air: ELEMENTS.air.signs,
  water: ELEMENTS.water.signs,
};

function signIndex(id: SignId): number {
  return ZODIAC.findIndex((s) => s.id === id);
}

function baseCompat(a: ZodiacSign, b: ZodiacSign): number {
  if (a.id === b.id) return 78;
  if (a.element === b.element) return 88;
  const compatible =
    (a.element === "fire" && b.element === "air") ||
    (a.element === "air" && b.element === "fire") ||
    (a.element === "earth" && b.element === "water") ||
    (a.element === "water" && b.element === "earth");
  if (compatible) return 82;
  return 55;
}

export interface Compatibility {
  a: SignId;
  b: SignId;
  score: number;
  emotional: number;
  communication: number;
  trust: number;
  passion: number;
  longTerm: number;
  band: "soulmates" | "great" | "good" | "growth";
  summary: string;
  strengths: string;
  conflicts: string;
  outlook: string;
}

export function compatibility(aId: SignId, bId: SignId): Compatibility {
  const a = SIGN_BY_ID[aId];
  const b = SIGN_BY_ID[bId];
  let score = baseCompat(a, b);

  const dist = Math.abs(signIndex(a.id) - signIndex(b.id));
  const sep = Math.min(dist, 12 - dist); // 0..6
  if (sep === 6) score += 6; // opposites attract
  if (sep === 2) score += 4; // sextile
  if (sep === 3) score -= 6; // square tension
  if (a.modality === b.modality && a.id !== b.id) score -= 3;

  const rng = mulberry32(hashStr([aId, bId].sort().join("+")));
  score += range(rng, -6, 8);
  score = Math.max(38, Math.min(99, score));

  const sub = (offset: number) =>
    Math.max(35, Math.min(99, score + range(rng, -12, 12) + offset));
  const emotional = sub(a.element === "water" || b.element === "water" ? 4 : 0);
  const communication = sub(a.element === "air" || b.element === "air" ? 4 : 0);
  const trust = sub(a.element === "earth" || b.element === "earth" ? 4 : 0);
  const passion = sub(a.element === "fire" || b.element === "fire" ? 5 : 0);
  const longTerm = sub(a.modality === "fixed" && b.modality === "fixed" ? 3 : 0);

  const band: Compatibility["band"] =
    score >= 88 ? "soulmates" : score >= 75 ? "great" : score >= 62 ? "good" : "growth";

  const summaryBank: Record<Compatibility["band"], string> = {
    soulmates: `${a.name} and ${b.name} share a rare, intuitive resonance. You understand each other on a level that feels almost cosmic — a connection built to last.`,
    great: `${a.name} and ${b.name} make a naturally harmonious pair. Your energies complement each other, creating warmth, balance and genuine ease.`,
    good: `${a.name} and ${b.name} have real potential. With understanding and effort, your differences become the very things that keep the bond exciting.`,
    growth: `${a.name} and ${b.name} are a growth match. The contrast between you can spark friction — but also profound learning if you both stay open and patient.`,
  };

  const sameElement = a.element === b.element;
  const strengths = sameElement
    ? `You share the ${ELEMENTS[a.element].label} element, so you instinctively "get" each other's pace, values and emotional language.`
    : `${a.name}'s ${ELEMENTS[a.element].label} energy and ${b.name}'s ${ELEMENTS[b.element].label} energy balance one another — where one runs short, the other naturally fills the gap.`;

  const conflicts =
    sep === 3
      ? `As squared signs, you can push each other's buttons. Power struggles and stubbornness are the main hurdle — name tension early instead of letting it simmer.`
      : a.modality === b.modality
        ? `You're both ${a.modality} signs, so you can lock horns when neither wants to budge. Practice flexibility and take turns leading.`
        : `Your different rhythms can cause occasional misreadings. A little patience and clear communication smooth almost everything over.`;

  const outlook =
    score >= 80
      ? "Long-term outlook: excellent. With mutual respect, this is a bond that deepens with time."
      : score >= 65
        ? "Long-term outlook: promising. Keep communicating honestly and this connection can truly flourish."
        : "Long-term outlook: workable. Success depends on patience, compromise and celebrating your differences.";

  return {
    a: aId, b: bId, score, emotional, communication, trust, passion, longTerm,
    band, summary: summaryBank[band], strengths, conflicts, outlook,
  };
}

export function rankCompatibility(id: SignId): { id: SignId; score: number }[] {
  return ZODIAC
    .filter((s) => s.id !== id)
    .map((s) => ({ id: s.id, score: compatibility(id, s.id).score }))
    .sort((x, y) => y.score - x.score);
}

// ─── Daily cosmic insight (sign-independent) ─────────────────────────────────

export function signOfTheDay(date: Date = new Date()): SignId {
  const rng = mulberry32(hashStr(`sign-of-day|${isoDate(date)}`));
  return ZODIAC[Math.floor(rng() * ZODIAC.length)].id;
}

// ─── Zodiac facts ────────────────────────────────────────────────────────────

export const ZODIAC_FACTS = [
  "The word 'zodiac' comes from the Greek 'zodiakos kyklos' — 'circle of little animals'.",
  "There are 12 zodiac signs, each spanning roughly 30° of the ecliptic — the Sun's apparent yearly path.",
  "Fire and Air signs are considered 'masculine' (active) while Earth and Water are 'feminine' (receptive).",
  "Opposite signs on the wheel — like Aries & Libra — often attract each other intensely.",
  "Mercury rules both Gemini and Virgo, which is why both signs are so quick-minded.",
  "Scorpio is the only sign with three symbols: the scorpion, the eagle and the phoenix.",
  "The Moon rules Cancer, linking the sign to tides, emotions and the rhythms of home.",
  "Each element — Fire, Earth, Air, Water — contains exactly three signs, called a 'triplicity'.",
  "Cardinal signs start each season, Fixed signs sustain it, and Mutable signs transition out of it.",
  "Astrology is one of humanity's oldest practices, dating back over 4,000 years to Babylon.",
];

// ─── Share image (canvas) ────────────────────────────────────────────────────

export function horoscopeShareCanvas(
  reading: Reading,
  theme: CosmicTheme,
): HTMLCanvasElement {
  const sign = SIGN_BY_ID[reading.signId];
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Background gradient
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, theme.from);
  g.addColorStop(1, theme.to);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Starfield
  const rng = mulberry32(hashStr(`${reading.signId}|${reading.key}|stars`));
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 90; i++) {
    const x = rng() * W;
    const y = rng() * H;
    const r = rng() * 1.8 + 0.3;
    ctx.globalAlpha = 0.2 + rng() * 0.7;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Glow halo behind symbol
  const halo = ctx.createRadialGradient(W / 2, 300, 20, W / 2, 300, 240);
  halo.addColorStop(0, hexA(theme.accent, 0.45));
  halo.addColorStop(1, hexA(theme.accent, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(0, 60, W, 480);

  // Symbol
  ctx.fillStyle = theme.accent;
  ctx.font = "240px system-ui, 'Segoe UI Symbol', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sign.symbol, W / 2, 300);

  // Sign name
  ctx.fillStyle = theme.text;
  ctx.font = "bold 76px Georgia, serif";
  ctx.fillText(sign.name, W / 2, 500);

  // Period + date
  ctx.fillStyle = theme.sub;
  ctx.font = "600 30px system-ui, sans-serif";
  ctx.fillText(
    `${PERIOD_LABEL[reading.period].toUpperCase()} · ${reading.dateLabel.toUpperCase()}`,
    W / 2,
    560,
  );

  // Headline
  ctx.fillStyle = theme.accent;
  ctx.font = "italic 40px Georgia, serif";
  wrapText(ctx, `"${reading.headline}"`, W / 2, 640, 880, 50, 2);

  // Main text
  ctx.fillStyle = theme.text;
  ctx.font = "32px system-ui, sans-serif";
  ctx.textAlign = "center";
  const used = wrapText(ctx, reading.main, W / 2, 760, 880, 46, 5);

  // Lucky strip
  const stripY = 760 + used * 46 + 40;
  ctx.fillStyle = theme.sub;
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillText(
    `Lucky numbers ${reading.lucky.numbers.join("  ")}   ·   Mood ${reading.mood.word}`,
    W / 2,
    Math.min(stripY, H - 90),
  );

  // Footer
  ctx.fillStyle = hexA(theme.text, 0.6);
  ctx.font = "24px system-ui, sans-serif";
  ctx.fillText("toollyz.com/tools/horoscope-generator", W / 2, H - 44);

  return canvas;
}

function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
): number {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines) break;
    } else {
      line = test;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  const out = lines.slice(0, maxLines);
  out.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return out.length;
}

// ─── Text export ─────────────────────────────────────────────────────────────

export function readingToText(reading: Reading): string {
  const sign = SIGN_BY_ID[reading.signId];
  const L = reading.lucky;
  return [
    `${sign.symbol} ${sign.name} — ${PERIOD_LABEL[reading.period]} horoscope`,
    reading.dateLabel,
    "",
    `"${reading.headline}"`,
    "",
    reading.main,
    "",
    `Mood: ${reading.mood.word} ${reading.mood.emoji}`,
    `Lucky numbers: ${L.numbers.join(", ")}`,
    `Lucky colors: ${L.colors.map((c) => c.name).join(", ")}`,
    `Lucky time: ${L.time}   Lucky day: ${L.day}`,
    `Compatible today: ${reading.compatibleToday.map((c) => SIGN_BY_ID[c].name).join(", ")}`,
    "",
    `Cosmic advice: ${reading.advice}`,
    "",
    "— Generated with toollyz.com",
  ].join("\n");
}
