// YouTube Timestamp Link Generator engine. Parses any YouTube URL or raw
// video ID, then composes timestamped variants — either a single
// "go to second X" link, or a chapter-style markdown list.

export interface ParsedVideo {
  /** 11-char video ID, or empty when input couldn't be parsed. */
  id: string;
  /** Channel handle / playlist ID, if present in the input. */
  playlist: string;
  /** Original input as supplied — used for round-trip preview. */
  raw: string;
}

const ID_RE = /^[A-Za-z0-9_-]{11}$/;
const ID_FROM_URL_RES: RegExp[] = [
  // youtu.be/<id>
  /^https?:\/\/youtu\.be\/([A-Za-z0-9_-]{11})/i,
  // youtube.com/watch?v=<id>
  /[?&]v=([A-Za-z0-9_-]{11})/,
  // youtube.com/embed/<id>
  /\/embed\/([A-Za-z0-9_-]{11})/,
  // youtube.com/shorts/<id>
  /\/shorts\/([A-Za-z0-9_-]{11})/,
  // youtube.com/v/<id>
  /\/v\/([A-Za-z0-9_-]{11})/,
];

export function parseVideo(input: string): ParsedVideo {
  const trimmed = input.trim();
  if (!trimmed) return { id: "", playlist: "", raw: "" };
  if (ID_RE.test(trimmed)) return { id: trimmed, playlist: "", raw: trimmed };
  for (const re of ID_FROM_URL_RES) {
    const m = re.exec(trimmed);
    if (m) {
      const playlistMatch = /[?&]list=([A-Za-z0-9_-]+)/.exec(trimmed);
      return { id: m[1], playlist: playlistMatch?.[1] ?? "", raw: trimmed };
    }
  }
  return { id: "", playlist: "", raw: trimmed };
}

/**
 * Parse a "1:23", "1:23:45", or "75s" / "75" timestamp into total seconds.
 * Returns NaN when unparseable.
 */
export function parseTimestamp(input: string): number {
  const t = input.trim().toLowerCase();
  if (!t) return NaN;
  // Pure seconds (with or without trailing 's')
  const secMatch = /^(\d+)(?:s|$)/.exec(t);
  if (secMatch && !t.includes(":") && !t.includes("m") && !t.includes("h")) {
    return Number(secMatch[1]);
  }
  // h:m:s or m:s
  if (/^\d+:\d{1,2}(?::\d{1,2})?$/.test(t)) {
    const parts = t.split(":").map((p) => parseInt(p, 10));
    if (parts.some((p) => Number.isNaN(p))) return NaN;
    if (parts.length === 2) {
      const [m, s] = parts;
      if (s >= 60) return NaN;
      return m * 60 + s;
    }
    const [h, m, s] = parts;
    if (m >= 60 || s >= 60) return NaN;
    return h * 3600 + m * 60 + s;
  }
  // Compound: "1h2m3s", "2m30s", "45s"
  const compound = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(t);
  if (compound && (compound[1] || compound[2] || compound[3])) {
    const h = parseInt(compound[1] ?? "0", 10);
    const m = parseInt(compound[2] ?? "0", 10);
    const s = parseInt(compound[3] ?? "0", 10);
    return h * 3600 + m * 60 + s;
  }
  return NaN;
}

/** Format seconds as the canonical "h:mm:ss" or "m:ss" display string. */
export function formatTimestamp(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export type LinkStyle =
  | "full"        // https://www.youtube.com/watch?v=ID&t=Xs
  | "short"       // https://youtu.be/ID?t=X
  | "embed"       // https://www.youtube.com/embed/ID?start=X
  | "markdown";   // [m:ss](https://...)

export interface BuildLinkOptions {
  style: LinkStyle;
  /** Include &list=… when the parsed playlist exists. */
  preservePlaylist: boolean;
}

export const DEFAULT_LINK_OPTIONS: BuildLinkOptions = {
  style: "short",
  preservePlaylist: true,
};

export function buildLink(video: ParsedVideo, seconds: number, opt: BuildLinkOptions = DEFAULT_LINK_OPTIONS): string {
  if (!video.id) return "";
  const s = Math.max(0, Math.floor(seconds));
  const list = opt.preservePlaylist && video.playlist ? `&list=${video.playlist}` : "";
  switch (opt.style) {
    case "short":
      return `https://youtu.be/${video.id}?t=${s}${list ? `&list=${video.playlist}` : ""}`;
    case "embed":
      return `https://www.youtube.com/embed/${video.id}?start=${s}${list ? `&list=${video.playlist}` : ""}`;
    case "markdown":
      return `[${formatTimestamp(s)}](https://youtu.be/${video.id}?t=${s})`;
    case "full":
    default:
      return `https://www.youtube.com/watch?v=${video.id}&t=${s}s${list}`;
  }
}

export interface Chapter {
  id: string;
  /** Free-text label users supply for this chapter. */
  label: string;
  /** Seconds offset; NaN when the user's input couldn't be parsed. */
  seconds: number;
}

export function newChapter(label = ""): Chapter {
  return {
    id: Math.random().toString(36).slice(2, 8),
    label,
    seconds: 0,
  };
}

export interface ChaptersOutput {
  /** YouTube's chaptering rule: first timestamp must be 0:00. */
  meetsYouTubeRules: boolean;
  /** Issues the user should fix (each as a human-readable sentence). */
  issues: string[];
  /** Plain text — one chapter per line, "mm:ss Label". */
  text: string;
  /** Same content as a Markdown list of links. */
  markdown: string;
}

export function buildChapters(video: ParsedVideo, chapters: Chapter[]): ChaptersOutput {
  const sorted = [...chapters].sort((a, b) => a.seconds - b.seconds);
  const issues: string[] = [];
  if (!video.id) issues.push("Enter a YouTube URL or 11-character video ID first.");
  if (sorted.length < 3) issues.push("YouTube needs at least three chapters before they show up in the player.");
  if (sorted.length > 0 && sorted[0].seconds !== 0) issues.push("The first chapter must start at 0:00.");
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].seconds - sorted[i - 1].seconds < 10) {
      issues.push(`Each chapter must be at least 10 seconds long (between “${sorted[i - 1].label || "?"}” and “${sorted[i].label || "?"}”).`);
      break;
    }
  }

  const textLines = sorted
    .filter((c) => Number.isFinite(c.seconds))
    .map((c) => `${formatTimestamp(c.seconds)} ${c.label || "(no label)"}`);
  const mdLines = video.id
    ? sorted
        .filter((c) => Number.isFinite(c.seconds))
        .map((c) =>
          `- [${formatTimestamp(c.seconds)} ${c.label || ""}](${buildLink(video, c.seconds, { style: "short", preservePlaylist: true })})`,
        )
    : [];

  return {
    meetsYouTubeRules: issues.length === 0,
    issues,
    text: textLines.join("\n"),
    markdown: mdLines.join("\n"),
  };
}
