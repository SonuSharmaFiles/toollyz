import {
  Image as ImageIcon,
  Type,
  Code2,
  Search,
  ArrowLeftRight,
  Sparkles,
  Calculator,
  FileText,
} from "lucide-react";
import type { Category } from "./types";

export const categories: Category[] = [
  {
    id: "image",
    slug: "image",
    name: "Image",
    description: "Resize, compress, convert and edit images right in your browser.",
    icon: ImageIcon,
    accent: "text-rose-500",
    gradient: "from-rose-500/15 to-fuchsia-500/15",
  },
  {
    id: "text",
    slug: "text",
    name: "Text",
    description: "Format, count, transform and clean up text with precision.",
    icon: Type,
    accent: "text-sky-500",
    gradient: "from-sky-500/15 to-indigo-500/15",
  },
  {
    id: "developer",
    slug: "developer",
    name: "Developer",
    description: "Utilities to speed up everyday development work.",
    icon: Code2,
    accent: "text-indigo-500",
    gradient: "from-indigo-500/15 to-violet-500/15",
  },
  {
    id: "seo",
    slug: "seo",
    name: "SEO",
    description: "Meta tags, robots, schema and search helpers.",
    icon: Search,
    accent: "text-emerald-500",
    gradient: "from-emerald-500/15 to-teal-500/15",
  },
  {
    id: "converters",
    slug: "converters",
    name: "Converters",
    description: "Switch between formats, units, encodings and standards.",
    icon: ArrowLeftRight,
    accent: "text-amber-500",
    gradient: "from-amber-500/15 to-orange-500/15",
  },
  {
    id: "generators",
    slug: "generators",
    name: "Generators",
    description: "Generate codes, passwords, UUIDs, dummy content and more.",
    icon: Sparkles,
    accent: "text-violet-500",
    gradient: "from-violet-500/15 to-purple-500/15",
  },
  {
    id: "calculators",
    slug: "calculators",
    name: "Calculators",
    description: "Quick calculators for everyday computation.",
    icon: Calculator,
    accent: "text-cyan-500",
    gradient: "from-cyan-500/15 to-blue-500/15",
  },
  {
    id: "pdf",
    slug: "pdf",
    name: "PDF",
    description: "Merge, split, compress and convert PDF documents.",
    icon: FileText,
    accent: "text-red-500",
    gradient: "from-red-500/15 to-orange-500/15",
  },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
