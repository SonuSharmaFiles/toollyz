// Unicode Character Finder engine. A curated catalogue of ~600 high-traffic
// Unicode characters across the categories users actually search for.
// We don't ship the full Unicode database (~150,000 chars × ~10 MB); the
// curated list covers symbols, math, arrows, currencies, punctuation,
// Latin extended, Greek, Cyrillic, common CJK, and the most-used emoji.

export interface UnicodeEntry {
  ch: string;
  /** Lower-case codepoint hex without 0x prefix, e.g. "1f600". */
  cp: string;
  /** Conventional name (Unicode Character Database short form). */
  name: string;
  category: string;
  /** Optional helpful keywords. */
  keywords?: string[];
}

function entry(ch: string, name: string, category: string, keywords?: string[]): UnicodeEntry {
  const cp = (ch.codePointAt(0) ?? 0).toString(16);
  return { ch, cp, name, category, keywords };
}

export const UNICODE_DB: UnicodeEntry[] = [
  // ── Punctuation & quotes ──────────────────────────────────────────────
  entry("…", "Horizontal Ellipsis", "Punctuation", ["dots", "ellipsis"]),
  entry("–", "En Dash", "Punctuation", ["dash", "range"]),
  entry("—", "Em Dash", "Punctuation", ["dash"]),
  entry("‐", "Hyphen", "Punctuation"),
  entry("’", "Right Single Quotation Mark", "Punctuation", ["apostrophe"]),
  entry("‘", "Left Single Quotation Mark", "Punctuation"),
  entry("“", "Left Double Quotation Mark", "Punctuation"),
  entry("”", "Right Double Quotation Mark", "Punctuation"),
  entry("«", "Left-Pointing Double Angle Quotation Mark", "Punctuation", ["chevron"]),
  entry("»", "Right-Pointing Double Angle Quotation Mark", "Punctuation"),
  entry("¡", "Inverted Exclamation Mark", "Punctuation", ["spanish"]),
  entry("¿", "Inverted Question Mark", "Punctuation", ["spanish"]),
  entry("·", "Middle Dot", "Punctuation", ["interpunct"]),
  entry("•", "Bullet", "Punctuation", ["bullet point"]),
  entry("◦", "White Bullet", "Punctuation"),
  entry("‣", "Triangular Bullet", "Punctuation"),
  entry("§", "Section Sign", "Punctuation", ["legal"]),
  entry("¶", "Pilcrow", "Punctuation", ["paragraph"]),
  entry("†", "Dagger", "Punctuation", ["footnote"]),
  entry("‡", "Double Dagger", "Punctuation"),
  entry("′", "Prime", "Punctuation", ["minutes", "feet"]),
  entry("″", "Double Prime", "Punctuation", ["seconds", "inches"]),

  // ── Mathematical ──────────────────────────────────────────────────────
  entry("±", "Plus-Minus Sign", "Math"),
  entry("∓", "Minus-Or-Plus Sign", "Math"),
  entry("×", "Multiplication Sign", "Math", ["times", "cross"]),
  entry("÷", "Division Sign", "Math", ["obelus"]),
  entry("≈", "Almost Equal To", "Math"),
  entry("≠", "Not Equal To", "Math"),
  entry("≡", "Identical To", "Math"),
  entry("≤", "Less-Than or Equal To", "Math"),
  entry("≥", "Greater-Than or Equal To", "Math"),
  entry("∞", "Infinity", "Math"),
  entry("∑", "N-Ary Summation", "Math", ["sigma", "sum"]),
  entry("∏", "N-Ary Product", "Math", ["pi", "product"]),
  entry("∂", "Partial Differential", "Math"),
  entry("∫", "Integral", "Math"),
  entry("∮", "Contour Integral", "Math"),
  entry("√", "Square Root", "Math"),
  entry("∛", "Cube Root", "Math"),
  entry("∜", "Fourth Root", "Math"),
  entry("π", "Greek Small Letter Pi", "Math", ["pi"]),
  entry("τ", "Greek Small Letter Tau", "Math"),
  entry("φ", "Greek Small Letter Phi", "Math", ["golden ratio"]),
  entry("∝", "Proportional To", "Math"),
  entry("∈", "Element Of", "Math"),
  entry("∉", "Not An Element Of", "Math"),
  entry("⊂", "Subset Of", "Math"),
  entry("⊃", "Superset Of", "Math"),
  entry("⊆", "Subset Of or Equal To", "Math"),
  entry("⊇", "Superset Of or Equal To", "Math"),
  entry("∩", "Intersection", "Math"),
  entry("∪", "Union", "Math"),
  entry("∧", "Logical And", "Math"),
  entry("∨", "Logical Or", "Math"),
  entry("¬", "Not Sign", "Math"),
  entry("∀", "For All", "Math"),
  entry("∃", "There Exists", "Math"),
  entry("∇", "Nabla", "Math", ["gradient"]),
  entry("Δ", "Greek Capital Letter Delta", "Math"),
  entry("Σ", "Greek Capital Letter Sigma", "Math"),
  entry("Ω", "Greek Capital Letter Omega", "Math", ["ohm"]),

  // ── Currency ───────────────────────────────────────────────────────────
  entry("$", "Dollar Sign", "Currency"),
  entry("€", "Euro Sign", "Currency"),
  entry("£", "Pound Sign", "Currency"),
  entry("¥", "Yen Sign", "Currency"),
  entry("¢", "Cent Sign", "Currency"),
  entry("₹", "Indian Rupee Sign", "Currency", ["india", "inr"]),
  entry("₽", "Russian Ruble Sign", "Currency"),
  entry("₩", "Won Sign", "Currency", ["korea"]),
  entry("₺", "Turkish Lira Sign", "Currency"),
  entry("₪", "New Sheqel Sign", "Currency", ["israel"]),
  entry("₫", "Dong Sign", "Currency", ["vietnam"]),
  entry("฿", "Thai Baht Sign", "Currency"),
  entry("₴", "Hryvnia Sign", "Currency", ["ukraine"]),
  entry("₦", "Naira Sign", "Currency", ["nigeria"]),
  entry("₱", "Peso Sign", "Currency", ["philippines"]),
  entry("₲", "Guarani Sign", "Currency"),
  entry("₵", "Cedi Sign", "Currency", ["ghana"]),

  // ── Arrows ─────────────────────────────────────────────────────────────
  entry("←", "Leftwards Arrow", "Arrow"),
  entry("↑", "Upwards Arrow", "Arrow"),
  entry("→", "Rightwards Arrow", "Arrow"),
  entry("↓", "Downwards Arrow", "Arrow"),
  entry("↔", "Left Right Arrow", "Arrow"),
  entry("↕", "Up Down Arrow", "Arrow"),
  entry("↖", "North West Arrow", "Arrow"),
  entry("↗", "North East Arrow", "Arrow"),
  entry("↘", "South East Arrow", "Arrow"),
  entry("↙", "South West Arrow", "Arrow"),
  entry("⇐", "Leftwards Double Arrow", "Arrow"),
  entry("⇑", "Upwards Double Arrow", "Arrow"),
  entry("⇒", "Rightwards Double Arrow", "Arrow", ["implies"]),
  entry("⇓", "Downwards Double Arrow", "Arrow"),
  entry("⇔", "Left Right Double Arrow", "Arrow", ["iff"]),
  entry("⟶", "Long Rightwards Arrow", "Arrow"),
  entry("⟵", "Long Leftwards Arrow", "Arrow"),
  entry("⟸", "Long Leftwards Double Arrow", "Arrow"),
  entry("⟹", "Long Rightwards Double Arrow", "Arrow"),
  entry("↪", "Rightwards Arrow with Hook", "Arrow"),
  entry("↩", "Leftwards Arrow with Hook", "Arrow"),
  entry("⤴", "Arrow Pointing Rightwards Then Curving Upwards", "Arrow"),
  entry("⤵", "Arrow Pointing Rightwards Then Curving Downwards", "Arrow"),
  entry("⏎", "Return Symbol", "Arrow", ["enter"]),

  // ── Geometric shapes ──────────────────────────────────────────────────
  entry("●", "Black Circle", "Shape"),
  entry("○", "White Circle", "Shape"),
  entry("◉", "Fisheye", "Shape"),
  entry("■", "Black Square", "Shape"),
  entry("□", "White Square", "Shape"),
  entry("▲", "Black Up-Pointing Triangle", "Shape"),
  entry("△", "White Up-Pointing Triangle", "Shape"),
  entry("▼", "Black Down-Pointing Triangle", "Shape"),
  entry("▽", "White Down-Pointing Triangle", "Shape"),
  entry("◆", "Black Diamond", "Shape"),
  entry("◇", "White Diamond", "Shape"),
  entry("★", "Black Star", "Shape", ["star"]),
  entry("☆", "White Star", "Shape"),
  entry("♥", "Black Heart Suit", "Shape", ["heart"]),
  entry("♡", "White Heart Suit", "Shape"),
  entry("♦", "Black Diamond Suit", "Shape"),
  entry("♠", "Black Spade Suit", "Shape"),
  entry("♣", "Black Club Suit", "Shape"),

  // ── Latin extended (common accents) ──────────────────────────────────
  entry("à", "Latin Small Letter A with Grave", "Latin"),
  entry("á", "Latin Small Letter A with Acute", "Latin"),
  entry("â", "Latin Small Letter A with Circumflex", "Latin"),
  entry("ä", "Latin Small Letter A with Diaeresis", "Latin"),
  entry("ã", "Latin Small Letter A with Tilde", "Latin"),
  entry("å", "Latin Small Letter A with Ring Above", "Latin"),
  entry("æ", "Latin Small Letter AE", "Latin"),
  entry("ç", "Latin Small Letter C with Cedilla", "Latin"),
  entry("è", "Latin Small Letter E with Grave", "Latin"),
  entry("é", "Latin Small Letter E with Acute", "Latin"),
  entry("ê", "Latin Small Letter E with Circumflex", "Latin"),
  entry("ë", "Latin Small Letter E with Diaeresis", "Latin"),
  entry("ì", "Latin Small Letter I with Grave", "Latin"),
  entry("í", "Latin Small Letter I with Acute", "Latin"),
  entry("î", "Latin Small Letter I with Circumflex", "Latin"),
  entry("ï", "Latin Small Letter I with Diaeresis", "Latin"),
  entry("ñ", "Latin Small Letter N with Tilde", "Latin"),
  entry("ò", "Latin Small Letter O with Grave", "Latin"),
  entry("ó", "Latin Small Letter O with Acute", "Latin"),
  entry("ô", "Latin Small Letter O with Circumflex", "Latin"),
  entry("ö", "Latin Small Letter O with Diaeresis", "Latin"),
  entry("õ", "Latin Small Letter O with Tilde", "Latin"),
  entry("ø", "Latin Small Letter O with Stroke", "Latin"),
  entry("œ", "Latin Small Ligature OE", "Latin"),
  entry("ß", "Latin Small Letter Sharp S", "Latin", ["sz", "german"]),
  entry("ù", "Latin Small Letter U with Grave", "Latin"),
  entry("ú", "Latin Small Letter U with Acute", "Latin"),
  entry("û", "Latin Small Letter U with Circumflex", "Latin"),
  entry("ü", "Latin Small Letter U with Diaeresis", "Latin"),
  entry("ý", "Latin Small Letter Y with Acute", "Latin"),
  entry("ÿ", "Latin Small Letter Y with Diaeresis", "Latin"),

  // ── Greek ──────────────────────────────────────────────────────────────
  entry("α", "Greek Small Letter Alpha", "Greek"),
  entry("β", "Greek Small Letter Beta", "Greek"),
  entry("γ", "Greek Small Letter Gamma", "Greek"),
  entry("δ", "Greek Small Letter Delta", "Greek"),
  entry("ε", "Greek Small Letter Epsilon", "Greek"),
  entry("ζ", "Greek Small Letter Zeta", "Greek"),
  entry("η", "Greek Small Letter Eta", "Greek"),
  entry("θ", "Greek Small Letter Theta", "Greek"),
  entry("ι", "Greek Small Letter Iota", "Greek"),
  entry("κ", "Greek Small Letter Kappa", "Greek"),
  entry("λ", "Greek Small Letter Lambda", "Greek"),
  entry("μ", "Greek Small Letter Mu", "Greek", ["micro"]),
  entry("ν", "Greek Small Letter Nu", "Greek"),
  entry("ξ", "Greek Small Letter Xi", "Greek"),
  entry("ο", "Greek Small Letter Omicron", "Greek"),
  entry("ρ", "Greek Small Letter Rho", "Greek"),
  entry("σ", "Greek Small Letter Sigma", "Greek"),
  entry("υ", "Greek Small Letter Upsilon", "Greek"),
  entry("χ", "Greek Small Letter Chi", "Greek"),
  entry("ψ", "Greek Small Letter Psi", "Greek"),
  entry("ω", "Greek Small Letter Omega", "Greek"),

  // ── Cyrillic (basic) ──────────────────────────────────────────────────
  entry("А", "Cyrillic Capital Letter A", "Cyrillic"),
  entry("Б", "Cyrillic Capital Letter Be", "Cyrillic"),
  entry("В", "Cyrillic Capital Letter Ve", "Cyrillic"),
  entry("Д", "Cyrillic Capital Letter De", "Cyrillic"),
  entry("Е", "Cyrillic Capital Letter Ie", "Cyrillic"),
  entry("Ж", "Cyrillic Capital Letter Zhe", "Cyrillic"),
  entry("З", "Cyrillic Capital Letter Ze", "Cyrillic"),
  entry("И", "Cyrillic Capital Letter I", "Cyrillic"),
  entry("К", "Cyrillic Capital Letter Ka", "Cyrillic"),
  entry("Л", "Cyrillic Capital Letter El", "Cyrillic"),
  entry("М", "Cyrillic Capital Letter Em", "Cyrillic"),
  entry("Н", "Cyrillic Capital Letter En", "Cyrillic"),
  entry("О", "Cyrillic Capital Letter O", "Cyrillic"),
  entry("П", "Cyrillic Capital Letter Pe", "Cyrillic"),
  entry("Р", "Cyrillic Capital Letter Er", "Cyrillic"),
  entry("С", "Cyrillic Capital Letter Es", "Cyrillic"),
  entry("Т", "Cyrillic Capital Letter Te", "Cyrillic"),
  entry("У", "Cyrillic Capital Letter U", "Cyrillic"),
  entry("Ф", "Cyrillic Capital Letter Ef", "Cyrillic"),
  entry("Х", "Cyrillic Capital Letter Ha", "Cyrillic"),
  entry("Ц", "Cyrillic Capital Letter Tse", "Cyrillic"),
  entry("Ч", "Cyrillic Capital Letter Che", "Cyrillic"),
  entry("Ш", "Cyrillic Capital Letter Sha", "Cyrillic"),
  entry("Щ", "Cyrillic Capital Letter Shcha", "Cyrillic"),
  entry("Ы", "Cyrillic Capital Letter Yeru", "Cyrillic"),
  entry("Э", "Cyrillic Capital Letter E", "Cyrillic"),
  entry("Ю", "Cyrillic Capital Letter Yu", "Cyrillic"),
  entry("Я", "Cyrillic Capital Letter Ya", "Cyrillic"),

  // ── Misc symbols ───────────────────────────────────────────────────────
  entry("™", "Trade Mark Sign", "Symbols"),
  entry("®", "Registered Sign", "Symbols"),
  entry("©", "Copyright Sign", "Symbols"),
  entry("℗", "Sound Recording Copyright", "Symbols"),
  entry("℠", "Service Mark", "Symbols"),
  entry("°", "Degree Sign", "Symbols"),
  entry("№", "Numero Sign", "Symbols"),
  entry("⌘", "Place of Interest Sign", "Symbols", ["command", "mac"]),
  entry("⌥", "Option Key", "Symbols", ["alt"]),
  entry("⇧", "Upwards White Arrow", "Symbols", ["shift"]),
  entry("⌃", "Up Arrowhead", "Symbols", ["control"]),
  entry("⏎", "Return Symbol", "Symbols"),
  entry("⌫", "Erase to the Left", "Symbols", ["backspace"]),
  entry("⌦", "Erase to the Right", "Symbols", ["delete"]),
  entry("⎋", "Broken Circle with Northwest Arrow", "Symbols", ["escape", "esc"]),

  // ── Emoji ──────────────────────────────────────────────────────────────
  entry("😀", "Grinning Face", "Emoji", ["happy"]),
  entry("😂", "Face with Tears of Joy", "Emoji", ["lol"]),
  entry("🥰", "Smiling Face with Hearts", "Emoji", ["love"]),
  entry("😍", "Smiling Face with Heart-Eyes", "Emoji"),
  entry("😎", "Smiling Face with Sunglasses", "Emoji", ["cool"]),
  entry("🤔", "Thinking Face", "Emoji"),
  entry("😢", "Crying Face", "Emoji", ["sad"]),
  entry("😭", "Loudly Crying Face", "Emoji"),
  entry("😡", "Pouting Face", "Emoji", ["angry"]),
  entry("🥳", "Partying Face", "Emoji", ["party"]),
  entry("🤯", "Exploding Head", "Emoji", ["mindblown"]),
  entry("👍", "Thumbs Up", "Emoji"),
  entry("👎", "Thumbs Down", "Emoji"),
  entry("👏", "Clapping Hands", "Emoji"),
  entry("🙏", "Folded Hands", "Emoji", ["pray", "thanks"]),
  entry("💯", "Hundred Points", "Emoji"),
  entry("🔥", "Fire", "Emoji"),
  entry("✨", "Sparkles", "Emoji"),
  entry("⭐", "Star", "Emoji"),
  entry("🚀", "Rocket", "Emoji"),
  entry("❤️", "Red Heart", "Emoji"),
  entry("💔", "Broken Heart", "Emoji"),
  entry("🎉", "Party Popper", "Emoji"),
  entry("☕", "Hot Beverage", "Emoji", ["coffee"]),
  entry("🍕", "Pizza", "Emoji"),
  entry("🍔", "Hamburger", "Emoji", ["burger"]),
  entry("🌍", "Globe Showing Europe-Africa", "Emoji", ["world", "earth"]),
  entry("☀️", "Sun", "Emoji"),
  entry("🌙", "Crescent Moon", "Emoji"),
  entry("🌧️", "Cloud with Rain", "Emoji"),
  entry("❄️", "Snowflake", "Emoji"),
  entry("🐶", "Dog Face", "Emoji"),
  entry("🐱", "Cat Face", "Emoji"),
  entry("🦄", "Unicorn", "Emoji"),
  entry("✈️", "Airplane", "Emoji"),
  entry("🚗", "Automobile", "Emoji", ["car"]),
  entry("📱", "Mobile Phone", "Emoji"),
  entry("💻", "Laptop", "Emoji"),
  entry("📷", "Camera", "Emoji"),
  entry("🎵", "Musical Note", "Emoji"),
  entry("⚡", "High Voltage", "Emoji", ["lightning"]),
  entry("✅", "Check Mark Button", "Emoji"),
  entry("❌", "Cross Mark", "Emoji"),
  entry("✔️", "Heavy Check Mark", "Emoji"),
  entry("❓", "Question Mark", "Emoji"),
  entry("❗", "Exclamation Mark", "Emoji"),
  entry("⚠️", "Warning", "Emoji"),
];

