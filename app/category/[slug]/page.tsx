import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ToolCard } from "@/components/shared/tool-card";
import { categories, getCategoryBySlug } from "@/lib/tools/categories";
import { getToolsByCategory } from "@/lib/tools/registry";
import { categoryMetadata } from "@/lib/seo/metadata";
import { JsonLd, breadcrumbSchema } from "@/lib/seo/json-ld";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  const tools = getToolsByCategory(category.id);
  return categoryMetadata(category, tools.length);
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const tools = getToolsByCategory(category.id);
  const Icon = category.icon;

  const schemas = [
    breadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "Tools", href: "/tools" },
      { name: category.name, href: `/category/${category.slug}` },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="container-page space-y-10 py-10 sm:py-14">
        <header className="space-y-5">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Tools", href: "/tools" },
              { label: category.name, href: `/category/${category.slug}` },
            ]}
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span
              aria-hidden
              className={cn(
                "inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm ring-1 ring-black/5 dark:ring-white/5",
                category.gradient,
              )}
            >
              <Icon className={cn("size-6", category.accent)} />
            </span>
            <div className="space-y-2">
              <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                {category.name} tools
              </h1>
              <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
                {category.description}
              </p>
            </div>
          </div>
        </header>

        {tools.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No tools in this category yet — check back soon.
          </div>
        ) : (
          <ul
            aria-label={`${tools.length} ${category.name} tools`}
            className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {tools.map((tool) => (
              <li key={tool.slug}>
                <ToolCard tool={tool} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
