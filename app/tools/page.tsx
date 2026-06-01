import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ToolCard } from "@/components/shared/tool-card";
import { ToolsFilter } from "@/components/tools/tools-filter";
import { tools as ALL_TOOLS } from "@/lib/tools/registry";
import { categories } from "@/lib/tools/categories";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, itemListSchema, breadcrumbSchema } from "@/lib/seo/json-ld";

export const metadata: Metadata = buildMetadata({
  title: "All Tools",
  description:
    "Explore every tool on Toollyz. Generators, converters, calculators, SEO helpers and developer utilities — all in one place.",
  path: "/tools",
});

export default function ToolsIndexPage() {
  // Counts passed to the filter so the chips show real numbers
  // before hydration.
  const counts: Record<string, number> = { all: ALL_TOOLS.length };
  for (const c of categories) {
    counts[c.id] = ALL_TOOLS.filter((t) => t.categoryId === c.id).length;
  }

  // ItemList JSON-LD enumerates every tool URL on the directory page —
  // gives crawlers a clean, indexable manifest of the entire catalog
  // (and is the canonical schema for index-style listing pages).
  const schemas = [
    breadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "All Tools", href: "/tools" },
    ]),
    itemListSchema(
      ALL_TOOLS.map((t) => ({ url: `/tools/${t.slug}`, name: t.name })),
      "All Toollyz tools",
    ),
  ];

  return (
    <div className="container-page space-y-10 py-10 sm:py-14">
      <JsonLd data={schemas} />
      <header className="space-y-3">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "All Tools", href: "/tools" }]} />
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          All tools
        </h1>
        <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
          Every utility we&apos;ve built — searchable and filterable. New tools land here
          first.
        </p>
      </header>

      <Suspense
        fallback={<div className="h-32 rounded-2xl border border-border bg-card animate-pulse" />}
      >
        <ToolsFilter counts={counts} />
      </Suspense>

      {/* Empty-state placeholder. Hidden by default; the client filter
          un-hides it when zero tools match. */}
      <div
        id="tools-empty"
        role="status"
        aria-live="polite"
        hidden
        className="rounded-2xl border border-border bg-card p-10 text-center"
      >
        <p className="text-sm font-medium">No tools match your filters.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Try clearing the search or switching category.
        </p>
      </div>

      {/* Visually hidden section heading anchors the h3 tool-card titles
          below so the page never skips from h1 → h3 — fixes the WCAG
          1.3.1 / 2.4.6 heading-hierarchy violation. */}
      <h2 id="tools-list-heading" className="sr-only">
        Tool directory
      </h2>

      {/* The full list — server-rendered so every tool is in the HTML.
          The client filter toggles `hidden` on individual <li>s. */}
      <ul
        id="tools-list"
        aria-labelledby="tools-list-heading"
        className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {ALL_TOOLS.map((tool) => {
          const haystack = [tool.name, tool.tagline, tool.slug, ...(tool.keywords ?? [])]
            .join(" ")
            .toLowerCase();
          return (
            <li
              key={tool.slug}
              data-slug={tool.slug}
              data-category={tool.categoryId}
              data-haystack={haystack}
            >
              <ToolCard tool={tool} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
