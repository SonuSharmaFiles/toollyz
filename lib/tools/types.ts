import type { LucideIcon } from "lucide-react";

export type ToolStatus = "live" | "coming-soon";

export interface ToolFAQ {
  q: string;
  a: string;
}

export interface ToolSEO {
  title?: string;
  description?: string;
  faqs?: ToolFAQ[];
  what?: string;
  how?: string[];
  benefits?: string[];
  relatedSlugs?: string[];
}

// Note: seo content lives in `registry-seo.ts` (a side-table keyed by
// slug) so it stays out of the client search-index bundle. Server-only
// tool pages read it via `getToolSeo(slug)`.
export interface Tool {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  categoryId: string;
  icon: LucideIcon;
  status: ToolStatus;
  featured?: boolean;
  keywords: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  gradient: string;
}
