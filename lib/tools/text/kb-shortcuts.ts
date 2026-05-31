// Keyboard Shortcut Generator engine. Lets a user build a printable
// shortcut cheat sheet for any app: organised into sections, every row
// is "description + keys[]". The render layer turns each key string into
// a styled <kbd>. Mod-key parsing handles the cross-platform overlap
// (e.g. Cmd↔Ctrl) — input like "Cmd+Shift+P" splits on `+`/` ` into
// individual keys.
//
// Export targets:
//   - Markdown table (for repos / Notion / docs)
//   - Plain text (linear, easy paste anywhere)

export interface Shortcut {
  /** Description like "Open command palette". */
  description: string;
  /** Raw input like "Cmd+Shift+P". */
  keys: string;
}

export interface ShortcutSection {
  id: string;
  title: string;
  items: Shortcut[];
}

export interface ShortcutSheet {
  title: string;
  sections: ShortcutSection[];
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

/** Split "Cmd+Shift+P" → ["Cmd","Shift","P"], "Ctrl K Ctrl C" → ["Ctrl","K","Ctrl","C"]. */
export function parseKeys(input: string): string[] {
  return input
    .split(/\s*\+\s*|\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Render key chord arrays back to a string for copy/share. */
export function joinKeys(keys: string[]): string {
  return keys.join("+");
}

export function newShortcut(partial: Partial<Shortcut> = {}): Shortcut {
  return { description: "", keys: "", ...partial };
}

export function newSection(partial: Partial<ShortcutSection> = {}): ShortcutSection {
  return { id: uid(), title: "Untitled section", items: [], ...partial };
}

export const SAMPLE_SHEET: ShortcutSheet = {
  title: "VS Code (macOS)",
  sections: [
    {
      id: uid(),
      title: "General",
      items: [
        { description: "Command palette", keys: "Cmd+Shift+P" },
        { description: "Quick open file", keys: "Cmd+P" },
        { description: "Open settings", keys: "Cmd+," },
        { description: "Toggle terminal", keys: "Ctrl+`" },
      ],
    },
    {
      id: uid(),
      title: "Editing",
      items: [
        { description: "Move line up / down", keys: "Alt+Up | Alt+Down" },
        { description: "Copy line up / down", keys: "Alt+Shift+Up | Alt+Shift+Down" },
        { description: "Delete line", keys: "Cmd+Shift+K" },
        { description: "Add cursor above / below", keys: "Cmd+Alt+Up | Cmd+Alt+Down" },
        { description: "Comment line", keys: "Cmd+/" },
      ],
    },
    {
      id: uid(),
      title: "Navigation",
      items: [
        { description: "Go to definition", keys: "F12" },
        { description: "Peek definition", keys: "Alt+F12" },
        { description: "Find references", keys: "Shift+F12" },
        { description: "Go to symbol", keys: "Cmd+Shift+O" },
        { description: "Go to line", keys: "Ctrl+G" },
      ],
    },
    {
      id: uid(),
      title: "Refactor",
      items: [
        { description: "Rename symbol", keys: "F2" },
        { description: "Quick fix", keys: "Cmd+." },
        { description: "Format document", keys: "Cmd+Shift+I" },
      ],
    },
  ],
};

export function toMarkdown(sheet: ShortcutSheet): string {
  const lines: string[] = [];
  lines.push(`# ${sheet.title}`);
  lines.push("");
  for (const sec of sheet.sections) {
    lines.push(`## ${sec.title}`);
    lines.push("");
    lines.push("| Action | Shortcut |");
    lines.push("| --- | --- |");
    for (const item of sec.items) {
      const keys = item.keys
        .split(/\s*\|\s*/)
        .map((c) => parseKeys(c).map((k) => `\`${k}\``).join(" + "))
        .join(" or ");
      lines.push(`| ${item.description || "—"} | ${keys || "—"} |`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function toPlainText(sheet: ShortcutSheet): string {
  const lines: string[] = [];
  lines.push(sheet.title);
  lines.push("=".repeat(sheet.title.length));
  lines.push("");
  for (const sec of sheet.sections) {
    lines.push(sec.title);
    lines.push("-".repeat(sec.title.length));
    const max = Math.max(...sec.items.map((i) => (i.description ?? "").length), 0);
    for (const item of sec.items) {
      const desc = (item.description || "").padEnd(max + 4, " ");
      lines.push(`${desc}${item.keys}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
