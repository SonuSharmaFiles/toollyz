// Digital business-card HTML generator. Renders a standalone, mobile-friendly
// HTML page that the user can host anywhere and link from a QR code. Uses
// inline CSS only — no external stylesheets — so it works as a shareable file
// even without a hosting service. Embeds the vCard as a data:URL so the
// page's "Save contact" button downloads the .vcf directly.

import { buildVcard, type VCardInput } from "./vcard";

export interface BusinessCardInput extends VCardInput {
  /** Short tagline shown under the name. */
  bio: string;
  /** Primary brand color (used for the accent bar and link color). */
  brandColor: string;
  /** Background color of the page outside the card. */
  pageBackground: string;
  linkedin: string;
  twitter: string;
  github: string;
  instagram: string;
  youtube: string;
}

export const DEFAULT_BUSINESS_CARD: BusinessCardInput = {
  firstName: "Jordan",
  lastName: "Reyes",
  middleName: "",
  prefix: "",
  suffix: "",
  nickname: "",
  organization: "Lumen Studio",
  title: "Senior Product Designer",
  department: "",
  phones: [{ type: "CELL", value: "+1 (555) 123-4567" }],
  emails: [{ type: "WORK", value: "jordan@lumen.studio" }],
  websites: [{ type: "WORK", value: "https://lumen.studio" }],
  addresses: [],
  birthday: "",
  note: "",
  photoUrl: "https://avatars.githubusercontent.com/u/1?s=240",
  bio: "Designer and prototyper helping early-stage teams ship products people love.",
  brandColor: "#6366F1",
  pageBackground: "#0b1020",
  linkedin: "https://linkedin.com/in/jordan-reyes",
  twitter: "https://x.com/jordanreyes",
  github: "https://github.com/jordanreyes",
  instagram: "",
  youtube: "",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function ensureUrl(s: string): string {
  const t = s.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (/^mailto:|^tel:/i.test(t)) return t;
  return `https://${t}`;
}

interface SocialLink { url: string; label: string; svg: string }

function socialLinks(input: BusinessCardInput, brand: string): SocialLink[] {
  const out: SocialLink[] = [];
  if (input.linkedin.trim()) {
    out.push({
      url: ensureUrl(input.linkedin),
      label: "LinkedIn",
      svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="${brand}" xmlns="http://www.w3.org/2000/svg"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.23 0H1.77C.79 0 0 .78 0 1.73v20.54C0 23.22.79 24 1.77 24h20.46c.98 0 1.77-.78 1.77-1.73V1.73C24 .78 23.21 0 22.23 0Z"/></svg>`,
    });
  }
  if (input.twitter.trim()) {
    out.push({
      url: ensureUrl(input.twitter),
      label: "X",
      svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="${brand}" xmlns="http://www.w3.org/2000/svg"><path d="M17.53 3H21l-7.39 8.45L22.5 21h-6.77l-5.3-6.94L4.27 21H.8l7.9-9.04L1.5 3h6.93l4.79 6.34L17.53 3Zm-1.19 16h1.92L7.74 5h-2L16.34 19Z"/></svg>`,
    });
  }
  if (input.github.trim()) {
    out.push({
      url: ensureUrl(input.github),
      label: "GitHub",
      svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="${brand}" xmlns="http://www.w3.org/2000/svg"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.26 5.65.41.35.78 1.04.78 2.11v3.12c0 .31.21.66.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>`,
    });
  }
  if (input.instagram.trim()) {
    out.push({
      url: ensureUrl(input.instagram),
      label: "Instagram",
      svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="${brand}" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.06 1.8.25 2.23.42.55.2.95.45 1.37.87.42.42.66.82.87 1.37.16.42.36 1.06.42 2.23.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.06 1.17-.25 1.8-.42 2.23-.2.55-.45.95-.87 1.37-.42.42-.82.66-1.37.87-.43.16-1.06.36-2.23.42-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-1.17-.06-1.8-.25-2.23-.42-.55-.2-.95-.45-1.37-.87-.42-.42-.66-.82-.87-1.37-.16-.43-.36-1.06-.42-2.23C2.18 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.06-1.17.25-1.8.42-2.23.2-.55.45-.95.87-1.37.42-.42.82-.66 1.37-.87.43-.16 1.06-.36 2.23-.42C8.42 2.17 8.8 2.16 12 2.16Zm0 1.95c-3.15 0-3.5.01-4.74.07-1.07.05-1.65.23-2.04.38-.51.2-.88.44-1.27.83-.39.39-.62.76-.83 1.27-.15.39-.33.97-.38 2.04C2.68 9.94 2.66 10.3 2.66 13s.02 3.06.08 4.3c.05 1.07.23 1.65.38 2.04.2.51.44.88.83 1.27.39.39.76.62 1.27.83.39.15.97.33 2.04.38 1.24.06 1.6.07 4.74.07s3.5-.01 4.74-.07c1.07-.05 1.65-.23 2.04-.38.51-.2.88-.44 1.27-.83.39-.39.62-.76.83-1.27.15-.39.33-.97.38-2.04.06-1.24.07-1.6.07-4.3s-.01-3.06-.07-4.3c-.05-1.07-.23-1.65-.38-2.04-.2-.51-.44-.88-.83-1.27-.39-.39-.76-.62-1.27-.83-.39-.15-.97-.33-2.04-.38-1.24-.06-1.6-.07-4.74-.07Zm0 3.6a4.79 4.79 0 1 1 0 9.58 4.79 4.79 0 0 1 0-9.58Zm0 1.95a2.84 2.84 0 1 0 0 5.68 2.84 2.84 0 0 0 0-5.68Zm5.05-2.27a1.12 1.12 0 1 1 0 2.24 1.12 1.12 0 0 1 0-2.24Z"/></svg>`,
    });
  }
  if (input.youtube.trim()) {
    out.push({
      url: ensureUrl(input.youtube),
      label: "YouTube",
      svg: `<svg width="22" height="22" viewBox="0 0 24 24" fill="${brand}" xmlns="http://www.w3.org/2000/svg"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.13C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.57A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.13C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.57a3 3 0 0 0 2.1-2.13C24 15.9 24 12 24 12s0-3.9-.5-5.8ZM9.6 15.5V8.5l6.4 3.5-6.4 3.5Z"/></svg>`,
    });
  }
  return out;
}

export function buildBusinessCardHtml(input: BusinessCardInput): string {
  const brand = input.brandColor || "#6366F1";
  const bg = input.pageBackground || "#0b1020";
  const name = [input.prefix, input.firstName, input.middleName, input.lastName, input.suffix].filter((s) => s.trim()).join(" ").trim();
  const subline = [input.title, input.organization].filter(Boolean).join(" · ");
  const vcfText = buildVcard(input);
  const vcfDataUrl = `data:text/vcard;charset=utf-8;base64,${typeof window === "undefined" ? "" : btoa(unescape(encodeURIComponent(vcfText)))}`;
  const phone = input.phones[0]?.value ?? "";
  const email = input.emails[0]?.value ?? "";
  const website = input.websites[0]?.value ?? "";

  const social = socialLinks(input, brand);
  const socialHtml = social
    .map((s) => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(s.label)}" style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:9999px;background:rgba(255,255,255,.06);text-decoration:none;margin:6px">${s.svg}</a>`)
    .join("");

  const fileName = [input.firstName, input.lastName].map((p) => p.trim().toLowerCase().replace(/[^a-z0-9]/g, "-")).filter(Boolean).join("-") || "contact";

  const photoHtml = input.photoUrl.trim()
    ? `<img src="${escapeHtml(input.photoUrl)}" alt="${escapeHtml(name)}" style="display:block;width:120px;height:120px;border-radius:9999px;object-fit:cover;border:3px solid ${brand};margin:0 auto 18px" />`
    : `<div style="width:120px;height:120px;border-radius:9999px;background:${brand};margin:0 auto 18px;display:flex;align-items:center;justify-content:center;font:700 40px/1 system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#ffffff">${escapeHtml((input.firstName[0] || "?") + (input.lastName[0] || ""))}</div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(name)} — Digital business card</title>
<style>
  body { margin:0; padding:0; min-height:100vh; background:${bg}; display:flex; align-items:center; justify-content:center; font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif; color:#f8fafc; -webkit-font-smoothing:antialiased; }
  .card { width:100%; max-width:380px; margin:24px; padding:32px 24px; border-radius:22px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); backdrop-filter:blur(10px); box-shadow:0 24px 48px rgba(0,0,0,.35); text-align:center; }
  .accent { height:4px; width:64px; border-radius:2px; background:${brand}; margin:0 auto 18px; }
  .name { font-size:24px; font-weight:700; margin:0 0 6px; }
  .subline { font-size:13px; color:rgba(248,250,252,.7); margin:0 0 18px; }
  .bio { font-size:13px; line-height:1.55; color:rgba(248,250,252,.85); margin:0 0 22px; }
  .contact { display:flex; flex-direction:column; gap:8px; margin-bottom:22px; }
  .contact a { display:block; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,.06); color:#f8fafc; text-decoration:none; font-size:14px; }
  .contact a strong { color:${brand}; }
  .social { display:flex; flex-wrap:wrap; justify-content:center; }
  .cta { display:block; margin-top:18px; padding:12px; border-radius:12px; background:${brand}; color:#ffffff; text-decoration:none; font-weight:600; }
  footer { text-align:center; margin-top:18px; font-size:11px; color:rgba(248,250,252,.5); }
</style>
</head>
<body>
  <main class="card">
    ${photoHtml}
    <div class="accent"></div>
    <h1 class="name">${escapeHtml(name || "Unnamed")}</h1>
    ${subline ? `<div class="subline">${escapeHtml(subline)}</div>` : ""}
    ${input.bio.trim() ? `<p class="bio">${escapeHtml(input.bio)}</p>` : ""}
    <div class="contact">
      ${email ? `<a href="mailto:${escapeHtml(email)}"><strong>Email</strong> · ${escapeHtml(email)}</a>` : ""}
      ${phone ? `<a href="tel:${escapeHtml(phone.replace(/\s+/g, ""))}"><strong>Call</strong> · ${escapeHtml(phone)}</a>` : ""}
      ${website ? `<a href="${escapeHtml(ensureUrl(website))}" target="_blank" rel="noopener noreferrer"><strong>Website</strong> · ${escapeHtml(website.replace(/^https?:\/\//i, ""))}</a>` : ""}
    </div>
    ${social.length > 0 ? `<div class="social">${socialHtml}</div>` : ""}
    <a class="cta" href="${vcfDataUrl}" download="${fileName}.vcf">Save to contacts (.vcf)</a>
    <footer>Made with Toollyz · ${new Date().toISOString().slice(0, 10)}</footer>
  </main>
</body>
</html>`;
}
