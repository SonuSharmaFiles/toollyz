// Robots.txt generator engine. Models the document as an ordered list of
// rule blocks (one or more User-agents + Allow/Disallow rules + optional
// Crawl-delay) plus a flat list of Sitemap URLs. The renderer is a faithful
// implementation of the original /robots.txt format used by Google and Bing.
// Pure functions, no DOM or fetch.

export interface RuleBlock {
  id: string;
  userAgents: string[];
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
}

export interface RobotsInput {
  blocks: RuleBlock[];
  sitemaps: string[];
}

export const COMMON_AGENTS = [
  "*",
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Bingbot",
  "DuckDuckBot",
  "YandexBot",
  "Baiduspider",
  "facebookexternalhit",
  "Twitterbot",
  "LinkedInBot",
  "Applebot",
  "Slurp",
];

export const AI_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "anthropic-ai",
  "ClaudeBot",
  "Claude-Web",
  "Google-Extended",
  "PerplexityBot",
  "CCBot",
  "FacebookBot",
  "Meta-ExternalAgent",
  "Amazonbot",
  "Applebot-Extended",
  "Bytespider",
  "cohere-ai",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "YouBot",
];

export type PresetId =
  | "allow-all"
  | "disallow-all"
  | "block-ai"
  | "wordpress"
  | "nextjs"
  | "shopify"
  | "ecommerce";

interface PresetDef {
  id: PresetId;
  label: string;
  description: string;
  build: () => RobotsInput;
}

function uid(seed: number): string {
  return `b${seed}-${Math.random().toString(36).slice(2, 7)}`;
}

export const PRESETS: PresetDef[] = [
  {
    id: "allow-all",
    label: "Allow everything",
    description: "Most permissive — let every bot crawl every URL.",
    build: () => ({
      blocks: [{ id: uid(1), userAgents: ["*"], allow: ["/"], disallow: [] }],
      sitemaps: [],
    }),
  },
  {
    id: "disallow-all",
    label: "Disallow everything",
    description: "Block all bots from the entire site — useful for staging or pre-launch.",
    build: () => ({
      blocks: [{ id: uid(1), userAgents: ["*"], allow: [], disallow: ["/"] }],
      sitemaps: [],
    }),
  },
  {
    id: "block-ai",
    label: "Block AI crawlers",
    description: "Allow search engines, block known LLM/training crawlers (GPTBot, ClaudeBot, Google-Extended, …).",
    build: () => ({
      blocks: [
        { id: uid(1), userAgents: ["*"], allow: ["/"], disallow: [] },
        { id: uid(2), userAgents: [...AI_AGENTS], allow: [], disallow: ["/"] },
      ],
      sitemaps: [],
    }),
  },
  {
    id: "wordpress",
    label: "WordPress (recommended)",
    description: "Hides /wp-admin/ and includes while allowing admin-ajax.php.",
    build: () => ({
      blocks: [
        {
          id: uid(1),
          userAgents: ["*"],
          allow: ["/wp-admin/admin-ajax.php"],
          disallow: ["/wp-admin/", "/wp-includes/", "/wp-content/plugins/", "/?s=", "/search/", "/cgi-bin/", "/trackback/"],
        },
      ],
      sitemaps: [],
    }),
  },
  {
    id: "nextjs",
    label: "Next.js (App Router)",
    description: "Lets bots through; blocks /api routes and Next internals.",
    build: () => ({
      blocks: [
        {
          id: uid(1),
          userAgents: ["*"],
          allow: ["/"],
          disallow: ["/api/", "/_next/", "/admin/"],
        },
      ],
      sitemaps: [],
    }),
  },
  {
    id: "shopify",
    label: "Shopify-style storefront",
    description: "Blocks cart, checkout, search and account pages.",
    build: () => ({
      blocks: [
        {
          id: uid(1),
          userAgents: ["*"],
          allow: ["/"],
          disallow: ["/cart", "/checkout", "/account", "/orders", "/search", "/policies/"],
        },
      ],
      sitemaps: [],
    }),
  },
  {
    id: "ecommerce",
    label: "Generic e-commerce",
    description: "Blocks faceted-search and tracking parameters that produce duplicate URLs.",
    build: () => ({
      blocks: [
        {
          id: uid(1),
          userAgents: ["*"],
          allow: ["/"],
          disallow: ["/cart", "/checkout", "/account/", "/wishlist", "/*?sort=", "/*?filter=", "/*?utm_"],
        },
      ],
      sitemaps: [],
    }),
  },
];

export function emptyBlock(): RuleBlock {
  return { id: uid(Date.now() % 1000), userAgents: ["*"], allow: [], disallow: [] };
}

/** Render the structured input to a valid robots.txt body. */
export function buildRobotsTxt(input: RobotsInput): string {
  const parts: string[] = [];

  input.blocks.forEach((b) => {
    const block: string[] = [];
    const ua = b.userAgents.map((u) => u.trim()).filter(Boolean);
    if (ua.length === 0) return;
    ua.forEach((u) => block.push(`User-agent: ${u}`));
    b.allow
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((p) => block.push(`Allow: ${p}`));
    b.disallow
      .map((p) => p.trim())
      .filter((p, _, arr) => p !== "" || arr.length === 0)
      .forEach((p) => block.push(`Disallow: ${p}`));
    // Allow an explicit empty Disallow (means "allow everything")
    if (b.allow.length === 0 && b.disallow.length === 0) {
      block.push("Disallow:");
    }
    if (typeof b.crawlDelay === "number" && b.crawlDelay > 0) {
      block.push(`Crawl-delay: ${b.crawlDelay}`);
    }
    parts.push(block.join("\n"));
  });

  const sitemaps = input.sitemaps.map((s) => s.trim()).filter(Boolean);
  if (sitemaps.length > 0) {
    parts.push(sitemaps.map((s) => `Sitemap: ${s}`).join("\n"));
  }

  if (parts.length === 0) return "# Empty robots.txt — no rules defined.\n";
  return parts.join("\n\n") + "\n";
}

