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
      <span
        aria-hidden
        className="relative inline-flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105"
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-4" aria-hidden>
          <path
            d="M6 4h12a2 2 0 0 1 2 2v3M4 6v12a2 2 0 0 0 2 2h3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M9 12.5l2.5 2.5L16 10"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
          Toollyz
        </span>
      )}
    </Link>
  );
}
