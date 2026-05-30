// Email-signature engine for the Toollyz Email Signature Generator. Builds
// table-based HTML with fully inline styles for maximum email-client
// compatibility (Outlook, Apple Mail, Gmail, Yahoo). Pure functions.

export interface SignatureInput {
  // Identity
  fullName: string;
  pronouns: string;
  jobTitle: string;
  company: string;
  // Contact
  email: string;
  phone: string;
  website: string;
  address: string;
  // Photo
  photoUrl: string;
  photoRound: boolean;
  // Brand
  brandColor: string;
  // Social links
  linkedin: string;
  twitter: string;
  github: string;
  instagram: string;
  youtube: string;
  // Disclaimer (optional)
  disclaimer: string;
}

export const DEFAULT_INPUT: SignatureInput = {
  fullName: "Jordan Reyes",
  pronouns: "they/them",
  jobTitle: "Senior Product Designer",
  company: "Lumen Studio",
  email: "jordan@lumen.studio",
  phone: "+1 (555) 123-4567",
  website: "lumen.studio",
  address: "Brooklyn, NY",
  photoUrl: "https://avatars.githubusercontent.com/u/1?s=120",
  photoRound: true,
  brandColor: "#6366F1",
  linkedin: "https://linkedin.com/in/jordan-reyes",
  twitter: "https://x.com/jordanreyes",
  github: "https://github.com/jordanreyes",
  instagram: "",
  youtube: "",
  disclaimer: "",
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

function ensureProtocolEmail(email: string): string {
  if (!email) return "";
  return /^mailto:/i.test(email) ? email : `mailto:${email}`;
}

function ensureProtocolPhone(phone: string): string {
  if (!phone) return "";
  return /^tel:/i.test(phone) ? phone : `tel:${phone.replace(/\s+/g, "")}`;
}

interface SocialDef {
  name: string;
  url: string;
  /** 24×24 SVG inline. */
  svg: string;
}

function socialIcons(input: SignatureInput, brand: string): SocialDef[] {
  const fill = brand;
  const out: SocialDef[] = [];
  if (input.linkedin.trim()) {
    out.push({
      name: "LinkedIn",
      url: ensureUrl(input.linkedin),
      svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.23 0H1.77C.79 0 0 .78 0 1.73v20.54C0 23.22.79 24 1.77 24h20.46c.98 0 1.77-.78 1.77-1.73V1.73C24 .78 23.21 0 22.23 0Z" /></svg>`,
    });
  }
  if (input.twitter.trim()) {
    out.push({
      name: "X / Twitter",
      url: ensureUrl(input.twitter),
      svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M17.53 3H21l-7.39 8.45L22.5 21h-6.77l-5.3-6.94L4.27 21H.8l7.9-9.04L1.5 3h6.93l4.79 6.34L17.53 3Zm-1.19 16h1.92L7.74 5h-2L16.34 19Z"/></svg>`,
    });
  }
  if (input.github.trim()) {
    out.push({
      name: "GitHub",
      url: ensureUrl(input.github),
      svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.31-1.27-1.66-1.27-1.66-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.35.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.75.11 3.04.73.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.26 5.65.41.35.78 1.04.78 2.11v3.12c0 .31.21.66.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/></svg>`,
    });
  }
  if (input.instagram.trim()) {
    out.push({
      name: "Instagram",
      url: ensureUrl(input.instagram),
      svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.06 1.8.25 2.23.42.55.2.95.45 1.37.87.42.42.66.82.87 1.37.16.42.36 1.06.42 2.23.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.06 1.17-.25 1.8-.42 2.23-.2.55-.45.95-.87 1.37-.42.42-.82.66-1.37.87-.43.16-1.06.36-2.23.42-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-1.17-.06-1.8-.25-2.23-.42-.55-.2-.95-.45-1.37-.87-.42-.42-.66-.82-.87-1.37-.16-.43-.36-1.06-.42-2.23C2.18 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.06-1.17.25-1.8.42-2.23.2-.55.45-.95.87-1.37.42-.42.82-.66 1.37-.87.43-.16 1.06-.36 2.23-.42C8.42 2.17 8.8 2.16 12 2.16Zm0 1.95c-3.15 0-3.5.01-4.74.07-1.07.05-1.65.23-2.04.38-.51.2-.88.44-1.27.83-.39.39-.62.76-.83 1.27-.15.39-.33.97-.38 2.04C2.68 9.94 2.66 10.3 2.66 13s.02 3.06.08 4.3c.05 1.07.23 1.65.38 2.04.2.51.44.88.83 1.27.39.39.76.62 1.27.83.39.15.97.33 2.04.38 1.24.06 1.6.07 4.74.07s3.5-.01 4.74-.07c1.07-.05 1.65-.23 2.04-.38.51-.2.88-.44 1.27-.83.39-.39.62-.76.83-1.27.15-.39.33-.97.38-2.04.06-1.24.07-1.6.07-4.3s-.01-3.06-.07-4.3c-.05-1.07-.23-1.65-.38-2.04-.2-.51-.44-.88-.83-1.27-.39-.39-.76-.62-1.27-.83-.39-.15-.97-.33-2.04-.38-1.24-.06-1.6-.07-4.74-.07Zm0 3.6a4.79 4.79 0 1 1 0 9.58 4.79 4.79 0 0 1 0-9.58Zm0 1.95a2.84 2.84 0 1 0 0 5.68 2.84 2.84 0 0 0 0-5.68Zm5.05-2.27a1.12 1.12 0 1 1 0 2.24 1.12 1.12 0 0 1 0-2.24Z"/></svg>`,
    });
  }
  if (input.youtube.trim()) {
    out.push({
      name: "YouTube",
      url: ensureUrl(input.youtube),
      svg: `<svg width="20" height="20" viewBox="0 0 24 24" fill="${fill}" xmlns="http://www.w3.org/2000/svg"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.13C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.57A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.13C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.57a3 3 0 0 0 2.1-2.13C24 15.9 24 12 24 12s0-3.9-.5-5.8ZM9.6 15.5V8.5l6.4 3.5-6.4 3.5Z"/></svg>`,
    });
  }
  return out;
}

/** Render the full signature as a single HTML string with inline styles. */
export function renderHtml(input: SignatureInput): string {
  const brand = input.brandColor || "#000000";
  const text = "#1f2937";
  const muted = "#6b7280";
  const border = "#e5e7eb";

  const websiteUrl = ensureUrl(input.website);
  const websiteText = input.website.replace(/^https?:\/\//i, "");

  const mainTd: string[] = [];

  if (input.fullName.trim()) {
    const pron = input.pronouns.trim() ? ` <span style="color:${muted};font-weight:400;font-size:13px"> · ${escapeHtml(input.pronouns)}</span>` : "";
    mainTd.push(`<div style="font:600 17px/1.3 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${text};margin:0">${escapeHtml(input.fullName)}${pron}</div>`);
  }
  if (input.jobTitle.trim() || input.company.trim()) {
    const role = [input.jobTitle, input.company].map((s) => s.trim()).filter(Boolean).map(escapeHtml).join(" · ");
    mainTd.push(`<div style="font:400 13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${muted};margin:4px 0 8px">${role}</div>`);
  }
  const contactRows: string[] = [];
  if (input.email.trim()) {
    contactRows.push(`<a href="${escapeHtml(ensureProtocolEmail(input.email))}" style="color:${brand};text-decoration:none">${escapeHtml(input.email)}</a>`);
  }
  if (input.phone.trim()) {
    contactRows.push(`<a href="${escapeHtml(ensureProtocolPhone(input.phone))}" style="color:${text};text-decoration:none">${escapeHtml(input.phone)}</a>`);
  }
  if (websiteUrl) {
    contactRows.push(`<a href="${escapeHtml(websiteUrl)}" style="color:${brand};text-decoration:none">${escapeHtml(websiteText)}</a>`);
  }
  if (input.address.trim()) {
    contactRows.push(`<span style="color:${muted}">${escapeHtml(input.address)}</span>`);
  }
  if (contactRows.length > 0) {
    mainTd.push(
      `<div style="font:400 13px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">${contactRows.join(`<span style="color:${border}; padding:0 6px">·</span>`)}</div>`,
    );
  }
  const social = socialIcons(input, brand);
  if (social.length > 0) {
    const iconCells = social
      .map(
        (s) =>
          `<a href="${escapeHtml(s.url)}" title="${escapeHtml(s.name)}" style="display:inline-block;margin:8px 8px 0 0;text-decoration:none">${s.svg}</a>`,
      )
      .join("");
    mainTd.push(`<div>${iconCells}</div>`);
  }

  const photoTd = input.photoUrl.trim()
    ? `<td valign="top" style="padding:0 16px 0 0">
        <img src="${escapeHtml(input.photoUrl)}" width="80" height="80" alt="${escapeHtml(input.fullName || "Avatar")}" style="display:block;border:0;width:80px;height:80px;${input.photoRound ? "border-radius:9999px;" : "border-radius:6px;"}object-fit:cover" />
      </td>`
    : "";

  const accent = `<div style="height:3px;background:${brand};width:48px;margin-bottom:12px;border-radius:2px"></div>`;

  const tableHtml = `
<table cellspacing="0" cellpadding="0" border="0" role="presentation" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${text};max-width:520px">
  <tr>${photoTd}<td valign="top">${accent}${mainTd.join("")}</td></tr>
</table>`.trim();

  const disclaimerHtml = input.disclaimer.trim()
    ? `<div style="font:400 11px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${muted};margin-top:12px;max-width:520px">${escapeHtml(input.disclaimer)}</div>`
    : "";

  return `<!-- Toollyz email signature -->
${tableHtml}
${disclaimerHtml}`.trim();
}