export interface RobotsCheck {
  errors: string[];
  warnings: string[];
}

const PATH_RE = /^\/[\S]*$/; // must start with / and be non-whitespace, or empty
const URL_RE = /^https?:\/\/[^\s]+$/i;

export function validate(input: RobotsInput): RobotsCheck {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (input.blocks.length === 0) {
    errors.push("Add at least one User-agent block.");
  }

  input.blocks.forEach((b, idx) => {
    const tag = `Block ${idx + 1}`;
    const ua = b.userAgents.map((u) => u.trim()).filter(Boolean);
    if (ua.length === 0) {
      errors.push(`${tag}: needs at least one User-agent.`);
    }
    b.allow.forEach((p) => {
      const v = p.trim();
      if (v && !PATH_RE.test(v)) errors.push(`${tag}: Allow path "${v}" must start with "/".`);
    });
    b.disallow.forEach((p) => {
      const v = p.trim();
      if (v && !PATH_RE.test(v)) errors.push(`${tag}: Disallow path "${v}" must start with "/".`);
    });
    if (typeof b.crawlDelay === "number" && (b.crawlDelay < 0 || b.crawlDelay > 86400)) {
      warnings.push(`${tag}: Crawl-delay should be between 0 and 86400 seconds.`);
    }
    if (b.allow.length === 0 && b.disallow.length === 0 && !b.crawlDelay) {
      warnings.push(`${tag}: no Allow/Disallow rules — block is empty.`);
    }
    if (ua.includes("*") && b.disallow.some((p) => p.trim() === "/")) {
      warnings.push(`${tag}: "User-agent: *" + "Disallow: /" blocks the entire site from every crawler.`);
    }
  });

  input.sitemaps.forEach((s) => {
    const v = s.trim();
    if (v && !URL_RE.test(v)) errors.push(`Sitemap "${v}" must be an absolute URL (starting with https://).`);
  });

  return { errors, warnings };
}

export interface Stats {
  blocks: number;
  allowRules: number;
  disallowRules: number;
  uniqueAgents: number;
  sitemaps: number;
}

export function stats(input: RobotsInput): Stats {
  const agents = new Set<string>();
  let allow = 0;
  let disallow = 0;
  input.blocks.forEach((b) => {
    b.userAgents.forEach((ua) => {
      const v = ua.trim();
      if (v) agents.add(v);
    });
    allow += b.allow.filter((p) => p.trim()).length;
    disallow += b.disallow.filter((p) => p.trim()).length;
  });
  return {
    blocks: input.blocks.length,
    allowRules: allow,
    disallowRules: disallow,
    uniqueAgents: agents.size,
    sitemaps: input.sitemaps.filter((s) => s.trim()).length,
  };
}

/**
 * Test a URL path against the input to predict which agent's rule matches it.
 * Implements the longest-match rule used by Google and Bing.
 */
export function testPath(input: RobotsInput, agent: string, path: string):
  | { allowed: boolean; matched: string; blockIndex: number }
  | { allowed: boolean; matched: "(no rule)"; blockIndex: -1 } {
  if (!path.startsWith("/")) path = "/" + path;
  // Pick the block that matches the agent best (exact > *).
  let chosen: RuleBlock | null = null;
  let chosenSpecificity = -1;
  input.blocks.forEach((b) => {
    const matches = b.userAgents.some((ua) => ua.trim() === agent);
    const wildcard = b.userAgents.some((ua) => ua.trim() === "*");
    if (matches && chosenSpecificity < 2) {
      chosen = b;
      chosenSpecificity = 2;
    } else if (wildcard && chosenSpecificity < 1) {
      chosen = b;
      chosenSpecificity = 1;
    }
  });
  if (!chosen) return { allowed: true, matched: "(no rule)", blockIndex: -1 };
  const chosenBlock = chosen as RuleBlock;
  let best = { rule: "", allowed: true, len: -1 };
  for (const p of chosenBlock.allow) {
    if (p && pathMatches(path, p) && p.length > best.len) best = { rule: `Allow: ${p}`, allowed: true, len: p.length };
  }
  for (const p of chosenBlock.disallow) {
    if (p && pathMatches(path, p) && p.length > best.len) best = { rule: `Disallow: ${p}`, allowed: false, len: p.length };
  }
  if (best.len === -1) return { allowed: true, matched: "(no matching rule)", blockIndex: input.blocks.indexOf(chosenBlock) };
  return { allowed: best.allowed, matched: best.rule, blockIndex: input.blocks.indexOf(chosenBlock) };
}

function pathMatches(path: string, pattern: string): boolean {
  // Implements wildcard `*` and end-of-URL `$` as in the Google extension.
  let p = pattern;
  const anchored = p.endsWith("$");
  if (anchored) p = p.slice(0, -1);
  const re = new RegExp("^" + p.split("*").map(escRe).join(".*") + (anchored ? "$" : ""));
  return re.test(path);
}

function escRe(s: string): string {
  return s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
}
