export interface Emoji {
  e: string; // the emoji character
  n: string; // name
  c: EmojiCategory; // category
}

export type EmojiCategory =
  | "smileys"
  | "animals"
  | "food"
  | "travel"
  | "activities"
  | "objects"
  | "symbols"
  | "hearts"
  | "flags";

export interface CategoryConfig {
  id: EmojiCategory;
  label: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: "smileys", label: "Smileys & Emotion" },
  { id: "animals", label: "Animals & Nature" },
  { id: "food", label: "Food & Drink" },
  { id: "travel", label: "Travel & Places" },
  { id: "activities", label: "Activities & Sports" },
  { id: "objects", label: "Objects" },
  { id: "symbols", label: "Symbols" },
  { id: "hearts", label: "Hearts" },
  { id: "flags", label: "Flags" },
];

// Compact dataset: [emoji, name] tuples grouped per category.
const RAW: Record<EmojiCategory, [string, string][]> = {
  smileys: [
    ["😀", "grinning face"], ["😃", "grinning face with big eyes"], ["😄", "grinning face with smiling eyes"],
    ["😁", "beaming face"], ["😆", "grinning squinting face"], ["😅", "grinning face with sweat"],
    ["🤣", "rolling on the floor laughing"], ["😂", "face with tears of joy"], ["🙂", "slightly smiling face"],
    ["🙃", "upside-down face"], ["😉", "winking face"], ["😊", "smiling face with smiling eyes"],
    ["😇", "smiling face with halo"], ["🥰", "smiling face with hearts"], ["😍", "smiling face with heart-eyes"],
    ["🤩", "star-struck"], ["😘", "face blowing a kiss"], ["😋", "face savoring food"],
    ["😛", "face with tongue"], ["🤪", "zany face"], ["😎", "smiling face with sunglasses"],
    ["🤓", "nerd face"], ["🧐", "face with monocle"], ["🥳", "partying face"],
    ["😏", "smirking face"], ["😴", "sleeping face"], ["🤤", "drooling face"],
    ["😪", "sleepy face"], ["😌", "relieved face"], ["😔", "pensive face"],
    ["🤔", "thinking face"], ["🤫", "shushing face"], ["🤭", "face with hand over mouth"],
    ["🥺", "pleading face"], ["😢", "crying face"], ["😭", "loudly crying face"],
    ["😤", "face with steam from nose"], ["😠", "angry face"], ["😡", "pouting face"],
    ["🤬", "cursing face"], ["😳", "flushed face"], ["🥵", "hot face"],
    ["🥶", "cold face"], ["😱", "face screaming in fear"], ["😨", "fearful face"],
    ["🤯", "exploding head"], ["😬", "grimacing face"], ["🙄", "face with rolling eyes"],
    ["😮", "face with open mouth"], ["🤡", "clown face"], ["💀", "skull"],
    ["👻", "ghost"], ["👽", "alien"], ["🤖", "robot"], ["😈", "smiling face with horns"],
    ["👀", "eyes"], ["🫠", "melting face"], ["🫡", "saluting face"], ["🥹", "face holding back tears"],
  ],
  animals: [
    ["🐶", "dog"], ["🐱", "cat"], ["🐭", "mouse"], ["🐹", "hamster"], ["🐰", "rabbit"],
    ["🦊", "fox"], ["🐻", "bear"], ["🐼", "panda"], ["🐨", "koala"], ["🐯", "tiger"],
    ["🦁", "lion"], ["🐮", "cow"], ["🐷", "pig"], ["🐸", "frog"], ["🐵", "monkey"],
    ["🐔", "chicken"], ["🐧", "penguin"], ["🐦", "bird"], ["🦅", "eagle"], ["🦉", "owl"],
    ["🦋", "butterfly"], ["🐝", "honeybee"], ["🐢", "turtle"], ["🐙", "octopus"], ["🦄", "unicorn"],
    ["🐴", "horse"], ["🦓", "zebra"], ["🦒", "giraffe"], ["🐘", "elephant"], ["🦔", "hedgehog"],
    ["🐬", "dolphin"], ["🐳", "spouting whale"], ["🦈", "shark"], ["🐊", "crocodile"], ["🦕", "sauropod"],
    ["🌵", "cactus"], ["🌲", "evergreen tree"], ["🌴", "palm tree"], ["🌱", "seedling"], ["🍀", "four leaf clover"],
    ["🌿", "herb"], ["🍁", "maple leaf"], ["🌸", "cherry blossom"], ["🌹", "rose"], ["🌻", "sunflower"],
    ["🌷", "tulip"], ["🌺", "hibiscus"], ["🌼", "blossom"], ["🍃", "leaf fluttering in wind"], ["🐺", "wolf"],
  ],
  food: [
    ["🍏", "green apple"], ["🍎", "red apple"], ["🍐", "pear"], ["🍊", "tangerine"], ["🍋", "lemon"],
    ["🍌", "banana"], ["🍉", "watermelon"], ["🍇", "grapes"], ["🍓", "strawberry"], ["🫐", "blueberries"],
    ["🍒", "cherries"], ["🍑", "peach"], ["🥭", "mango"], ["🍍", "pineapple"], ["🥥", "coconut"],
    ["🥑", "avocado"], ["🍅", "tomato"], ["🥕", "carrot"], ["🌽", "ear of corn"], ["🌶️", "hot pepper"],
    ["🥔", "potato"], ["🍞", "bread"], ["🥐", "croissant"], ["🥯", "bagel"], ["🧀", "cheese wedge"],
    ["🍔", "hamburger"], ["🍟", "french fries"], ["🍕", "pizza"], ["🌭", "hot dog"], ["🌮", "taco"],
    ["🌯", "burrito"], ["🍜", "steaming bowl"], ["🍝", "spaghetti"], ["🍣", "sushi"], ["🍱", "bento box"],
    ["🍙", "rice ball"], ["🍦", "soft ice cream"], ["🍩", "doughnut"], ["🍪", "cookie"], ["🎂", "birthday cake"],
    ["🍰", "shortcake"], ["🧁", "cupcake"], ["🍫", "chocolate bar"], ["🍬", "candy"], ["🍭", "lollipop"],
    ["☕", "hot beverage"], ["🍵", "teacup"], ["🧋", "bubble tea"], ["🥤", "cup with straw"], ["🍺", "beer mug"],
  ],
  travel: [
    ["🚗", "car"], ["🚕", "taxi"], ["🚙", "sport utility vehicle"], ["🚌", "bus"], ["🏎️", "racing car"],
    ["🚓", "police car"], ["🚑", "ambulance"], ["🚒", "fire engine"], ["🚜", "tractor"], ["🛵", "motor scooter"],
    ["🏍️", "motorcycle"], ["🚲", "bicycle"], ["✈️", "airplane"], ["🚀", "rocket"], ["🛸", "flying saucer"],
    ["🚁", "helicopter"], ["⛵", "sailboat"], ["🚤", "speedboat"], ["🛳️", "passenger ship"], ["🚂", "locomotive"],
    ["🚆", "train"], ["🚉", "station"], ["🗺️", "world map"], ["🗽", "statue of liberty"], ["🗼", "tokyo tower"],
    ["🏰", "castle"], ["🏯", "japanese castle"], ["🏟️", "stadium"], ["🎡", "ferris wheel"], ["🎢", "roller coaster"],
    ["🏖️", "beach with umbrella"], ["🏝️", "desert island"], ["⛰️", "mountain"], ["🏔️", "snow-capped mountain"], ["🌋", "volcano"],
    ["🏕️", "camping"], ["🏜️", "desert"], ["🌅", "sunrise"], ["🌄", "sunrise over mountains"], ["🌃", "night with stars"],
    ["🌆", "cityscape at dusk"], ["🌇", "sunset"], ["🌉", "bridge at night"], ["🎆", "fireworks"], ["🎇", "sparkler"],
    ["🌁", "foggy"], ["🏠", "house"], ["🏡", "house with garden"], ["🏢", "office building"], ["⛲", "fountain"],
  ],
  activities: [
    ["⚽", "soccer ball"], ["🏀", "basketball"], ["🏈", "american football"], ["⚾", "baseball"], ["🎾", "tennis"],
    ["🏐", "volleyball"], ["🏉", "rugby football"], ["🎱", "pool 8 ball"], ["🏓", "ping pong"], ["🏸", "badminton"],
    ["🥅", "goal net"], ["🏒", "ice hockey"], ["🏑", "field hockey"], ["🥍", "lacrosse"], ["🏏", "cricket game"],
    ["⛳", "flag in hole"], ["🏹", "bow and arrow"], ["🎣", "fishing pole"], ["🥊", "boxing glove"], ["🥋", "martial arts uniform"],
    ["⛸️", "ice skate"], ["🛹", "skateboard"], ["🛼", "roller skate"], ["🎿", "skis"], ["🏂", "snowboarder"],
    ["🏋️", "weight lifter"], ["🤸", "cartwheeling"], ["🤾", "handball"], ["⛹️", "bouncing ball"], ["🏌️", "golfer"],
    ["🏄", "surfer"], ["🏊", "swimmer"], ["🚴", "cyclist"], ["🧗", "climber"], ["🎯", "direct hit"],
    ["🎮", "video game"], ["🕹️", "joystick"], ["🎲", "game die"], ["🧩", "puzzle piece"], ["🎰", "slot machine"],
    ["🎨", "artist palette"], ["🎭", "performing arts"], ["🎬", "clapper board"], ["🎤", "microphone"], ["🎧", "headphone"],
    ["🎸", "guitar"], ["🎹", "musical keyboard"], ["🥁", "drum"], ["🎺", "trumpet"], ["🎻", "violin"],
  ],
  objects: [
    ["⌚", "watch"], ["📱", "mobile phone"], ["💻", "laptop"], ["⌨️", "keyboard"], ["🖥️", "desktop computer"],
    ["🖨️", "printer"], ["🖱️", "computer mouse"], ["💾", "floppy disk"], ["💿", "optical disk"], ["📷", "camera"],
    ["📸", "camera with flash"], ["🎥", "movie camera"], ["📺", "television"], ["📻", "radio"], ["🔋", "battery"],
    ["🔌", "electric plug"], ["💡", "light bulb"], ["🔦", "flashlight"], ["🕯️", "candle"], ["📖", "open book"],
    ["📚", "books"], ["📝", "memo"], ["✏️", "pencil"], ["🖊️", "pen"], ["🖌️", "paintbrush"],
    ["📌", "pushpin"], ["📎", "paperclip"], ["✂️", "scissors"], ["📐", "triangular ruler"], ["📏", "straight ruler"],
    ["🔑", "key"], ["🔒", "locked"], ["🔓", "unlocked"], ["🔨", "hammer"], ["🪛", "screwdriver"],
    ["🔧", "wrench"], ["⚙️", "gear"], ["🧲", "magnet"], ["🧪", "test tube"], ["🔬", "microscope"],
    ["🔭", "telescope"], ["📡", "satellite antenna"], ["💎", "gem stone"], ["💰", "money bag"], ["💳", "credit card"],
    ["🎁", "wrapped gift"], ["🎈", "balloon"], ["🎉", "party popper"], ["🎊", "confetti ball"], ["🏆", "trophy"],
  ],
  symbols: [
    ["✨", "sparkles"], ["⭐", "star"], ["🌟", "glowing star"], ["💫", "dizzy"], ["⚡", "high voltage"],
    ["🔥", "fire"], ["💥", "collision"], ["💯", "hundred points"], ["✅", "check mark button"], ["❌", "cross mark"],
    ["❓", "question mark"], ["❗", "exclamation mark"], ["⚠️", "warning"], ["🚫", "prohibited"], ["♻️", "recycling symbol"],
    ["☮️", "peace symbol"], ["☯️", "yin yang"], ["🔱", "trident emblem"], ["♾️", "infinity"], ["🆕", "new button"],
    ["🆒", "cool button"], ["🆗", "ok button"], ["🔝", "top arrow"], ["🔁", "repeat"], ["🔀", "shuffle"],
    ["▶️", "play button"], ["⏸️", "pause button"], ["⏹️", "stop button"], ["🔊", "speaker high volume"], ["🔔", "bell"],
    ["💤", "zzz"], ["💢", "anger symbol"], ["💬", "speech balloon"], ["💭", "thought balloon"], ["🗯️", "right anger bubble"],
    ["♠️", "spade suit"], ["♥️", "heart suit"], ["♦️", "diamond suit"], ["♣️", "club suit"], ["🎴", "flower playing cards"],
    ["🔮", "crystal ball"], ["🌈", "rainbow"], ["☀️", "sun"], ["🌙", "crescent moon"], ["⛅", "sun behind cloud"],
    ["☁️", "cloud"], ["❄️", "snowflake"], ["💧", "droplet"], ["🌊", "water wave"], ["🪐", "ringed planet"],
  ],
  hearts: [
    ["❤️", "red heart"], ["🧡", "orange heart"], ["💛", "yellow heart"], ["💚", "green heart"], ["💙", "blue heart"],
    ["💜", "purple heart"], ["🖤", "black heart"], ["🤍", "white heart"], ["🤎", "brown heart"], ["💖", "sparkling heart"],
    ["💗", "growing heart"], ["💓", "beating heart"], ["💞", "revolving hearts"], ["💕", "two hearts"], ["❤️‍🔥", "heart on fire"],
    ["💔", "broken heart"], ["❣️", "heart exclamation"], ["💟", "heart decoration"], ["💌", "love letter"], ["💘", "heart with arrow"],
    ["💝", "heart with ribbon"], ["💋", "kiss mark"], ["🫶", "heart hands"], ["🩷", "pink heart"], ["🩵", "light blue heart"],
  ],
  flags: [
    ["🏳️", "white flag"], ["🏴", "black flag"], ["🏁", "chequered flag"], ["🚩", "triangular flag"], ["🏳️‍🌈", "rainbow flag"],
    ["🇺🇸", "United States"], ["🇬🇧", "United Kingdom"], ["🇨🇦", "Canada"], ["🇦🇺", "Australia"], ["🇩🇪", "Germany"],
    ["🇫🇷", "France"], ["🇮🇹", "Italy"], ["🇪🇸", "Spain"], ["🇯🇵", "Japan"], ["🇰🇷", "South Korea"],
    ["🇨🇳", "China"], ["🇮🇳", "India"], ["🇳🇵", "Nepal"], ["🇧🇷", "Brazil"], ["🇲🇽", "Mexico"],
    ["🇷🇺", "Russia"], ["🇿🇦", "South Africa"], ["🇳🇬", "Nigeria"], ["🇦🇪", "United Arab Emirates"], ["🇸🇬", "Singapore"],
  ],
};

