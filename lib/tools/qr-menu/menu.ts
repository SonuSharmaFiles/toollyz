// Self-contained HTML menu builder for the Toollyz QR Menu Generator. The
// output is a standalone HTML file (inline CSS, no external assets except
// optional logo URL) that restaurants can host on any static service and
// point a table QR code at.

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  /** Decimal price; rendered via Intl.NumberFormat with the chosen currency. */
  price: number;
  tags: string[];
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export type LogoFrame = "circle" | "none";

export interface MenuInput {
  restaurantName: string;
  tagline: string;
  currency: string;
  brandColor: string;
  pageBackground: string;
  logoUrl: string;
  /** How the logo image is presented. "circle" crops to a 72px circle (good
   * for round brand marks). "none" preserves the natural aspect ratio with
   * a max height of 96px (good for wordmarks and horizontal logos). */
  logoFrame: LogoFrame;
  footer: string;
  sections: MenuSection[];
}

function uid(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function newItem(): MenuItem {
  return { id: uid(), name: "", description: "", price: 0, tags: [] };
}

export function newSection(): MenuSection {
  return { id: uid(), title: "Section", items: [newItem()] };
}

export const DEFAULT_MENU: MenuInput = {
  restaurantName: "Lumen Café",
  tagline: "Slow coffee · garden produce · open daily 7am–4pm",
  currency: "USD",
  brandColor: "#0f766e",
  pageBackground: "#fef7ed",
  logoUrl: "",
  logoFrame: "circle",
  footer: "Made with Toollyz",
  sections: [
    {
      id: "s1",
      title: "Coffee",
      items: [
        { id: "i1", name: "Drip filter", description: "Single-origin Ethiopian Yirgacheffe.", price: 3.5, tags: [] },
        { id: "i2", name: "Flat white", description: "Espresso + steamed whole milk.", price: 4.5, tags: [] },
        { id: "i3", name: "Cold brew", description: "12-hour slow drip; tonic optional.", price: 5, tags: [] },
      ],
    },
    {
      id: "s2",
      title: "Pastries",
      items: [
        { id: "i4", name: "Pain au chocolat", description: "Buttery, layered, made fresh at 5am.", price: 4, tags: [] },
        { id: "i5", name: "Almond croissant", description: "Frangipane filling; toasted almonds.", price: 4.5, tags: ["nut"] },
      ],
    },
    {
      id: "s3",
      title: "Brunch (until 2pm)",
      items: [
        { id: "i6", name: "Avocado toast", description: "Sourdough, chilli oil, pickled radish.", price: 12, tags: ["vegan"] },
        { id: "i7", name: "Eggs benedict", description: "Smoked salmon, hollandaise, dill.", price: 16, tags: [] },
      ],
    },
  ],
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMoney(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(price);
  } catch {
    return `${price.toFixed(2)} ${currency}`;
  }
}

export function buildMenuHtml(menu: MenuInput): string {
  const brand = menu.brandColor || "#0f766e";
  const bg = menu.pageBackground || "#fef7ed";
  const sections = menu.sections
    .filter((s) => s.title.trim() || s.items.length > 0)
    .map((s) => sectionHtml(s, brand, menu.currency))
    .join("");
  const logoStyle = (menu.logoFrame ?? "circle") === "circle"
    // Circular: hard 72×72 crop with object-fit: cover — good for round marks.
    ? "display:block;width:72px;height:72px;border-radius:9999px;object-fit:cover;margin:0 auto 16px"
    // No frame: preserve aspect ratio; max 96px tall, 240px wide; centered.
    : "display:block;max-width:240px;max-height:96px;width:auto;height:auto;object-fit:contain;margin:0 auto 16px";
  const logoHtml = menu.logoUrl.trim()
    ? `<img src="${escapeHtml(menu.logoUrl)}" alt="${escapeHtml(menu.restaurantName || "Logo")}" style="${logoStyle}" />`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(menu.restaurantName || "Menu")}</title>
<style>
  *{box-sizing:border-box}
  html,body{margin:0;padding:0;background:${bg};color:#1f2937;font-family:Georgia,"Iowan Old Style","Times New Roman",serif;-webkit-font-smoothing:antialiased;line-height:1.5}
  .wrap{max-width:680px;margin:0 auto;padding:32px 20px 80px}
  header{text-align:center;margin-bottom:36px;border-bottom:2px solid ${brand}33;padding-bottom:24px}
  .name{font-size:32px;font-weight:700;margin:0;color:${brand};letter-spacing:-0.01em}
  .tagline{font-size:14px;font-style:italic;color:#475569;margin:8px 0 0}
  section{margin-bottom:32px}
  h2{font-size:20px;font-weight:700;color:${brand};margin:0 0 14px;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid ${brand}33;padding-bottom:6px}
  ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:14px}
  li{display:flex;justify-content:space-between;gap:16px;align-items:baseline}
  .item-info{flex:1}
  .item-name{font-weight:600;font-size:16px;margin:0}
  .item-desc{font-size:13px;color:#475569;margin:4px 0 0;font-style:italic}
  .item-tags{margin-top:4px}
  .tag{display:inline-block;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;background:${brand}1a;color:${brand};padding:2px 8px;border-radius:999px;margin-right:4px}
  .price{font-weight:700;font-size:16px;color:${brand};white-space:nowrap;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
  footer{text-align:center;margin-top:48px;font-size:12px;color:#94a3b8}
  @media print{body{background:#fff}.wrap{padding:16px}}
</style>
</head>
<body>
  <main class="wrap">
    <header>
      ${logoHtml}
      <h1 class="name">${escapeHtml(menu.restaurantName || "Menu")}</h1>
      ${menu.tagline.trim() ? `<p class="tagline">${escapeHtml(menu.tagline)}</p>` : ""}
    </header>
    ${sections}
    <footer>${escapeHtml(menu.footer || "Made with Toollyz")} · ${new Date().toISOString().slice(0, 10)}</footer>
  </main>
</body>
</html>`;
}

function sectionHtml(section: MenuSection, brand: string, currency: string): string {
  const items = section.items
    .filter((item) => item.name.trim() || item.description.trim() || item.price > 0)
    .map((item) => itemHtml(item, currency))
    .join("");
  return `<section>
  <h2>${escapeHtml(section.title || "Section")}</h2>
  <ul>${items}</ul>
</section>`;
  void brand;
}

function itemHtml(item: MenuItem, currency: string): string {
  const tags = item.tags.length > 0 ? `<div class="item-tags">${item.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>` : "";
  return `<li>
    <div class="item-info">
      <p class="item-name">${escapeHtml(item.name || "Untitled")}</p>
      ${item.description.trim() ? `<p class="item-desc">${escapeHtml(item.description)}</p>` : ""}
      ${tags}
    </div>
    <span class="price">${escapeHtml(formatMoney(item.price, currency))}</span>
  </li>`;
}
