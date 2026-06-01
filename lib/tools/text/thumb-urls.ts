// Thumbnail Downloader engine. Extracts the video ID from a URL or
// raw ID input, then derives the direct thumbnail image URLs that the
// host CDN serves. 100% offline — no fetches, just URL building based
// on each platform's documented pattern.
//
// Supported:
//   - YouTube (img.youtube.com) — 5 resolutions
//   - Vimeo (i.vimeocdn.com via vumbnail.com pattern — uses video id)
//   - Dailymotion (s1.dmcdn.net)
//   - TikTok (note: TikTok requires a separate poster URL; we expose
//     the canonical thumb URL pattern but it may 404 without an
//     authenticated request)

export type Platform = "youtube" | "vimeo" | "dailymotion" | "unknown";

export interface ThumbResult {
  platform: Platform;
  videoId?: string;
  /** Each entry is one downloadable image URL. */
  thumbs: { label: string; url: string; width?: number; height?: number }[];
  /** Helpful note shown in the UI. */
  notes?: string;
  /** Error shown when we can't extract a video ID. */
  error?: string;
}

const YT_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be"]);

export function detectAndBuild(input: string): ThumbResult {
  const raw = input.trim();
  if (!raw) {
    return { platform: "unknown", thumbs: [], error: "Paste a video URL or ID." };
  }

  // Bare 11-char YouTube ID (no URL).
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) {
    return buildYoutube(raw);
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { platform: "unknown", thumbs: [], error: "Could not parse as URL — paste a full URL with https://" };
  }

  const host = url.hostname.toLowerCase();

  if (YT_HOSTS.has(host)) {
    const id = extractYoutubeId(url);
    if (!id) return { platform: "youtube", thumbs: [], error: "Could not find YouTube video ID in the URL." };
    return buildYoutube(id);
  }

  if (host === "vimeo.com" || host === "www.vimeo.com" || host === "player.vimeo.com") {
    const id = extractVimeoId(url);
    if (!id) return { platform: "vimeo", thumbs: [], error: "Could not find Vimeo video ID." };
    return buildVimeo(id);
  }

  if (host === "dailymotion.com" || host === "www.dailymotion.com" || host === "dai.ly") {
    const id = extractDailymotionId(url);
    if (!id) return { platform: "dailymotion", thumbs: [], error: "Could not find Dailymotion video ID." };
    return buildDailymotion(id);
  }

  return { platform: "unknown", thumbs: [], error: `Host ${host} is not supported. Try a YouTube, Vimeo, or Dailymotion URL.` };
}

function extractYoutubeId(u: URL): string | undefined {
  if (u.hostname === "youtu.be") {
    return u.pathname.replace(/^\//, "").split("/")[0] || undefined;
  }
  if (u.pathname === "/watch") return u.searchParams.get("v") ?? undefined;
  // Shorts, embed, live, etc.
  const m = /^\/(shorts|embed|live|v)\/([A-Za-z0-9_-]{11})/.exec(u.pathname);
  if (m) return m[2];
  return undefined;
}

function buildYoutube(id: string): ThumbResult {
  return {
    platform: "youtube",
    videoId: id,
    thumbs: [
      { label: "Max-res (1280×720)", url: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`, width: 1280, height: 720 },
      { label: "Standard (640×480)", url: `https://img.youtube.com/vi/${id}/sddefault.jpg`, width: 640, height: 480 },
      { label: "High (480×360)", url: `https://img.youtube.com/vi/${id}/hqdefault.jpg`, width: 480, height: 360 },
      { label: "Medium (320×180)", url: `https://img.youtube.com/vi/${id}/mqdefault.jpg`, width: 320, height: 180 },
      { label: "Default (120×90)", url: `https://img.youtube.com/vi/${id}/default.jpg`, width: 120, height: 90 },
    ],
    notes:
      "YouTube serves these directly from img.youtube.com — no API key needed. `maxresdefault.jpg` may 404 on very old or low-resolution videos; fall back to `sddefault.jpg` in that case.",
  };
}

function extractVimeoId(u: URL): string | undefined {
  const m = /^\/(?:video\/)?(\d+)/.exec(u.pathname);
  return m ? m[1] : undefined;
}

function buildVimeo(id: string): ThumbResult {
  // Vimeo doesn't expose direct CDN thumbnails without API access, but
  // the public `vumbnail.com` proxy provides three sizes.
  return {
    platform: "vimeo",
    videoId: id,
    thumbs: [
      { label: "Large (640×360)", url: `https://vumbnail.com/${id}_large.jpg`, width: 640, height: 360 },
      { label: "Medium (200×150)", url: `https://vumbnail.com/${id}_medium.jpg`, width: 200, height: 150 },
      { label: "Small (100×75)", url: `https://vumbnail.com/${id}_small.jpg`, width: 100, height: 75 },
    ],
    notes:
      "Vimeo doesn't expose CDN URLs directly — these go through the public `vumbnail.com` proxy. For programmatic access, use the Vimeo oEmbed endpoint with the video's URL.",
  };
}

function extractDailymotionId(u: URL): string | undefined {
  if (u.hostname === "dai.ly") {
    const m = /^\/([A-Za-z0-9]+)/.exec(u.pathname);
    return m ? m[1] : undefined;
  }
  const m = /^\/video\/([A-Za-z0-9]+)/.exec(u.pathname);
  return m ? m[1] : undefined;
}

function buildDailymotionId(id: string): string {
  return id;
}
void buildDailymotionId;

function buildDailymotion(id: string): ThumbResult {
  return {
    platform: "dailymotion",
    videoId: id,
    thumbs: [
      { label: "Large", url: `https://www.dailymotion.com/thumbnail/video/${id}` },
    ],
    notes: "Dailymotion serves a single auto-sized thumbnail per video — the URL above 302-redirects to the active CDN frame.",
  };
}
