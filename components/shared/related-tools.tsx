import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ToolCard } from "@/components/shared/tool-card";
import { getRelatedTools } from "@/lib/tools/registry";
import { getCategoryById } from "@/lib/tools/categories";

interface RelatedToolsProps {
  slug: string;
  categoryId: string;
}

export function RelatedTools({ slug, categoryId }: RelatedToolsProps) {
  const related = getRelatedTools(slug);
  const category = getCategoryById(categoryId);
  if (!related.length) return null;

  return (
    <section aria-labelledby="related-heading" className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2
          id="related-heading"
          className="font-heading text-2xl font-semibold tracking-tight"
        >
          Related tools
        </h2>
        {category && (
          <Link
            href={`/category/${category.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            See all {category.name.toLowerCase()} tools
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      <ul className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((tool) => (
          <li key={tool.slug}>
            <ToolCard tool={tool} />
          </li>
        ))}
      </ul>
    </section>
  );
}
