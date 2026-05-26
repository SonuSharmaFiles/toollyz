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
    alternates: { canonical: url },
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

export function toolMetadata(tool: Tool): Metadata {
  const title = tool.seo?.title ?? `${tool.name} — ${SITE.name}`;
  const description = tool.seo?.description ?? tool.tagline;
  return buildMetadata({
    title,
    description,
    path: `/tools/${tool.slug}`,
    keywords: tool.keywords,
  });
}

export function categoryMetadata(category: Category, toolCount: number): Metadata {
  return buildMetadata({
    title: `${category.name} Tools — ${SITE.name}`,
    description: `${category.description} Browse ${toolCount} ${category.name.toLowerCase()} tools, all free and privacy-first.`,
    path: `/category/${category.slug}`,
  });
}
