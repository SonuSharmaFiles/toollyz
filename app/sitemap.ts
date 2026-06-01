import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo/constants";
import { tools } from "@/lib/tools/registry";
import { categories } from "@/lib/tools/categories";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = SITE.url.replace(/\/$/, "");

  // Match the canonical-link format Next.js emits for static-export routes
  // (trailing slash, except the bare root). Sitemap URLs that don't match
  // canonical exactly cost a 301 hop on every crawler discovery.
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tools/`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about/`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy-policy/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms/`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${base}/tools/${tool.slug}/`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: tool.status === "live" ? 0.85 : 0.5,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/category/${c.slug}/`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...toolPages];
}
