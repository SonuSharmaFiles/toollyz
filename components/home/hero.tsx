"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/shared/search-bar";
import { tools } from "@/lib/tools/registry";

const POPULAR_CHIPS = [
  "qr-code-generator",
  "json-formatter",
  "password-generator",
  "meta-tag-generator",
];

export function Hero() {
  const chips = POPULAR_CHIPS.map((slug) => tools.find((t) => t.slug === slug)).filter(
    (t): t is NonNullable<typeof t> => Boolean(t),
  );

  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="hero-gradient absolute inset-0 -z-10" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container-page py-16 sm:py-24 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-[11px] font-medium text-foreground/80 backdrop-blur">
            <Sparkles className="size-3 text-primary" />
            <span>Premium online tools, free forever</span>
          </div>
          <h1 id="hero-heading" className="mt-6 text-balance font-heading text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            One platform for{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              every tool
            </span>{" "}
            you&apos;ll need.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Generate QR codes, format JSON, convert files and unlock dozens more
            utilities — fast, private, and crafted with care. No signup, no fluff.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mt-8 max-w-xl"
          >
            <SearchBar variant="hero" placeholder="Try “QR code”, “JSON” or “password”…" />
          </motion.div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {chips.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  <Icon className="size-3.5" />
                  {tool.name}
                </Link>
              );
            })}
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" render={<Link href="/tools" />}>
              Browse all tools
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" size="lg" render={<Link href="#categories" />}>
              Explore categories
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            No signup · Privacy-first · Free forever
          </p>
        </motion.div>
      </div>
    </section>
  );
}
