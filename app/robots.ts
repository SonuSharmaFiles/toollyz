import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo/constants";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  // Minimal, Google-friendly robots:
  // - We're a static export (`output: "export"`) so there is no `/api/`
  //   path to disallow. Dropping the dead Disallow keeps the file clean.
  // - The `Host:` directive is Yandex-specific and Google explicitly
  //   ignores it; the canonical host lives in the canonical <link>
  //   tags and in the sitemap URL below.
  // - `_next/` is intentionally NOT disallowed — Google needs to fetch
  //   our CSS/JS to render the pages for indexing.
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${base}/sitemap.xml`,
  };
}
