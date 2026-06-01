import { ImageResponse } from "next/og";

// Site-wide default Open Graph image. Used when a tool / page doesn't
// override with its own opengraph-image.tsx. Replaces the previously-
// referenced og-default.png which never actually existed (every shared
// link was loading a broken thumbnail).
//
// `dynamic = "force-static"` is required so the route is pre-rendered
// at build time for `output: "export"`.
export const dynamic = "force-static";
export const alt = "Toollyz — 207 privacy-first browser tools, free forever";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000000",
          backgroundImage:
            "radial-gradient(circle at 18% 22%, rgba(99,102,241,0.28) 0%, transparent 50%), radial-gradient(circle at 88% 78%, rgba(236,72,153,0.24) 0%, transparent 55%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, Inter, Helvetica, Arial",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <ToollyzMark size={120} />
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1,
              display: "flex",
            }}
          >
            Toollyz
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: -1.5,
              lineHeight: 1.08,
              maxWidth: 980,
              display: "flex",
            }}
          >
            One platform for every tool you'll need.
          </div>
          <div
            style={{
              fontSize: 30,
              color: "rgba(255,255,255,0.7)",
              maxWidth: 920,
              display: "flex",
            }}
          >
            207 privacy-first browser tools — generators, converters, validators
            and visual builders. No signup, no upload, no tracking.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 24, color: "rgba(255,255,255,0.55)", fontSize: 22 }}>
            <span style={{ display: "flex" }}>No signup</span>
            <span style={{ display: "flex" }}>·</span>
            <span style={{ display: "flex" }}>Privacy-first</span>
            <span style={{ display: "flex" }}>·</span>
            <span style={{ display: "flex" }}>Free forever</span>
          </div>
          <div
            style={{
              fontSize: 22,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              color: "rgba(255,255,255,0.45)",
              display: "flex",
            }}
          >
            toollyz · 207 tools
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

/**
 * Inline copy of the Toollyz brand mark — the same path data backing
 * `components/shared/logo.tsx` (`ToollyzMark`) and `app/icon.svg`.
 * Satori (ImageResponse) renders SVG directly, so we drop it in raw.
 */
function ToollyzMark({ size: s }: { size: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 100 100">
      <defs>
        <linearGradient id="og-mark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f6dc7e" />
          <stop offset="45%" stopColor="#d6a945" />
          <stop offset="100%" stopColor="#6b4f1f" />
        </linearGradient>
      </defs>
      <rect width={100} height={100} rx={22} fill="#000000" />
      <g fill="url(#og-mark)">
        <path d="M10 12 L76 12 L90 26 L90 52 L66 52 L66 32 L10 32 Z" />
        <path d="M90 88 L24 88 L10 74 L10 48 L34 48 L34 68 L90 68 Z" />
      </g>
    </svg>
  );
}
