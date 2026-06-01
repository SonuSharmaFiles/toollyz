"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/tools/categories";
import { cn } from "@/lib/utils";

const ALL_FILTER = "all";
const LIST_ID = "tools-list";
const EMPTY_ID = "tools-empty";
const COUNTS_ATTR = "data-tools-counts";

interface ToolsFilterProps {
  /** Per-category tool counts, plus an "all" key — passed in by the server
   * page so the chips can render real numbers before hydration. */
  counts: Record<string, number>;
}

/**
 * Client-side filter for the server-rendered `/tools/` index. Toggles
 * `hidden` on the `<li>` elements emitted by the server, keeping all 207
 * tool links in the HTML for crawlers while still giving humans a snappy
 * search + chip experience.
 */
export function ToolsFilter({ counts }: ToolsFilterProps) {
  const params = useSearchParams();
  const initialQuery = params.get("q") ?? "";
  const initialCategory = params.get("category") ?? ALL_FILTER;

  const [query, setQuery] = React.useState(initialQuery);
  const [activeCategory, setActiveCategory] = React.useState(initialCategory);
  const [visibleCount, setVisibleCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    const ul = document.getElementById(LIST_ID);
    if (!ul) return;
    const q = query.trim().toLowerCase();
    let visible = 0;
    for (const node of ul.querySelectorAll<HTMLLIElement>("li[data-slug]")) {
      const haystack = node.getAttribute("data-haystack") ?? "";
      const cat = node.getAttribute("data-category") ?? "";
      const matchesQuery = !q || haystack.includes(q);
      const matchesCat = activeCategory === ALL_FILTER || cat === activeCategory;
      const show = matchesQuery && matchesCat;
      node.hidden = !show;
      if (show) visible++;
    }
    setVisibleCount(visible);
    const empty = document.getElementById(EMPTY_ID);
    if (empty) empty.hidden = visible > 0;
    ul.setAttribute(COUNTS_ATTR, String(visible));
  }, [query, activeCategory]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across every tool…"
          className="h-12 rounded-xl pl-10 text-base"
          aria-label="Search tools"
          aria-controls={LIST_ID}
        />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip
          label="All"
          count={counts[ALL_FILTER] ?? 0}
          active={activeCategory === ALL_FILTER}
          onClick={() => setActiveCategory(ALL_FILTER)}
        />
        {categories.map((category) => (
          <FilterChip
            key={category.id}
            label={category.name}
            count={counts[category.id] ?? 0}
            active={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
          />
        ))}
      </div>
      {visibleCount !== null && (
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Showing {visibleCount} of {counts[ALL_FILTER] ?? 0} tools.
        </p>
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
      aria-pressed={active}
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