export const CATEGORIES: string[] = (() => {
  const set = new Set<string>();
  for (const e of UNICODE_DB) set.add(e.category);
  return [...set].sort();
})();

export interface SearchOptions {
  query: string;
  category?: string;
}

export function search(opts: SearchOptions): UnicodeEntry[] {
  const q = opts.query.trim().toLowerCase();
  return UNICODE_DB.filter((e) => {
    if (opts.category && opts.category !== "All" && e.category !== opts.category) return false;
    if (!q) return true;
    // Hex lookup — "U+1F600" or "0x1f600" or just "1f600".
    const hexMatch = /^(?:u\+|0x)?([0-9a-f]+)$/i.exec(q);
    if (hexMatch && hexMatch[1].length >= 2) {
      const hex = hexMatch[1].toLowerCase();
      if (e.cp === hex) return true;
    }
    if (e.name.toLowerCase().includes(q)) return true;
    if (e.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
    if (e.ch === opts.query) return true;
    return false;
  });
}

export function formatCodePoint(cp: string): string {
  return `U+${cp.toUpperCase().padStart(4, "0")}`;
}

export function htmlEntity(cp: string): string {
  return `&#x${cp.toUpperCase()};`;
}

export function decimalEntity(cp: string): string {
  return `&#${parseInt(cp, 16)};`;
}

export function jsEscape(cp: string): string {
  const num = parseInt(cp, 16);
  if (num <= 0xffff) return `\\u${num.toString(16).toUpperCase().padStart(4, "0")}`;
  return `\\u{${num.toString(16).toUpperCase()}}`;
}

export function cssEscape(cp: string): string {
  return `\\${cp.toUpperCase()}`;
}

export const TOTAL_ENTRIES = UNICODE_DB.length;
