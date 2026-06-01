import type { Metadata } from "next";
import { SITE, absoluteUrl } from "./constants";
import type { Tool, Category } from "@/lib/tools/types";

interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  image,
  type = "website",
  noindex,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const ogImage = image ?? SITE.ogImage;

  return {
    title,
    description,
    keywords: keywords?.length ? keywords : [...SITE.keywords],
    // canonical + a single `en` hreflang. Single-locale today; if/when
    // we ship a translation, add the locale here and Next will emit
    // matching alternate links.
    alternates: { canonical: url, languages: { en: url } },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage)],
      creator: SITE.twitter,
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

// Maximum SEO title length before the layout's " | Toollyz" suffix
// (10 chars) pushes the rendered <title> past Google's ~60-char SERP
// truncation. Tools above this threshold get the brand dropped so the
// keyword tail stays visible in search results.
const TITLE_SUFFIX_FITS_MAX = 50;

export function toolMetadata(tool: Tool): Metadata {
  // Default: title is brandless here; the root layout template
  // ("%s | Toollyz") appends the brand exactly once.
  const rawTitle = tool.seo?.title ?? tool.name;
  const description = tool.seo?.description ?? tool.tagline;
  const meta = buildMetadata({
    title: rawTitle,
    description,
    path: `/tools/${tool.slug}`,
    keywords: tool.keywords,
  });

  // For long SEO titles, override the layout template by setting
  // `title.absolute` — that drops the brand suffix and keeps the full
  // keyword phrase visible in SERPs. OG / Twitter titles already use the
  // brandless string set above, so we don't touch those.
  if (rawTitle.length > TITLE_SUFFIX_FITS_MAX) {
    meta.title = { absolute: rawTitle };
  }
  return meta;
}

export function categoryMetadata(category: Category, toolCount: number): Metadata {
  return buildMetadata({
    title: `${category.name} Tools`,
    description: `${category.description} Browse ${toolCount} ${category.name.toLowerCase()} tools, all free and privacy-first.`,
    path: `/category/${category.slug}`,
  });
}
