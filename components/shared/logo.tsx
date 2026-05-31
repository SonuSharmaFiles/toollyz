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
 * The Toollyz brand mark — a gold "T" monogram (top bar with a slanted
 * right edge, vertical stem, small foot at the bottom-left) inside a
 * dark rounded tile. Reused by the navbar Logo, the footer, and the
 * favicon/apple-icon (which copy the same path data).
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
          <stop offset="0%" stopColor="#f0d68a" />
          <stop offset="35%" stopColor="#d6ad55" />
          <stop offset="70%" stopColor="#a87f33" />
          <stop offset="100%" stopColor="#6e5021" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="#0a0a0a" />
      <g fill="url(#toollyz-mark-gradient)">
        <path d="M11 13 H85 L67 36 H11 Z" />
        <path d="M36 36 H56 V90 H36 Z" />
        <path d="M11 70 H36 V90 H11 Z" />
      </g>
    </svg>
  );
}
