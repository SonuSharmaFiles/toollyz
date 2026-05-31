// API Response Viewer engine. Auto-detects JSON or XML input, builds a
// uniform "Node" tree, and supports JSONPath/XPath-style breadcrumb
// addresses for any selected node. Pure functions.

export type Format = "json" | "xml" | "unknown";

export type NodeKind = "object" | "array" | "string" | "number" | "boolean" | "null" | "element";

export interface TreeNode {
  /** Display key (object key, array index, or element tag). */
  key: string;
  /** Path used to address the node ($.foo[0].bar or /root/foo[0]/bar). */
  path: string;
  kind: NodeKind;
  /** Raw scalar value when kind is a scalar. */
  scalar?: string | number | boolean | null;
  /** Children for object / array / element. */
  children?: TreeNode[];
  /** Attribute count (XML only). */
  attributes?: Record<string, string>;
  /** Original index in the parent (for deterministic ordering). */
  index: number;
}

export interface ParseResult {
  format: Format;
  ok: boolean;
  root?: TreeNode;
  error?: string;
  stats: {
    nodes: number;
    leaves: number;
    objects: number;
    arrays: number;
    elements: number;
    maxDepth: number;
  };
}

function detectFormat(input: string): Format {
  const trimmed = input.trim();
  if (!trimmed) return "unknown";
  if (trimmed.startsWith("<")) return "xml";
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return "json";
  if (trimmed.startsWith('"') || /^-?\d/.test(trimmed) || /^(true|false|null)$/.test(trimmed)) return "json";
  return "unknown";
}

// ── JSON walker ─────────────────────────────────────────────────────────────

function jsonKindOf(v: unknown): NodeKind {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (typeof v === "object") return "object";
  if (typeof v === "string") return "string";
  if (typeof v === "number") return "number";
  if (typeof v === "boolean") return "boolean";
  return "null";
}

function jsonNodeOf(key: string, value: unknown, parentPath: string, index: number): TreeNode {
  const kind = jsonKindOf(value);
  const path = parentPath
    ? Array.isArray(value) || /^\d+$/.test(key)
      ? `${parentPath}[${key}]`
      : `${parentPath}.${key}`
    : key === "$" ? "$" : `$.${key}`;
  const node: TreeNode = { key, path, kind, index };
  if (kind === "object") {
    node.children = Object.entries(value as Record<string, unknown>).map(([k, v], i) =>
      jsonNodeOf(k, v, path, i),
    );
  } else if (kind === "array") {
    node.children = (value as unknown[]).map((v, i) => jsonNodeOf(String(i), v, path, i));
  } else {
    node.scalar = value as string | number | boolean | null;
  }
  return node;
}

// ── XML walker ──────────────────────────────────────────────────────────────

function xmlNodeOf(el: Element, parentPath: string, index: number): TreeNode {
  const tag = el.tagName;
  const xpath = parentPath === "" ? `/${tag}` : `${parentPath}/${tag}[${index + 1}]`;
  const attributes: Record<string, string> = {};
  for (const attr of Array.from(el.attributes)) {
    attributes[attr.name] = attr.value;
  }
  const elementChildren = Array.from(el.children);
  const node: TreeNode = {
    key: tag,
    path: xpath,
    kind: "element",
    attributes,
    children: elementChildren.map((c, i) => xmlNodeOf(c, xpath, i)),
    index,
  };
  if (elementChildren.length === 0) {
    node.scalar = el.textContent ?? "";
  }
  return node;
}

// ── Stats ───────────────────────────────────────────────────────────────────

function statsOf(root: TreeNode): ParseResult["stats"] {
  const stats = { nodes: 0, leaves: 0, objects: 0, arrays: 0, elements: 0, maxDepth: 0 };
  function walk(n: TreeNode, depth: number) {
    stats.nodes++;
    stats.maxDepth = Math.max(stats.maxDepth, depth);
    if (n.kind === "object") stats.objects++;
    else if (n.kind === "array") stats.arrays++;
    else if (n.kind === "element") stats.elements++;
    else stats.leaves++;
    n.children?.forEach((c) => walk(c, depth + 1));
  }
  walk(root, 0);
  return stats;
}

