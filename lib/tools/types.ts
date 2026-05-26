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
  seo?: ToolSEO;
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
