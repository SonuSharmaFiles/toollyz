"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { CategoriesDropdown } from "@/components/layout/categories-dropdown";
import { CommandSearchTrigger } from "@/components/layout/command-search";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { categories } from "@/lib/tools/categories";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all",
        scrolled
          ? "border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75"
          : "border-transparent bg-background",
      )}
    >
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          <CategoriesDropdown />
          <Button variant="ghost" size="sm" render={<Link href="/tools" />}>
            All Tools
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/about" />}>
            About
          </Button>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <CommandSearchTrigger />
          <ThemeToggle />
          <Button
            size="sm"
            className="hidden md:inline-flex"
            render={<Link href="/tools" />}
          >
            All Tools
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden">
                  <Menu className="size-4" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-[88%] max-w-sm">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Browse tools, categories and pages.</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 p-6 pt-0">
                <div className="space-y-1">
                  <Link
                    href="/tools"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    All Tools
                  </Link>
                  <Link
                    href="/about"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    About
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Contact
                  </Link>
                </div>
                <div className="space-y-2">
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Categories
                  </p>
                  <ul className="space-y-0.5">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <li key={category.slug}>
                          <Link
                            href={`/category/${category.slug}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                          >
                            <span className="inline-flex size-8 items-center justify-center rounded-md bg-muted">
                              <Icon className="size-4 text-foreground/80" />
                            </span>
                            {category.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
