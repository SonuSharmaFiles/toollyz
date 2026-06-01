import { ImageResponse } from "next/og";
import { getToolBySlug, tools } from "@/lib/tools/registry";
import { getCategoryById } from "@/lib/tools/categories";

// Per-tool Open Graph image. Pre-rendered for every live tool at build
// time, so each shared link gets a distinct social card with the tool's
// name, tagline and category badge instead of the same generic site
// image. Required for `output: "export"`.
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mirror the parent route's static-params so Next pre-renders one OG
// image per tool slug. Without this the route would fail to enumerate
// in static export mode.
export async function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export default async function ToolOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) {
    // Fall back to a minimal card; should not happen since the route's
    // static params include every live slug.
    return new ImageResponse(
      <div style={{ display: "flex", background: "#000", color: "#fff" }}>Toollyz</div>,
      { ...size },
    );
  }
  const category = getCategoryById(tool.categoryId);
  const categoryLabel = category?.name ?? "Toollyz";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000000",
          backgroundImage:
            "radial-gradient(circle at 14% 18%, rgba(99,102,241,0.30) 0%, transparent 48%), radial-gradient(circle at 92% 82%, rgba(236,72,153,0.22) 0%, transparent 52%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, Inter, Helvetica, Arial",
        }}
      >
        {/* Header: brand mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <ToollyzMark size={88} />
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              letterSpacing: -1.2,
              lineHeight: 1,
              display: "flex",
            }}
          >
            Toollyz
          </div>
          <div style={{ flexGrow: 1, display: "flex" }} />
          <div
            style={{
              padding: "8px 18px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.85)",
              fontSize: 22,
              fontWeight: 500,
              letterSpacing: 0.3,
              display: "flex",
            }}
          >
            {categoryLabel}
          </div>
        </div>

        {/* Tool name + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: tool.name.length > 28 ? 78 : 96,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.04,
              maxWidth: 1040,
              display: "flex",
            }}
          >
            {tool.name}
          </div>
          <div
            style={{
              fontSize: 32,
              color: "rgba(255,255,255,0.75)",
              maxWidth: 1040,
              lineHeight: 1.3,
              display: "flex",
            }}
          >
            {tool.tagline}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "rgba(255,255,255,0.5)",
            fontSize: 22,
          }}
        >
          <div style={{ display: "flex", gap: 18 }}>
            <span style={{ display: "flex" }}>No signup</span>
            <span style={{ display: "flex" }}>·</span>
            <span style={{ display: "flex" }}>Runs in your browser</span>
            <span style={{ display: "flex" }}>·</span>
            <span style={{ display: "flex" }}>Free forever</span>
          </div>
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              color: "rgba(255,255,255,0.4)",
              display: "flex",
            }}
          >
            toollyz.com/{tool.slug}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

/**
 * Inline copy of the Toollyz brand mark. Same path data as
 * `components/shared/logo.tsx` and `app/icon.svg`.
 */
function ToollyzMark({ size: s }: { size: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="og-tool-mark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f6dc7e" />
          <stop offset="45%" stopColor="#d6a945" />
          <stop offset="100%" stopColor="#6b4f1f" />
        </linearGradient>
      </defs>
      <rect width={100} height={100} rx={22} fill="#000000" />
      <g fill="url(#og-tool-mark)">
        <path d="M10 12 L76 12 L90 26 L90 52 L66 52 L66 32 L10 32 Z" />
        <path d="M90 88 L24 88 L10 74 L10 48 L34 48 L34 68 L90 68 Z" />
      </g>
    </svg>
  );
}
