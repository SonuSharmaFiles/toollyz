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
 * The Toollyz brand mark — two interlocking "T" monograms rendered in
 * gold on a dark rounded tile. The upper T has a horizontal top bar
 * with a chamfered upper-right corner and a short vertical stem
 * hanging from the right side; the lower T is the same shape rotated
 * 180° (chamfered lower-left corner on the bottom bar, stem rising
 * from the left). The same path data backs `app/icon.svg` so the
 * favicon and the on-page logo stay identical.
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
        {/* Upper T: horizontal bar with a chamfered top-right corner */}
        <path d="M11 12 L75 12 L88 25 L88 30 L11 30 Z" />
        {/* Upper T: short vertical stem hanging from the right side of the bar */}
        <path d="M59 30 L78 30 L78 53 L59 53 Z" />
        {/* Lower T: short vertical stem rising from the left side of the bottom bar */}
        <path d="M22 47 L41 47 L41 70 L22 70 Z" />
        {/* Lower T: horizontal bar with a chamfered bottom-left corner */}
        <path d="M12 70 L89 70 L89 88 L25 88 L12 75 Z" />
      </g>
    </svg>
  );
}
