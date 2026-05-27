export type IpsumMode = "classic" | "tech" | "startup" | "marketing" | "minimal" | "funny";

export interface ModeConfig {
  id: IpsumMode;
  label: string;
  description: string;
  intro?: string;
  words: string[];
}

const classicWords = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation",
  "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis",
  "aute", "irure", "in", "reprehenderit", "voluptate", "velit", "esse", "cillum",
  "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non",
  "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id",
  "est", "laborum", "vitae", "eros", "donec", "mauris", "vivamus", "cras", "libero",
  "fusce", "etiam", "integer", "nec", "tortor", "fringilla", "blandit", "justo", "urna",
  "lectus", "nibh", "augue", "eu", "neque", "leo", "ante", "sollicitudin", "quam",
  "lacinia", "vehicula", "sapien", "posuere", "varius", "semper", "hendrerit",
  "vestibulum", "tincidunt", "fermentum", "condimentum", "malesuada", "suscipit",
];

const techWords = [
  "algorithm", "framework", "microservice", "container", "kubernetes", "docker",
  "pipeline", "deployment", "refactor", "scalable", "async", "await", "callback",
  "promise", "observable", "stream", "websocket", "endpoint", "payload", "latency",
  "throughput", "cache", "redis", "postgres", "mongodb", "schema", "migration",
  "repository", "branch", "commit", "merge", "rebase", "fork", "pull", "request",
  "monolith", "lambda", "serverless", "function", "hook", "state", "prop", "component",
  "render", "hydrate", "server", "client", "edge", "region", "replica", "shard",
  "partition", "index", "query", "join", "transaction", "idempotent", "atomic",
  "eventual", "consistency", "distributed", "protocol", "rest", "graphql", "oauth",
  "jwt", "token", "session", "middleware", "route", "handler", "controller", "model",
  "template", "encrypt", "decrypt", "signature", "validate", "sanitize", "typescript",
  "python", "rust", "compiler", "interpreter", "runtime", "binary", "bytecode",
  "debugger", "profiler", "benchmark", "regression", "observability", "telemetry",
];

const startupWords = [
  "synergy", "pivot", "mvp", "runway", "traction", "scale", "growth", "unicorn",
  "decacorn", "valuation", "equity", "vesting", "dilution", "exit", "ipo", "acquisition",
  "founder", "cofounder", "ceo", "cto", "hire", "ship", "iterate", "validate",
  "hypothesis", "lean", "agile", "sprint", "kanban", "scrum", "standup",
  "retrospective", "monetize", "retention", "churn", "ltv", "cac", "payback",
  "burn", "rate", "north", "star", "metric", "okr", "kpi", "dashboard", "conversion",
  "funnel", "acquisition", "activation", "revenue", "referral", "virality", "network",
  "effect", "moat", "defensibility", "platform", "marketplace", "viral", "organic",
  "paid", "channel", "distribution", "gtm", "plg", "devrel", "community", "brand",
  "mission", "vision", "values", "culture", "stealth", "demo", "deck", "term", "sheet",
  "due", "diligence", "lead", "angel", "syndicate", "rollup", "moonshot", "ten", "x",
];

const marketingWords = [
  "engagement", "conversion", "funnel", "audience", "reach", "impression", "click",
  "ctr", "cpm", "cpc", "roi", "roas", "attribution", "journey", "persona", "segment",
  "cohort", "retargeting", "remarketing", "lead", "prospect", "customer", "lifetime",
  "value", "churn", "retention", "loyalty", "brand", "awareness", "consideration",
  "decision", "advocacy", "content", "blog", "social", "organic", "paid", "sem",
  "seo", "smm", "email", "newsletter", "drip", "campaign", "sequence", "automation",
  "crm", "copywriting", "headline", "cta", "landing", "page", "split", "test",
  "optimization", "growth", "hacking", "loop", "referral", "program", "partnership",
  "influencer", "ambassador", "ugc", "manager", "listening", "sentiment", "share",
  "voice", "mindshare", "positioning", "differentiation", "proposition", "messaging",
  "story", "narrative", "campaign", "creative", "brief", "deliverable", "asset",
  "channel", "media", "mix", "budget", "spend", "yield", "performance", "report",
];

const minimalWords = [
  "hello", "world", "design", "build", "ship", "learn", "grow", "focus", "simple",
  "clear", "kind", "work", "rest", "play", "think", "make", "share", "give", "take",
  "find", "know", "see", "hear", "feel", "do", "be", "go", "come", "stay", "leave",
  "start", "stop", "open", "close", "draw", "write", "read", "talk", "walk", "run",
  "jump", "sit", "stand", "look", "watch", "listen", "smile", "laugh", "cry", "sleep",
  "wake", "eat", "drink", "hot", "cold", "warm", "cool", "fast", "slow", "big", "small",
  "near", "far", "soft", "loud", "light", "dark", "new", "old", "hard", "easy",
  "true", "real", "right", "good", "fair", "honest", "calm", "still", "clean", "fresh",
];

const funnyWords = [
  "banana", "pickle", "noodle", "wobble", "fizz", "sploosh", "kabloom", "snarf",
  "gobble", "bonk", "zoinks", "splat", "kerplunk", "oompah", "doodle", "twiddle",
  "snorgle", "ninja", "panda", "llama", "hippo", "monkey", "sloth", "narwhal",
  "capybara", "axolotl", "platypus", "taco", "burrito", "pizza", "donut", "waffle",
  "pancake", "ramen", "sushi", "gnome", "wizard", "gremlin", "sprite", "dinosaur",
  "robot", "alien", "ufo", "blob", "snickerdoodle", "frumple", "womp", "glomp",
  "smooch", "boop", "snoot", "schmooze", "jiggle", "wiggle", "squiggle", "scribble",
  "scuttlebutt", "kerfuffle", "shenanigans", "malarkey", "balderdash", "poppycock",
  "codswallop", "gobbledygook", "mumbo", "jumbo", "hodgepodge", "smorgasbord",
  "brouhaha", "hullabaloo", "razzmatazz", "lollygag", "whippersnapper", "discombobulate",
  "flummox", "skedaddle", "bamboozle", "rambunctious", "persnickety", "cattywampus",
];

export const MODES: Record<IpsumMode, ModeConfig> = {
  classic: {
    id: "classic",
    label: "Classic",
    description: "Traditional Lorem ipsum from Cicero's De finibus.",
    intro: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    words: classicWords,
  },
  tech: {
    id: "tech",
    label: "Tech",
    description: "Developer vocabulary — APIs, containers, async flows.",
    words: techWords,
  },
  startup: {
    id: "startup",
    label: "Startup",
    description: "Founder-speak — runway, traction, north-star metrics.",
    words: startupWords,
  },
  marketing: {
    id: "marketing",
    label: "Marketing",
    description: "Funnels, conversions, brand and growth language.",
    words: marketingWords,
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    description: "Short, calm, single-syllable words.",
    words: minimalWords,
  },
  funny: {
    id: "funny",
    label: "Funny",
    description: "Silly, absurd, weird-sounding placeholder words.",
    words: funnyWords,
  },
};

export const MODE_LIST: ModeConfig[] = Object.values(MODES);
