"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ToolCard } from "@/components/shared/tool-card";
import { getFeaturedTools } from "@/lib/tools/registry";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function FeaturedTools() {
  const featured = getFeaturedTools();
  if (!featured.length) return null;

  return (
    <section id="featured" aria-labelledby="featured-heading" className="container-page py-16 sm:py-24">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Featured
          </p>
          <h2 id="featured-heading" className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Our most-loved tools
          </h2>
          <p className="text-base text-muted-foreground">
            Hand-picked utilities our users reach for again and again.
          </p>
        </div>
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <motion.ul
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {featured.map((tool) => (
          <motion.li key={tool.slug} variants={item}>
            <ToolCard tool={tool} />
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
