// DMARC Record Checker engine. Parses a DMARC TXT record value into its
// semicolon-separated tags and validates against RFC 7489.
//
// Required:
//   v       must be "DMARC1"
//   p       policy on the From: domain ("none" | "quarantine" | "reject")
// Optional:
//   sp      subdomain policy (defaults to p)
//   adkim   DKIM alignment ("r" relaxed default | "s" strict)
//   aspf    SPF alignment ("r" relaxed default | "s" strict)
//   pct     percent of mail to apply policy to (0-100, default 100)
//   fo      forensic options (0/1/d/s separated by ':')
//   rf      forensic format ("afrf" default | "iodef")
//   ri      aggregate report interval seconds (default 86400 = 1 day)
//   rua     aggregate report URIs (csv mailto:/https:)
//   ruf     forensic report URIs

export interface DmarcTag {
  name: string;
  value: string;
}
export interface DmarcIssue {
  severity: "error" | "warning" | "info";
  message: string;
}

export interface DmarcReport {
  raw: string;
  tags: DmarcTag[];
  version?: string;
  policy?: "none" | "quarantine" | "reject";
  subdomainPolicy?: "none" | "quarantine" | "reject";
  adkim: "r" | "s";
  aspf: "r" | "s";
  pct: number;
  ruaUris: string[];
  rufUris: string[];
  reportInterval: number;
  forensicOptions: string[];
  forensicFormat: string;
  issues: DmarcIssue[];
  score: {
    /** 0-100. */
    value: number;
    label: string;
  };
}

const POLICIES = new Set(["none", "quarantine", "reject"]);

