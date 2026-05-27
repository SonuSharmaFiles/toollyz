export type UsernameMode =
  | "random"
  | "name"
  | "gaming"
  | "aesthetic"
  | "professional"
  | "tech"
  | "brandable"
  | "funny"
  | "social"
  | "short";

export interface ModeInfo {
  id: UsernameMode;
  label: string;
  hint: string;
}

export const MODE_LIST: ModeInfo[] = [
  { id: "random", label: "Random", hint: "Mix anything from every vocabulary." },
  { id: "name", label: "Name-based", hint: "Built around your name or nickname." },
  { id: "gaming", label: "Gaming", hint: "Aggressive handles for gamers and streamers." },
  { id: "aesthetic", label: "Aesthetic", hint: "Soft, dreamy, vibe-driven usernames." },
  { id: "professional", label: "Professional", hint: "Clean, brand-safe identifiers." },
  { id: "tech", label: "Tech", hint: "Dev / engineer / builder handles." },
  { id: "brandable", label: "Brandable", hint: "Short, made-up, pronounceable names." },
  { id: "funny", label: "Funny", hint: "Silly and absurd word combinations." },
  { id: "social", label: "Social media", hint: "Short, trendy handles for IG/X/TikTok." },
  { id: "short", label: "Short", hint: "Compact 4–7 character usernames." },
];

// ─── Adjectives ───────────────────────────────────────────────────────────
export const ADJ = {
  general: [
    "cool", "wild", "swift", "bold", "epic", "quiet", "calm", "bright", "rapid",
    "lazy", "happy", "brave", "lucky", "shiny", "crisp", "fancy", "noble", "royal",
  ],
  gaming: [
    "savage", "shadow", "rogue", "phantom", "venom", "frost", "blaze", "fury",
    "thunder", "lethal", "iron", "ghost", "dark", "elite", "raging", "vicious",
    "feral", "ruthless", "ironclad", "stormy", "void", "neon", "cyber", "rebel",
  ],
  aesthetic: [
    "lunar", "velvet", "honey", "soft", "dreamy", "rose", "misty", "celestial",
    "ethereal", "pastel", "silken", "starry", "wistful", "moonlit", "amber", "ivory",
    "twilight", "porcelain", "lilac", "saffron", "gossamer", "halcyon", "muted",
    "sunlit", "auroral", "feather", "marble", "snowy",
  ],
  professional: [
    "alpha", "prime", "core", "ideal", "global", "modern", "swift", "smart",
    "logical", "elite", "premier", "elevated", "studio", "creative", "expert",
    "senior", "principal", "lead", "atlas", "summit",
  ],
  tech: [
    "async", "atomic", "binary", "byte", "cyber", "data", "edge", "lambda", "logic",
    "neural", "neon", "quantum", "stack", "vector", "void", "raw", "meta", "kernel",
    "proto", "deep", "mesh", "graph", "agile", "kube", "smart", "rust",
  ],
  funny: [
    "wobbly", "snazzy", "groovy", "soggy", "wonky", "jiggly", "spicy", "salty",
    "cheeky", "goofy", "noodle", "sneaky", "fuzzy", "loopy", "zippy", "perky",
    "chunky", "wacky", "doodle", "wiggly", "snorting", "smooching",
  ],
};

// ─── Nouns ────────────────────────────────────────────────────────────────
export const NOUN = {
  general: [
    "panda", "tiger", "fox", "wolf", "raven", "hawk", "lion", "eagle", "otter",
    "lynx", "falcon", "bear", "owl", "shark", "phoenix", "dragon",
  ],
  gaming: [
    "blade", "reaper", "specter", "knight", "wraith", "hunter", "sniper", "warden",
    "assassin", "ronin", "viper", "titan", "warlock", "berserker", "kraken", "fang",
    "raptor", "warlord", "marauder", "harbinger", "vanguard", "ghoul", "soulreaper",
    "ironfist", "deathwing", "stormbreaker", "frostfang", "voidwalker",
  ],
  aesthetic: [
    "haze", "bloom", "dawn", "dusk", "petal", "lake", "garden", "willow", "fawn",
    "lily", "peony", "tulip", "raincloud", "mist", "honey", "marble", "wave",
    "ribbon", "feather", "echo", "lullaby", "starlight", "moonbeam", "morningglow",
    "afterglow", "softlight", "verandah",
  ],
  professional: [
    "studio", "media", "labs", "works", "group", "agency", "house", "club",
    "ventures", "collective", "partners", "consulting", "atelier", "guild",
    "office", "atlas", "north", "summit",
  ],
  tech: [
    "byte", "node", "kernel", "shell", "stack", "vector", "neon", "agent", "daemon",
    "thread", "proc", "buffer", "cache", "logger", "router", "engine", "runtime",
    "compiler", "linker", "fetcher", "scanner", "weaver", "binder", "renderer",
    "scheduler", "switch", "socket", "pixel", "cursor",
  ],
  funny: [
    "noodle", "banana", "pickle", "biscuit", "muffin", "potato", "burrito", "taco",
    "pancake", "waffle", "donut", "doodle", "gnome", "wizard", "panda", "llama",
    "sloth", "narwhal", "axolotl", "capybara", "platypus", "wombat",
  ],
};

// ─── Aux ───────────────────────────────────────────────────────────────────
export const PREFIX = [
  "the", "real", "official", "mr", "ms", "its", "get", "iam", "lord", "lady",
  "dr", "prof", "kid", "big", "lil",
];

export const SUFFIX = [
  "official", "real", "hq", "dev", "codes", "daily", "world", "club", "labs",
  "studio", "live", "online", "io", "xyz", "tv", "media", "wave", "core",
];

export const GAMING_SUFFIX = [
  "x", "xx", "tv", "yt", "live", "gg", "pro", "elite", "official", "main",
];

export const DEV_SUFFIX = [
  "dev", "codes", "engineer", "builds", "ships", "stack", "labs", "io", "byte",
];

export const SOCIAL_PREFIX = [
  "its", "iam", "real", "official", "hey", "callme", "youknow",
];

// ─── Pronounceable building blocks ────────────────────────────────────────
export const CONSONANTS = "bcdfghjklmnpqrstvwxz";
export const VOWELS = "aeiouy";
export const SOFT_CONSONANTS = "lmnrsv";

// ─── Numbers ──────────────────────────────────────────────────────────────
export const COOL_NUMS = [
  "7", "13", "42", "69", "77", "88", "99", "101", "404", "420", "777", "808",
  "999", "1337", "2024", "2025", "2030", "00",
];
