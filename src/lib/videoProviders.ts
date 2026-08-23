import { VideoProviderKind } from "@/types/video";

const YOUTUBE_HOSTS = ["youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com"];
const INSTAGRAM_HOSTS = ["instagram.com", "www.instagram.com"];

/**
 * Detects the playback provider from a submitted URL.
 * Detection never decides playability — embedding restrictions are handled
 * at render time with an explicit fallback state.
 */
export function detectVideoProvider(url: string): VideoProviderKind {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "unsupported";
  }
  if (!/^https?:$/.test(parsed.protocol)) return "unsupported";

  const host = parsed.hostname.toLowerCase();
  if (YOUTUBE_HOSTS.includes(host)) return "youtube";
  if (INSTAGRAM_HOSTS.includes(host)) return "instagram";
  return "external";
}

/** Extracts the YouTube video id from watch/shorts/youtu.be/embed URLs. */
export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host === "youtu.be") {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }
    const vParam = parsed.searchParams.get("v");
    if (vParam) return vParam;
    const segments = parsed.pathname.split("/").filter(Boolean);
    const marker = segments.findIndex((s) => s === "shorts" || s === "embed" || s === "live");
    const candidate = marker >= 0 ? segments[marker + 1] : undefined;
    if (candidate) return candidate;
    return null;
  } catch {
    return null;
  }
}

/** Extracts the Instagram shortcode from post/reel/tv URLs. */
export function extractInstagramCode(url: string): string | null {
  try {
    const segments = new URL(url).pathname.split("/").filter(Boolean);
    const marker = segments.findIndex((s) => s === "p" || s === "reel" || s === "tv");
    const candidate = marker >= 0 ? segments[marker + 1] : undefined;
    if (candidate) return candidate;
    return null;
  } catch {
    return null;
  }
}

export function youTubeEmbedUrl(
  videoId: string,
  options: { autoplay?: boolean; mute?: boolean; loop?: boolean } = {},
): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (options.autoplay) params.set("autoplay", "1");
  if (options.mute) params.set("mute", "1");
  if (options.loop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function instagramEmbedUrl(code: string): string {
  return `https://www.instagram.com/p/${code}/embed`;
}
