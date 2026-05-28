import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { ToolsExplorer } from "@/components/tools/tools-explorer";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "All Tools",
  description:
    "Explore every tool on Toollyz. Generators, converters, calculators, SEO helpers and developer utilities — all in one place.",
  path: "/tools",
});

export default function ToolsIndexPage() {
  return (
    <div className="container-page space-y-10 py-10 sm:py-14">
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
        fallback={<div className="h-72 rounded-2xl border border-border bg-card animate-pulse" />}
      >
        <ToolsExplorer />
      </Suspense>
    </div>
  );
}
