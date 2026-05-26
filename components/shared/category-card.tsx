import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/tools/types";
import { countToolsInCategory } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: Category;
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  const Icon = category.icon;
  const { total, live } = countToolsInCategory(category.id);

  return (
    <Link
      href={`/category/${category.slug}`}
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(99,102,241,0.10)]",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-6 -top-6 size-32 rounded-full bg-gradient-to-br opacity-50 blur-2xl transition-opacity group-hover:opacity-80",
          category.gradient,
        )}
      />
      <span
        aria-hidden
        className={cn(
          "inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm ring-1 ring-black/5 dark:ring-white/5",
          category.gradient,
        )}
      >
        <Icon className={cn("size-5", category.accent)} />
      </span>
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold tracking-tight">{category.name}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {category.description}
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">{total}</span>{" "}
          {total === 1 ? "tool" : "tools"}
          {live > 0 && (
            <>
              {" "}
              · <span className="text-emerald-500">{live} live</span>
            </>
          )}
        </span>
        <span className="inline-flex items-center gap-1 font-medium text-foreground/70 group-hover:text-primary">
          Browse <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
