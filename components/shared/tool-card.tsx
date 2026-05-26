import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Tool } from "@/lib/tools/types";
import { getCategoryById } from "@/lib/tools/categories";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  tool: Tool;
  className?: string;
}

export function ToolCard({ tool, className }: ToolCardProps) {
  const category = getCategoryById(tool.categoryId);
  const Icon = tool.icon;

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(99,102,241,0.10)]",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <span
          aria-hidden
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105 dark:ring-white/5",
            category?.gradient ?? "from-indigo-500/15 to-violet-500/15",
          )}
        >
          <Icon className={cn("size-5", category?.accent ?? "text-indigo-500")} />
        </span>
        {tool.status === "coming-soon" ? (
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
            Soon
          </Badge>
        ) : (
          <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold tracking-tight">{tool.name}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {tool.tagline}
        </p>
      </div>
    </Link>
  );
}
