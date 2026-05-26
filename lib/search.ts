import Fuse from "fuse.js";
import { tools } from "@/lib/tools/registry";
import type { Tool } from "@/lib/tools/types";

let _fuse: Fuse<Tool> | null = null;

function getFuse(): Fuse<Tool> {
  if (_fuse) return _fuse;
  _fuse = new Fuse(tools, {
    keys: [
      { name: "name", weight: 0.5 },
      { name: "tagline", weight: 0.25 },
      { name: "keywords", weight: 0.2 },
      { name: "categoryId", weight: 0.05 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    includeScore: true,
  });
  return _fuse;
}

export function searchTools(query: string, limit = 8): Tool[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  return getFuse()
    .search(trimmed, { limit })
    .map((r) => r.item);
}