export function parse(text: string): DmarcReport {
  const raw = text
    .replace(/[\s\n\r]+/g, " ")
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/"\s+"/g, "");
  const issues: DmarcIssue[] = [];
  const tags: DmarcTag[] = [];
  let version: string | undefined;
  let policy: DmarcReport["policy"];
  let subdomainPolicy: DmarcReport["subdomainPolicy"];
  let adkim: "r" | "s" = "r";
  let aspf: "r" | "s" = "r";
  let pct = 100;
  const ruaUris: string[] = [];
  const rufUris: string[] = [];
  let reportInterval = 86400;
  let forensicOptions: string[] = ["0"];
  let forensicFormat = "afrf";

  if (!raw) {
    issues.push({ severity: "error", message: "Empty record — paste the DMARC TXT value." });
    return blank(raw, issues);
  }

  for (const part of raw.split(/\s*;\s*/)) {
    if (!part.trim()) continue;
    const eq = part.indexOf("=");
    if (eq === -1) {
      issues.push({ severity: "warning", message: `Tag without value: '${part}'.` });
      continue;
    }
    const name = part.slice(0, eq).trim().toLowerCase();
    const value = part.slice(eq + 1).trim();
    tags.push({ name, value });
    switch (name) {
      case "v":
        version = value;
        break;
      case "p":
        if (POLICIES.has(value.toLowerCase())) policy = value.toLowerCase() as DmarcReport["policy"];
        else issues.push({ severity: "error", message: `p='${value}' is invalid — must be none, quarantine or reject.` });
        break;
      case "sp":
        if (POLICIES.has(value.toLowerCase())) subdomainPolicy = value.toLowerCase() as DmarcReport["subdomainPolicy"];
        else issues.push({ severity: "warning", message: `sp='${value}' is invalid — must be none, quarantine or reject.` });
        break;
      case "adkim":
        if (value === "r" || value === "s") adkim = value;
        else issues.push({ severity: "warning", message: `adkim='${value}' is invalid — must be r or s.` });
        break;
      case "aspf":
        if (value === "r" || value === "s") aspf = value;
        else issues.push({ severity: "warning", message: `aspf='${value}' is invalid — must be r or s.` });
        break;
      case "pct": {
        const n = parseInt(value, 10);
        if (!Number.isFinite(n) || n < 0 || n > 100) {
          issues.push({ severity: "warning", message: `pct='${value}' is invalid — must be 0-100.` });
        } else {
          pct = n;
        }
        break;
      }
      case "ri": {
        const n = parseInt(value, 10);
        if (!Number.isFinite(n) || n < 0) issues.push({ severity: "warning", message: `ri='${value}' is invalid.` });
        else reportInterval = n;
        break;
      }
      case "rua":
        for (const uri of value.split(",").map((s) => s.trim()).filter(Boolean)) {
          if (!/^mailto:|^https?:/i.test(uri)) {
            issues.push({ severity: "warning", message: `rua URI '${uri}' must start with mailto: or https://.` });
          }
          ruaUris.push(uri);
        }
        break;
      case "ruf":
        for (const uri of value.split(",").map((s) => s.trim()).filter(Boolean)) {
          if (!/^mailto:|^https?:/i.test(uri)) {
            issues.push({ severity: "warning", message: `ruf URI '${uri}' must start with mailto: or https://.` });
          }
          rufUris.push(uri);
        }
        break;
      case "fo":
        forensicOptions = value.split(":").map((s) => s.trim());
        break;
      case "rf":
        forensicFormat = value.toLowerCase();
        break;
      default:
        issues.push({ severity: "info", message: `Unrecognised tag '${name}' — DMARC ignores it.` });
    }
  }

  if (!version) issues.push({ severity: "error", message: "Missing v=DMARC1 — every DMARC record must start with the version tag." });
  else if (version !== "DMARC1") issues.push({ severity: "error", message: `v='${version}' is invalid — only DMARC1 is defined.` });
  if (!policy) issues.push({ severity: "error", message: "Missing p= — required policy tag." });

  if (policy === "none") {
    issues.push({ severity: "warning", message: "p=none — monitoring mode only. No filtering action taken; consider quarantine or reject once aggregate reports look clean." });
  }
  if (policy === "quarantine") {
    issues.push({ severity: "info", message: "p=quarantine — failing mail goes to spam." });
  }
  if (policy === "reject") {
    issues.push({ severity: "info", message: "p=reject — failing mail is bounced. This is the strongest stance once you trust your alignment." });
  }
  if (pct < 100 && policy && policy !== "none") {
    issues.push({ severity: "info", message: `pct=${pct} — only ${pct}% of failing mail is subjected to ${policy}. Useful during ramp-up.` });
  }
  if (ruaUris.length === 0) {
    issues.push({ severity: "warning", message: "No rua= — aggregate reports won't be sent anywhere. Add a mailto: address to monitor authentication health." });
  } else if (ruaUris.length > 2) {
    issues.push({ severity: "info", message: `${ruaUris.length} rua URIs — most receivers cap at 2.` });
  }
  if (rufUris.length === 0 && policy !== "none") {
    issues.push({ severity: "info", message: "No ruf= — forensic reports won't be sent. Many receivers don't send them anyway due to PII concerns." });
  }

  // Score (out of 100). Weighted: policy strength + reporting + alignment + best practice.
  let score = 0;
  if (version === "DMARC1") score += 10;
  if (policy === "reject") score += 35;
  else if (policy === "quarantine") score += 25;
  else if (policy === "none") score += 5;
  if (subdomainPolicy === "reject") score += 5;
  else if (subdomainPolicy === "quarantine") score += 3;
  if (ruaUris.length > 0) score += 15;
  if (rufUris.length > 0) score += 5;
  if (adkim === "s") score += 5;
  else score += 2;
  if (aspf === "s") score += 5;
  else score += 2;
  if (pct === 100 && policy && policy !== "none") score += 10;
  score = Math.min(100, score);

  const label =
    score >= 90 ? "Excellent" : score >= 70 ? "Strong" : score >= 50 ? "Moderate" : score >= 25 ? "Weak" : "Missing";

  return {
    raw,
    tags,
    version,
    policy,
    subdomainPolicy,
    adkim,
    aspf,
    pct,
    ruaUris,
    rufUris,
    reportInterval,
    forensicOptions,
    forensicFormat,
    issues,
    score: { value: score, label },
  };
}

function blank(raw: string, issues: DmarcIssue[]): DmarcReport {
  return {
    raw,
    tags: [],
    adkim: "r",
    aspf: "r",
    pct: 100,
    ruaUris: [],
    rufUris: [],
    reportInterval: 86400,
    forensicOptions: ["0"],
    forensicFormat: "afrf",
    issues,
    score: { value: 0, label: "Missing" },
  };
}

export const SAMPLE_DMARC = `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s; pct=100; rua=mailto:dmarc-reports@toollyz.com; ruf=mailto:dmarc-forensic@toollyz.com; fo=1`;
