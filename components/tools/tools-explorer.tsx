"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { ToolCard } from "@/components/shared/tool-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { categories } from "@/lib/tools/categories";
import { tools as ALL_TOOLS } from "@/lib/tools/registry";
import type { Tool } from "@/lib/tools/types";
import { searchTools } from "@/lib/search";
import { cn } from "@/lib/utils";

const ALL_FILTER = "all";

export function ToolsExplorer() {
  const params = useSearchParams();
  const initialQuery = params.get("q") ?? "";
  const initialCategory = params.get("category") ?? ALL_FILTER;

  const [query, setQuery] = React.useState(initialQuery);
  const [activeCategory, setActiveCategory] = React.useState<string>(initialCategory);

  const filtered: Tool[] = React.useMemo(() => {
    const base = query.trim() ? searchTools(query, 64) : ALL_TOOLS;
    if (activeCategory === ALL_FILTER) return base;
    return base.filter((t) => t.categoryId === activeCategory);
  }, [query, activeCategory]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across every tool…"
            className="h-12 rounded-xl pl-10 text-base"
            aria-label="Search tools"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <FilterChip
            label="All"
            active={activeCategory === ALL_FILTER}
            count={ALL_TOOLS.length}
            onClick={() => setActiveCategory(ALL_FILTER)}
          />
          {categories.map((category) => {
            const count = ALL_TOOLS.filter((t) => t.categoryId === category.id).length;
            return (
              <FilterChip
                key={category.id}
                label={category.name}
                active={activeCategory === category.id}
                count={count}
                onClick={() => setActiveCategory(category.id)}
              />
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center" role="status" aria-live="polite">
          <p className="text-sm font-medium">No tools match your filters.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing the search or switching category.
          </p>
        </div>
      ) : (
        <ul
          aria-label={`${filtered.length} tools`}
          className="grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((tool) => (
            <li key={tool.slug}>
              <ToolCard tool={tool} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function FilterChip({ label, count, active, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-background text-foreground/80 hover:border-border hover:bg-muted",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 text-[10px]",
          active ? "bg-primary/20" : "bg-muted",
        )}
      >
        {count}
      </span>
    </button>
  );
}
