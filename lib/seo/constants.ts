const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const SITE = {
  name: "Toollyz",
  tagline: "All-in-one online tools for everyone",
  description:
    "A premium suite of fast, privacy-first online tools. Generate, convert, format, and create — all in your browser, no signup required.",
  // The default points at the live GitHub Pages deployment. The CI build
  // overrides this with NEXT_PUBLIC_SITE_URL when a different canonical
  // host (e.g. a future custom domain) is wired up. Avoid hard-coding a
  // domain we don't actually own.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://sonusharmafiles.github.io/toollyz",
  basePath: BASE_PATH,
  ogImage: `${BASE_PATH}/og-default.png`,
  twitter: "@toollyz",
  locale: "en_US",
  themeColorLight: "#ffffff",
  themeColorDark: "#000000",
  keywords: [
    "online tools",
    "free tools",
    "web tools",
    "productivity",
    "developer tools",
    "image tools",
    "text tools",
    "converters",
    "generators",
    "calculators",
  ],
} as const;

export const NAV_LINKS = [
  { label: "All Tools", href: "/tools" },
  { label: "Categories", href: "/#categories" },
  { label: "About", href: "/about" },
] as const;

export const FOOTER_LINKS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      // Categories live in their own footer column (rendered from
      // `categories` in components/layout/footer.tsx), so this column
      // skips them to avoid duplication.
      { label: "All Tools", href: "/tools" },
      { label: "Featured", href: "/#featured" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function absoluteUrl(path = "/"): string {
  const base = SITE.url.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
