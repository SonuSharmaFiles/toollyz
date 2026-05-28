export type QuoteCategory =
  | "motivation"
  | "success"
  | "business"
  | "leadership"
  | "philosophy"
  | "stoicism"
  | "happiness"
  | "life"
  | "creativity"
  | "wisdom"
  | "mindfulness"
  | "funny";

export interface CategoryConfig {
  id: QuoteCategory;
  label: string;
  emoji: string;
  accent: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: "motivation", label: "Motivation", emoji: "🔥", accent: "text-orange-500" },
  { id: "success", label: "Success", emoji: "🏆", accent: "text-amber-500" },
  { id: "business", label: "Business & Startup", emoji: "💼", accent: "text-sky-500" },
  { id: "leadership", label: "Leadership", emoji: "🧭", accent: "text-cyan-500" },
  { id: "philosophy", label: "Philosophy", emoji: "🏛️", accent: "text-violet-500" },
  { id: "stoicism", label: "Stoicism", emoji: "🗿", accent: "text-slate-500" },
  { id: "happiness", label: "Happiness", emoji: "☀️", accent: "text-yellow-500" },
  { id: "life", label: "Life", emoji: "🌱", accent: "text-emerald-500" },
  { id: "creativity", label: "Creativity", emoji: "🎨", accent: "text-fuchsia-500" },
  { id: "wisdom", label: "Wisdom", emoji: "🦉", accent: "text-indigo-500" },
  { id: "mindfulness", label: "Mindfulness", emoji: "🧘", accent: "text-teal-500" },
  { id: "funny", label: "Funny", emoji: "😄", accent: "text-pink-500" },
];

export const CATEGORY_BY_ID: Record<QuoteCategory, CategoryConfig> =
  Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
    QuoteCategory,
    CategoryConfig
  >;

export interface Quote {
  text: string;
  author: string;
  c: QuoteCategory;
}

