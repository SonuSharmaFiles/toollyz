"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { tools } from "@/lib/tools/registry";
import { categories } from "@/lib/tools/categories";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CommandSearchTrigger() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    function down(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  function runCommand(callback: () => void) {
    setOpen(false);
    callback();
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-full max-w-xs justify-between gap-3 rounded-xl bg-background pr-1.5 text-muted-foreground sm:flex md:w-72"
      >
        <span className="inline-flex items-center gap-2 text-sm">
          <Search className="size-4" />
          <span>Search tools…</span>
        </span>
        <kbd className="inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        className="sm:hidden"
      >
        <Search className="size-4" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Search tools">
        <CommandInput placeholder="Search for any tool…" />
        <CommandList>
          <CommandEmpty>No tools found.</CommandEmpty>
          <CommandGroup heading="Tools">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <CommandItem
                  key={tool.slug}
                  value={`${tool.name} ${tool.keywords.join(" ")}`}
                  onSelect={() => runCommand(() => router.push(`/tools/${tool.slug}`))}
                >
                  <Icon className="text-muted-foreground" />
                  <span>{tool.name}</span>
                  {tool.status === "coming-soon" && (
                    <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Soon
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Categories">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <CommandItem
                  key={category.slug}
                  value={`${category.name} category`}
                  onSelect={() => runCommand(() => router.push(`/category/${category.slug}`))}
                >
                  <Icon className="text-muted-foreground" />
                  <span>{category.name}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
