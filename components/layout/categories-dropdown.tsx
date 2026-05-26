"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categories } from "@/lib/tools/categories";

export function CategoriesDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-1.5">
            Categories
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-72 p-1.5">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <DropdownMenuItem
              key={category.slug}
              render={
                <Link href={`/category/${category.slug}`} className="cursor-pointer">
                  <span className="inline-flex size-7 items-center justify-center rounded-md bg-muted">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {category.description}
                    </span>
                  </span>
                </Link>
              }
            />
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
