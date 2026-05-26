import { Breadcrumb, type BreadcrumbItem } from "@/components/shared/breadcrumb";
import { Badge } from "@/components/ui/badge";
import type { Tool } from "@/lib/tools/types";
import { getCategoryById } from "@/lib/tools/categories";
import { cn } from "@/lib/utils";

interface ToolHeaderProps {
  tool: Tool;
}

export function ToolHeader({ tool }: ToolHeaderProps) {
  const category = getCategoryById(tool.categoryId);
  const Icon = tool.icon;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    ...(category
      ? [{ label: category.name, href: `/category/${category.slug}` }]
      : []),
    { label: tool.name, href: `/tools/${tool.slug}` },
  ];

  return (
    <header className="space-y-5">
      <Breadcrumb items={breadcrumbs} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span
          aria-hidden
          className={cn(
            "inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm ring-1 ring-black/5 dark:ring-white/5",
            category?.gradient ?? "from-indigo-500/15 to-violet-500/15",
          )}
        >
          <Icon className={cn("size-6", category?.accent ?? "text-indigo-500")} />
        </span>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              {tool.name}
            </h1>
            {tool.status === "coming-soon" && (
              <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
                Coming soon
              </Badge>
            )}
          </div>
          <p className="text-pretty max-w-2xl text-base leading-relaxed text-muted-foreground">
            {tool.description}
          </p>
        </div>
      </div>
    </header>
  );
}
