import Link from "next/link";
import { Bell, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Tool } from "@/lib/tools/types";
import { getCategoryById } from "@/lib/tools/categories";
import { cn } from "@/lib/utils";

interface ComingSoonProps {
  tool: Tool;
}

export function ComingSoon({ tool }: ComingSoonProps) {
  const category = getCategoryById(tool.categoryId);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-8 sm:p-12">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-gradient-to-br opacity-40 blur-3xl",
          category?.gradient ?? "from-indigo-500/20 to-violet-500/20",
        )}
      />
      <div className="relative space-y-6">
        <Badge variant="secondary" className="gap-1.5 uppercase tracking-wider text-[10px]">
          <Sparkles className="size-3" />
          Coming soon
        </Badge>
        <div className="space-y-3 max-w-xl">
          <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            We&apos;re putting the finishing touches on {tool.name}.
          </h2>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            This tool is part of our active roadmap. In the meantime, explore the rest of
            our growing library — every tool we ship is fast, free and built with the
            same privacy-first standards.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href="/tools" />}>Browse all tools</Button>
          <Button variant="outline" render={<Link href="/contact" />}>
            <Bell className="size-3.5" />
            Request priority
          </Button>
        </div>
      </div>
    </div>
  );
}
