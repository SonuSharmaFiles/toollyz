import type { Metadata } from "next";
import { SITE, absoluteUrl } from "./constants";
import type { Tool, Category, ToolSEO } from "@/lib/tools/types";

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

  // Open Graph and Twitter `images` are intentionally NOT set here. We
  // rely on Next's file convention (`app/opengraph-image.tsx` site-wide,
  // `app/tools/[slug]/opengraph-image.tsx` per-tool) to emit the
  // correct og:image / twitter:image tags. Hard-coding them here would
  // double-emit and override the per-route image. The `image` prop is
  // kept on the BuildMetadataInput interface only for the rare case of
  // an explicit override.
  void image;

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
      // images: emitted by opengraph-image.tsx file convention.
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: SITE.twitter,
      // images: emitted by opengraph-image.tsx file convention (Next
      // also feeds it into twitter:image automatically).
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

export function toolMetadata(tool: Tool, seo?: ToolSEO): Metadata {
  // Default: title is brandless here; the root layout template
  // ("%s | Toollyz") appends the brand exactly once.
  // `seo` is passed in by the tool page (sourced from registry-seo.ts);
  // it's kept optional so callers without seo content still work.
  const rawTitle = seo?.title ?? tool.name;
  const description = seo?.description ?? tool.tagline;
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

// Categories whose names are already plural ("Calculators",
// "Generators", "Converters") get the bare name as their heading —
// otherwise we'd render "Calculators tools" / "Generators tools".
// Singular names ("Image", "Text", "Developer", "SEO", "PDF") still
// take the " tools" suffix so the page reads naturally. The metadata
// title and h1 both go through this helper so they stay in sync.
export function categoryHeading(name: string): string {
  return name.endsWith("s") ? name : `${name} tools`;
}

export function categoryMetadata(category: Category, toolCount: number): Metadata {
  const heading = categoryHeading(category.name);
  // Title-cased version for the <title> tag.
  const titleCase = heading.replace(/\btools\b/, "Tools");
  return buildMetadata({
    title: titleCase,
    description: `${category.description} Browse ${toolCount} ${category.name.toLowerCase()} tools, all free and privacy-first.`,
    path: `/category/${category.slug}`,
  });
}
