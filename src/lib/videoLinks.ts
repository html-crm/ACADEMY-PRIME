export type DetectedLink = { provider: string; token: string | null } | null;

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
  /(?:youtu\.be\/)([\w-]{11})/,
  /(?:youtube\.com\/embed\/)([\w-]{11})/,
  /(?:youtube\.com\/shorts\/)([\w-]{11})/,
  /(?:youtube\.com\/live\/)([\w-]{11})/,
];

const INSTAGRAM_PATTERNS = [/instagram\.com\/(?:p|reel|reels|tv)\/([\w-]+)/];

const VIMEO_PATTERN = /vimeo\.com\/(\d+)/;

const TIKTOK_PATTERNS = [
  /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
  /tiktok\.com\/@[\w.-]+\/photo\/(\d+)/,
  /vt\.tiktok\.com\/([\w-]+)/,
  /vm\.tiktok\.com\/([\w-]+)/,
];

const DAILYMOTION_PATTERN = /dailymotion\.com\/video\/([a-zA-Z0-9]+)/;

export function detectProvider(url: string): DetectedLink {
  const u = url.trim();
  for (const pattern of YOUTUBE_PATTERNS) {
    const m = u.match(pattern);
    if (m && m[1]) return { provider: "youtube", token: m[1] };
  }
  for (const pattern of INSTAGRAM_PATTERNS) {
    const m = u.match(pattern);
    if (m && m[1]) return { provider: "instagram", token: m[1] };
  }
  const vimeo = u.match(VIMEO_PATTERN);
  if (vimeo && vimeo[1]) return { provider: "vimeo", token: vimeo[1] };
  for (const pattern of TIKTOK_PATTERNS) {
    const m = u.match(pattern);
    if (m && m[1]) return { provider: "tiktok", token: m[1] };
  }
  const daily = u.match(DAILYMOTION_PATTERN);
  if (daily && daily[1]) return { provider: "dailymotion", token: daily[1] };
  return null;
}