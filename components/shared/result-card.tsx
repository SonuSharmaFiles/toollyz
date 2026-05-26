import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function ResultCard({
  title,
  description,
  children,
  action,
  className,
}: ResultCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-5 shadow-sm",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            {title && (
              <h3 className="text-sm font-medium tracking-tight">{title}</h3>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {action && <div className="flex shrink-0 items-center gap-1">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
