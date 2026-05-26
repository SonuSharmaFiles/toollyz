"use client";

import { motion } from "framer-motion";
import { CategoryCard } from "@/components/shared/category-card";
import { categories } from "@/lib/tools/categories";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function CategoriesGrid() {
  return (
    <section id="categories" aria-labelledby="categories-heading" className="container-page py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Categories
        </p>
        <h2 id="categories-heading" className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Tools, organized the way you think
        </h2>
        <p className="mt-3 text-balance text-base text-muted-foreground">
          Browse by purpose — from images and text to developer utilities and SEO
          helpers. Every category grows with care, not clutter.
        </p>
      </div>
      <motion.ul
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {categories.map((category) => (
          <motion.li key={category.id} variants={item}>
            <CategoryCard category={category} />
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