export function parse(input: string): ParseResult {
  const format = detectFormat(input);
  if (format === "unknown") {
    return { format, ok: false, error: "Could not detect JSON or XML format.", stats: emptyStats() };
  }
  if (format === "json") {
    try {
      const parsed = JSON.parse(input);
      const root = jsonNodeOf("$", parsed, "", 0);
      return { format, ok: true, root, stats: statsOf(root) };
    } catch (e) {
      return { format, ok: false, error: e instanceof Error ? e.message : "Invalid JSON", stats: emptyStats() };
    }
  }
  if (typeof DOMParser === "undefined") {
    return { format, ok: false, error: "DOMParser is unavailable.", stats: emptyStats() };
  }
  try {
    const doc = new DOMParser().parseFromString(input, "application/xml");
    const error = doc.querySelector("parsererror");
    if (error) {
      return { format, ok: false, error: `XML parse error: ${error.textContent?.split("\n")[0] ?? "unknown"}`, stats: emptyStats() };
    }
    if (!doc.documentElement) {
      return { format, ok: false, error: "No root element.", stats: emptyStats() };
    }
    const root = xmlNodeOf(doc.documentElement, "", 0);
    return { format, ok: true, root, stats: statsOf(root) };
  } catch (e) {
    return { format, ok: false, error: e instanceof Error ? e.message : "XML error", stats: emptyStats() };
  }
}

function emptyStats() {
  return { nodes: 0, leaves: 0, objects: 0, arrays: 0, elements: 0, maxDepth: 0 };
}

// ── Search ──────────────────────────────────────────────────────────────────

export interface SearchHit {
  path: string;
  preview: string;
  /** Whether the match was on the key or the value. */
  matchType: "key" | "value" | "attribute";
}

export function searchTree(root: TreeNode, query: string, max = 200): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hits: SearchHit[] = [];
  function walk(n: TreeNode) {
    if (hits.length >= max) return;
    if (n.key && n.key.toLowerCase().includes(q)) {
      hits.push({ path: n.path, preview: `${n.key}: ${previewScalar(n)}`, matchType: "key" });
    }
    if (n.scalar !== undefined && String(n.scalar).toLowerCase().includes(q)) {
      hits.push({ path: n.path, preview: `${n.key}: ${previewScalar(n)}`, matchType: "value" });
    }
    if (n.attributes) {
      for (const [k, v] of Object.entries(n.attributes)) {
        if (k.toLowerCase().includes(q) || v.toLowerCase().includes(q)) {
          hits.push({ path: n.path, preview: `@${k}="${v}"`, matchType: "attribute" });
        }
      }
    }
    n.children?.forEach(walk);
  }
  walk(root);
  return hits;
}

function previewScalar(n: TreeNode): string {
  if (n.scalar === undefined) return n.kind;
  if (n.kind === "string") return `"${String(n.scalar).slice(0, 80)}${String(n.scalar).length > 80 ? "…" : ""}"`;
  return String(n.scalar);
}

// ── Collapsed-state path resolver ──────────────────────────────────────────

export function nodeAtPath(root: TreeNode, path: string): TreeNode | null {
  if (root.path === path) return root;
  for (const c of root.children ?? []) {
    const found = nodeAtPath(c, path);
    if (found) return found;
  }
  return null;
}

export const SAMPLE_JSON = `{
  "ok": true,
  "result": {
    "user": { "id": 42, "name": "Ada Lovelace", "roles": ["admin", "writer"] },
    "products": [
      { "id": 1, "name": "Toollyz Plus", "price": 9.99 },
      { "id": 2, "name": "Toollyz Pro", "price": 19.99 }
    ],
    "metadata": {
      "request_id": "req_8b9f1a2c",
      "ts": "2026-05-31T14:30:00Z",
      "tags": ["api", "v2"]
    }
  }
}`;

export const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<response status="ok">
  <user id="42">
    <name>Ada Lovelace</name>
    <roles>
      <role>admin</role>
      <role>writer</role>
    </roles>
  </user>
  <products>
    <product id="1">
      <name>Toollyz Plus</name>
      <price currency="USD">9.99</price>
    </product>
    <product id="2">
      <name>Toollyz Pro</name>
      <price currency="USD">19.99</price>
    </product>
  </products>
</response>`;
