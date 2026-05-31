import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Toollyz home"
      className={cn(
        "group inline-flex items-center gap-2 font-heading text-base font-semibold tracking-tight",
        className,
      )}
    >
      <ToollyzMark className="size-8 shrink-0 transition-transform group-hover:scale-105" />
      {showWordmark && (
        <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
          Toollyz
        </span>
      )}
    </Link>
  );
}

/**
 * The Toollyz brand mark — a gold "T" monogram inside a dark rounded
 * tile. The top bar has a chamfered upper-right corner (the bar is
 * full-width along its bottom edge and narrower along the top); the
 * foot at the bottom-left mirrors that with a chamfered lower-left
 * corner. The same path data backs `app/icon.svg` so the favicon and
 * the on-page logo stay identical.
 */
export function ToollyzMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={cn("rounded-[22%] shadow-sm ring-1 ring-black/10", className)}
    >
      <defs>
        <linearGradient id="toollyz-mark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f6dc7e" />
          <stop offset="45%" stopColor="#d6a945" />
          <stop offset="100%" stopColor="#6b4f1f" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="#000000" />
      <g fill="url(#toollyz-mark-gradient)">
        {/* Top bar: full-width bottom edge, chamfered top-right corner */}
        <path d="M11 14 L73 14 L89 30 L89 36 L11 36 Z" />
        {/* Vertical stem */}
        <path d="M38 36 L60 36 L60 92 L38 92 Z" />
        {/* Foot extending left from the stem, chamfered bottom-left corner */}
        <path d="M11 70 L38 70 L38 92 L23 92 L11 80 Z" />
      </g>
    </svg>
  );
}
