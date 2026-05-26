export const SITE = {
  name: "Toollyz",
  tagline: "All-in-one online tools for everyone",
  description:
    "A premium suite of fast, privacy-first online tools. Generate, convert, format, and create — all in your browser, no signup required.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://toollyz.com",
  ogImage: "/og-default.png",
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
      { label: "All Tools", href: "/tools" },
      { label: "Categories", href: "/#categories" },
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
