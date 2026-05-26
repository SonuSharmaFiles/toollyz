"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { searchTools } from "@/lib/search";
import type { Tool } from "@/lib/tools/types";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  variant?: "hero" | "compact";
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  variant = "compact",
  className,
  placeholder = "Search tools…",
  autoFocus,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Tool[]>([]);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      setResults(searchTools(query, 6));
      setActiveIndex(0);
    }, 120);
    return () => clearTimeout(handle);
  }, [query]);

  React.useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function navigateTo(tool: Tool) {
    router.push(`/tools/${tool.slug}`);
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (results[activeIndex]) {
        e.preventDefault();
        navigateTo(results[activeIndex]);
      } else if (query.trim()) {
        e.preventDefault();
        router.push(`/tools?q=${encodeURIComponent(query.trim())}`);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showResults = open && (results.length > 0 || query.trim().length > 0);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        className={cn(
          "relative flex items-center gap-2.5 rounded-xl border border-border bg-background transition-all focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-primary/15",
          variant === "hero" ? "h-14 px-4 shadow-sm" : "h-10 px-3",
        )}
      >
        <Search
          className={cn(
            "shrink-0 text-muted-foreground",
            variant === "hero" ? "size-5" : "size-4",
          )}
        />
        <input
          type="search"
          inputMode="search"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Search tools"
          className={cn(
            "flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70",
            variant === "hero" ? "text-base" : "text-sm",
          )}
        />
        {variant === "hero" && query.trim() && (
          <Link
            href={`/tools?q=${encodeURIComponent(query.trim())}`}
            className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground sm:inline-flex"
          >
            Search
            <ArrowRight className="size-3.5" />
          </Link>
        )}
        {variant === "compact" && (
          <kbd className="hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        )}
      </div>

      {showResults && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {results.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No tools found for{" "}
              <span className="font-medium text-foreground">&quot;{query}&quot;</span>
            </div>
          ) : (
            <ul className="max-h-80 overflow-auto py-1">
              {results.map((tool, idx) => {
                const Icon = tool.icon;
                const isActive = idx === activeIndex;
                return (
                  <li key={tool.slug}>
                    <button
                      type="button"
                      onClick={() => navigateTo(tool)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                        isActive ? "bg-accent text-accent-foreground" : "text-foreground",
                      )}
                    >
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Icon className="size-4 text-foreground/80" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium leading-tight">
                          {tool.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {tool.tagline}
                        </span>
                      </span>
                      {tool.status === "coming-soon" && (
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          Soon
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
