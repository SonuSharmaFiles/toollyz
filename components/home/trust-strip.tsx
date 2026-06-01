import { Lock, Zap, Heart, BadgeCheck } from "lucide-react";

const items = [
  {
    icon: Zap,
    title: "Lightning fast",
    description: "Server-rendered, edge-ready and tuned for Core Web Vitals.",
  },
  {
    icon: Lock,
    title: "Private by default",
    description: "Most tools run in your browser. Your data stays with you.",
  },
  {
    icon: BadgeCheck,
    title: "No signup, no fluff",
    description: "Open a tool, use it, move on. Zero friction, zero noise.",
  },
  {
    icon: Heart,
    title: "Free forever",
    description: "Built as a community-first project. Free to use, always.",
  },
];

export function TrustStrip() {
  return (
    <section aria-labelledby="trust-strip-heading" className="container-page py-12 sm:py-16">
      {/* Visually hidden section heading anchors the h3 items below so
          the page never skips from h1 (hero) → h3 — fixes the WCAG
          1.3.1 / 2.4.6 heading-hierarchy violation. */}
      <h2 id="trust-strip-heading" className="sr-only">
        Why Toollyz
      </h2>
      <div className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-10">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex items-start gap-3">
              <span aria-hidden="true" className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