export const EMOJIS: Emoji[] = (Object.keys(RAW) as EmojiCategory[]).flatMap((cat) =>
  RAW[cat].map(([e, n]) => ({ e, n, c: cat })),
);

export const EMOJI_BY_CHAR: Record<string, Emoji> = Object.fromEntries(
  EMOJIS.map((em) => [em.e, em]),
);

// ─── Style modes (curated cross-category vibes) ─────────────────────────────

export type StyleMode =
  | "chaos"
  | "aesthetic"
  | "minimal"
  | "tiktok"
  | "instagram"
  | "gamer"
  | "kawaii"
  | "dark";

export const STYLE_MODES: { id: StyleMode; label: string }[] = [
  { id: "chaos", label: "Random chaos" },
  { id: "aesthetic", label: "Soft aesthetic" },
  { id: "minimal", label: "Minimal combos" },
  { id: "tiktok", label: "TikTok style" },
  { id: "instagram", label: "Instagram bio" },
  { id: "gamer", label: "Gamer pack" },
  { id: "kawaii", label: "Cute kawaii" },
  { id: "dark", label: "Dark aesthetic" },
];

const MODE_POOLS: Record<StyleMode, string[]> = {
  chaos: [], // uses full set
  aesthetic: ["✨", "🌙", "🤍", "🕊️", "🦢", "☁️", "🌷", "🍃", "🫧", "🪞", "🌫️", "🩰", "🤍", "🕯️", "📷", "🦋"],
  minimal: ["◦", "✦", "✧", "·", "❍", "✩", "⊹", "˚", "✿", "❀", "♡", "✤"],
  tiktok: ["💀", "😭", "🔥", "💅", "✨", "🙏", "😩", "🥲", "👅", "🤌", "📈", "🫶", "🗿", "😈", "💯"],
  instagram: ["✨", "🌸", "🦋", "💫", "🌙", "🤍", "🌿", "📍", "☕", "🎧", "📸", "🌊", "🫶", "🪐", "🌻"],
  gamer: ["🎮", "🕹️", "👾", "🎯", "🏆", "⚔️", "🛡️", "💀", "🔥", "⚡", "🧨", "🎲", "🥇", "🤖", "👑"],
  kawaii: ["🥺", "🐰", "🌸", "💗", "🧸", "🍓", "🐱", "🌷", "🍡", "🎀", "🫶", "🐥", "🌈", "🧁", "💕"],
  dark: ["🖤", "🌑", "🕷️", "🥀", "⛓️", "🦇", "🌙", "🩸", "🗡️", "🔮", "💀", "🕸️", "🥃", "🌌", "⚰️"],
};

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