const RAW: Record<QuoteCategory, [string, string][]> = {
  motivation: [
    ["The only way to do great work is to love what you do.", "Steve Jobs"],
    ["Believe you can and you're halfway there.", "Theodore Roosevelt"],
    ["It always seems impossible until it's done.", "Nelson Mandela"],
    ["The future belongs to those who believe in the beauty of their dreams.", "Eleanor Roosevelt"],
    ["Don't watch the clock; do what it does. Keep going.", "Sam Levenson"],
    ["Act as if what you do makes a difference. It does.", "William James"],
    ["Hardships often prepare ordinary people for an extraordinary destiny.", "C.S. Lewis"],
    ["Start where you are. Use what you have. Do what you can.", "Arthur Ashe"],
  ],
  success: [
    ["I have not failed. I've just found 10,000 ways that won't work.", "Thomas Edison"],
    ["Success is not final, failure is not fatal: it is the courage to continue that counts.", "Winston Churchill"],
    ["Try not to become a person of success, but rather try to become a person of value.", "Albert Einstein"],
    ["Opportunities don't happen. You create them.", "Chris Grosser"],
    ["Don't be afraid to give up the good to go for the great.", "John D. Rockefeller"],
    ["The road to success and the road to failure are almost exactly the same.", "Colin R. Davis"],
    ["Success usually comes to those who are too busy to be looking for it.", "Henry David Thoreau"],
    ["Success is not how high you have climbed, but how you make a positive difference to the world.", "Roy T. Bennett"],
  ],
  business: [
    ["Your most unhappy customers are your greatest source of learning.", "Bill Gates"],
    ["The way to get started is to quit talking and begin doing.", "Walt Disney"],
    ["If you are not embarrassed by the first version of your product, you've launched too late.", "Reid Hoffman"],
    ["The best way to predict the future is to invent it.", "Alan Kay"],
    ["Chase the vision, not the money; the money will end up following you.", "Tony Hsieh"],
    ["Make something people want.", "Paul Graham"],
    ["Ideas are easy. Implementation is hard.", "Guy Kawasaki"],
    ["A business that makes nothing but money is a poor business.", "Henry Ford"],
  ],
  leadership: [
    ["A leader is one who knows the way, goes the way, and shows the way.", "John C. Maxwell"],
    ["Leadership is the capacity to translate vision into reality.", "Warren Bennis"],
    ["Before you are a leader, success is about growing yourself. When you become a leader, success is about growing others.", "Jack Welch"],
    ["If your actions inspire others to dream more, learn more, do more and become more, you are a leader.", "John Quincy Adams"],
    ["Do not follow where the path may lead. Go instead where there is no path and leave a trail.", "Ralph Waldo Emerson"],
    ["The function of leadership is to produce more leaders, not more followers.", "Ralph Nader"],
    ["The greatest leader is not the one who does the greatest things, but the one who gets people to do great things.", "Ronald Reagan"],
    ["Earn your leadership every day.", "Michael Jordan"],
  ],
  philosophy: [
    ["The unexamined life is not worth living.", "Socrates"],
    ["I think, therefore I am.", "René Descartes"],
    ["He who has a why to live can bear almost any how.", "Friedrich Nietzsche"],
    ["Happiness depends upon ourselves.", "Aristotle"],
    ["We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "Will Durant"],
    ["The only true wisdom is in knowing you know nothing.", "Socrates"],
    ["Knowing yourself is the beginning of all wisdom.", "Aristotle"],
    ["Man is condemned to be free.", "Jean-Paul Sartre"],
  ],
  stoicism: [
    ["You have power over your mind — not outside events. Realize this, and you will find strength.", "Marcus Aurelius"],
    ["We suffer more often in imagination than in reality.", "Seneca"],
    ["Wealth consists not in having great possessions, but in having few wants.", "Epictetus"],
    ["The happiness of your life depends upon the quality of your thoughts.", "Marcus Aurelius"],
    ["It is not death that a man should fear, but never beginning to live.", "Marcus Aurelius"],
    ["Luck is what happens when preparation meets opportunity.", "Seneca"],
    ["First say to yourself what you would be; and then do what you have to do.", "Epictetus"],
    ["Difficulties strengthen the mind, as labor does the body.", "Seneca"],
  ],
  happiness: [
    ["Happiness is not something ready made. It comes from your own actions.", "Dalai Lama"],
    ["For every minute you are angry you lose sixty seconds of happiness.", "Ralph Waldo Emerson"],
    ["Happiness is when what you think, what you say, and what you do are in harmony.", "Mahatma Gandhi"],
    ["The most important thing is to enjoy your life — to be happy — it's all that matters.", "Audrey Hepburn"],
    ["The purpose of our lives is to be happy.", "Dalai Lama"],
    ["Joy is not in things; it is in us.", "Richard Wagner"],
    ["Happiness often sneaks in through a door you didn't know you left open.", "John Barrymore"],
    ["The secret of happiness is to find a congenial monotony.", "V.S. Pritchett"],
  ],
  life: [
    ["Life is what happens when you're busy making other plans.", "John Lennon"],
    ["Life is really simple, but we insist on making it complicated.", "Confucius"],
    ["Life is 10% what happens to us and 90% how we react to it.", "Charles R. Swindoll"],
    ["Get busy living or get busy dying.", "Stephen King"],
    ["You only live once, but if you do it right, once is enough.", "Mae West"],
    ["The purpose of life is a life of purpose.", "Robert Byrne"],
    ["In the end, it's not the years in your life that count. It's the life in your years.", "Abraham Lincoln"],
    ["Life is short, and it's up to you to make it sweet.", "Sarah Louise Delany"],
  ],
  creativity: [
    ["Imagination is more important than knowledge.", "Albert Einstein"],
    ["You can't use up creativity. The more you use, the more you have.", "Maya Angelou"],
    ["Every child is an artist. The problem is how to remain an artist once we grow up.", "Pablo Picasso"],
    ["Creativity takes courage.", "Henri Matisse"],
    ["The chief enemy of creativity is good sense.", "Pablo Picasso"],
    ["To live a creative life, we must lose our fear of being wrong.", "Joseph Chilton Pearce"],
    ["Don't think. Thinking is the enemy of creativity.", "Ray Bradbury"],
    ["Creativity is intelligence having fun.", "Albert Einstein"],
  ],
  wisdom: [
    ["It does not matter how slowly you go as long as you do not stop.", "Confucius"],
    ["The journey of a thousand miles begins with one step.", "Lao Tzu"],
    ["What you seek is seeking you.", "Rumi"],
    ["The wound is the place where the Light enters you.", "Rumi"],
    ["Knowing others is wisdom, knowing yourself is enlightenment.", "Lao Tzu"],
    ["Patience is bitter, but its fruit is sweet.", "Jean-Jacques Rousseau"],
    ["Yesterday is history, tomorrow is a mystery, today is a gift.", "Bil Keane"],
    ["He who knows that enough is enough will always have enough.", "Lao Tzu"],
  ],
  mindfulness: [
    ["Wherever you are, be there totally.", "Eckhart Tolle"],
    ["You can't stop the waves, but you can learn to surf.", "Jon Kabat-Zinn"],
    ["The present moment is the only time over which we have dominion.", "Thích Nhất Hạnh"],
    ["Mindfulness isn't difficult, we just need to remember to do it.", "Sharon Salzberg"],
    ["The little things? The little moments? They aren't little.", "Jon Kabat-Zinn"],
    ["Quiet the mind, and the soul will speak.", "Ma Jaya Sati Bhagavati"],
    ["Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.", "Thích Nhất Hạnh"],
    ["Smile, breathe and go slowly.", "Thích Nhất Hạnh"],
  ],
  funny: [
    ["The trouble with having an open mind is that people keep coming along and sticking things into it.", "Terry Pratchett"],
    ["People say nothing is impossible, but I do nothing every day.", "A.A. Milne"],
    ["I always wanted to be somebody, but now I realize I should have been more specific.", "Lily Tomlin"],
    ["Do not take life too seriously. You will never get out of it alive.", "Elbert Hubbard"],
    ["I can resist everything except temptation.", "Oscar Wilde"],
    ["I'm writing a book. I've got the page numbers done.", "Steven Wright"],
    ["The early bird might get the worm, but the second mouse gets the cheese.", "Steven Wright"],
    ["Always borrow money from a pessimist. He won't expect it back.", "Oscar Wilde"],
  ],
};

export const QUOTES: Quote[] = (Object.keys(RAW) as QuoteCategory[]).flatMap((cat) =>
  RAW[cat].map(([text, author]) => ({ text, author, c: cat })),
);

export const AUTHORS: string[] = Array.from(
  new Set(QUOTES.map((q) => q.author)),
).sort();

// ─── Random + daily ─────────────────────────────────────────────────────────

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

function poolFor(category: QuoteCategory | "all", author: string | "all"): Quote[] {
  let pool = QUOTES;
  if (category !== "all") pool = pool.filter((q) => q.c === category);
  if (author !== "all") pool = pool.filter((q) => q.author === author);
  return pool.length ? pool : QUOTES;
}

export function randomQuote(
  category: QuoteCategory | "all",
  author: string | "all" = "all",
): Quote {
  const pool = poolFor(category, author);
  return pool[secureInt(pool.length)];
}

export function randomQuotes(
  category: QuoteCategory | "all",
  author: string | "all",
  count: number,
): Quote[] {
  const pool = poolFor(category, author);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = secureInt(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const out = shuffled.slice(0, Math.min(count, shuffled.length));
  while (out.length < count) out.push(pool[secureInt(pool.length)]);
  return out;
}

export function similarQuote(quote: Quote): Quote {
  const pool = QUOTES.filter((q) => q.c === quote.c && q.text !== quote.text);
  const list = pool.length ? pool : QUOTES;
  return list[secureInt(list.length)];
}

export function dailyQuote(): Quote {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  const seed = dayOfYear + now.getFullYear() * 366;
  return QUOTES[seed % QUOTES.length];
}

export function quoteText(q: Quote): string {
  return `"${q.text}" — ${q.author}`;
}

export function readingSeconds(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(3, Math.round((words / 200) * 60));
}

export function searchQuotes(query: string, limit = 30): Quote[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return QUOTES.filter(
    (x) => x.text.toLowerCase().includes(q) || x.author.toLowerCase().includes(q),
  ).slice(0, limit);
}

// ─── Gradient themes for cards + image export ────────────────────────────────

export interface QuoteTheme {
  id: string;
  label: string;
  from: string;
  to: string;
  text: string;
  sub: string;
}

export const THEMES: QuoteTheme[] = [
  { id: "indigo", label: "Indigo night", from: "#1e1b4b", to: "#4338ca", text: "#ffffff", sub: "#c7d2fe" },
  { id: "sunset", label: "Sunset", from: "#7c2d12", to: "#db2777", text: "#fff7ed", sub: "#fed7aa" },
  { id: "ocean", label: "Ocean", from: "#0c4a6e", to: "#0891b2", text: "#ecfeff", sub: "#a5f3fc" },
  { id: "forest", label: "Forest", from: "#14532d", to: "#15803d", text: "#f0fdf4", sub: "#bbf7d0" },
  { id: "mono", label: "Mono dark", from: "#0f172a", to: "#334155", text: "#f8fafc", sub: "#94a3b8" },
  { id: "rose", label: "Rose gold", from: "#831843", to: "#be185d", text: "#fff1f2", sub: "#fbcfe8" },
];

export const THEME_BY_ID: Record<string, QuoteTheme> = Object.fromEntries(
  THEMES.map((t) => [t.id, t]),
);

export function quoteImageCanvas(quote: Quote, theme: QuoteTheme): HTMLCanvasElement {
  const scale = 2;
  const w = 1080;
  const h = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, theme.from);
  grad.addColorStop(1, theme.to);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Big opening quote mark
  ctx.fillStyle = theme.sub;
  ctx.globalAlpha = 0.35;
  ctx.font = "bold 200px Georgia, serif";
  ctx.textAlign = "left";
  ctx.fillText("“", 90, 280);
  ctx.globalAlpha = 1;

  // Quote text — wrapped, centered
  ctx.fillStyle = theme.text;
  ctx.textAlign = "center";
  const maxWidth = w - 200;
  const fontSize = quote.text.length > 120 ? 44 : quote.text.length > 70 ? 52 : 62;
  ctx.font = `600 ${fontSize}px Georgia, serif`;
  const lines = wrap(ctx, quote.text, maxWidth);
  const lineHeight = fontSize * 1.35;
  const blockHeight = lines.length * lineHeight;
  let y = h / 2 - blockHeight / 2 + fontSize / 2;
  for (const line of lines) {
    ctx.fillText(line, w / 2, y);
    y += lineHeight;
  }

  // Author
  ctx.fillStyle = theme.sub;
  ctx.font = "500 34px system-ui, sans-serif";
  ctx.fillText(`— ${quote.author}`, w / 2, y + 40);

  // Footer
  ctx.globalAlpha = 0.5;
  ctx.font = "24px system-ui, sans-serif";
  ctx.fillText("toollyz.com", w / 2, h - 60);
  ctx.globalAlpha = 1;

  return canvas;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
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
  return lines;
}