export interface GenOptions {
  count: number;
  category: EmojiCategory | "all";
  mode: StyleMode;
}

export function generateEmojis(opts: GenOptions): string[] {
  let pool: string[];
  if (opts.mode !== "chaos" && MODE_POOLS[opts.mode].length) {
    pool = MODE_POOLS[opts.mode];
  } else if (opts.category !== "all") {
    pool = EMOJIS.filter((em) => em.c === opts.category).map((em) => em.e);
  } else {
    pool = EMOJIS.map((em) => em.e);
  }
  if (!pool.length) pool = EMOJIS.map((em) => em.e);

  const out: string[] = [];
  for (let i = 0; i < opts.count; i++) {
    out.push(pool[secureInt(pool.length)]);
  }
  return out;
}

export function similarEmoji(char: string): string {
  const em = EMOJI_BY_CHAR[char];
  const pool = em
    ? EMOJIS.filter((x) => x.c === em.c).map((x) => x.e)
    : EMOJIS.map((x) => x.e);
  return pool[secureInt(pool.length)];
}

export function nameFor(char: string): string {
  return EMOJI_BY_CHAR[char]?.n ?? "emoji";
}

export function searchEmojis(query: string, limit = 60): Emoji[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return EMOJIS.filter((em) => em.n.includes(q) || em.c.includes(q)).slice(0, limit);
}

export function toCodePoints(char: string): string {
  return Array.from(char)
    .map((c) => "U+" + (c.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0"))
    .join(" ");
}
