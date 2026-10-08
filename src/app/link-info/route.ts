import { NextResponse } from "next/server";
import { detectProvider } from "@/lib/videoLinks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function parseISODuration(iso: string): number | null {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

async function youtubeTitle(id: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`,
      { headers: { "User-Agent": UA, "Accept-Language": "en" }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return data.title ?? null;
  } catch {
    return null;
  }
}

async function youtubeMeta(id: string): Promise<{ duration: number | null; description: string | null }> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return { duration: null, description: null };
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${id}&key=${key}`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return { duration: null, description: null };
    const data = (await res.json()) as {
      items?: { contentDetails?: { duration?: string }; snippet?: { description?: string } }[];
    };
    const item = data.items?.[0];
    let duration: number | null = null;
    if (item?.contentDetails?.duration) {
      const seconds = parseISODuration(item.contentDetails.duration);
      if (seconds && seconds > 0) duration = seconds;
    }
    const description = item?.snippet?.description?.trim() ? item.snippet.description.trim() : null;
    return { duration, description: description ? description.slice(0, 5000) : null };
  } catch {
    return { duration: null, description: null };
  }
}

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("url") ?? "";
  const detected = detectProvider(requested);
  if (!detected) {
    return NextResponse.json({ error: "unsupported_url" }, { status: 422 });
  }

  const out: {
    provider: string;
    token: string | null;
    title: string | null;
    duration_seconds: number | null;
    description: string | null;
  } = {
    provider: detected.provider,
    token: detected.token,
    title: null,
    duration_seconds: null,
    description: null,
  };

  if (detected.provider === "youtube" && detected.token) {
    const [title, meta] = await Promise.all([youtubeTitle(detected.token), youtubeMeta(detected.token)]);
    out.title = title;
    out.duration_seconds = meta.duration;
    out.description = meta.description;
  } else if (detected.provider === "vimeo" && detected.token) {
    try {
      const res = await fetch(
        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(requested)}`,
        { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(8000) },
      );
      if (res.ok) {
        const data = (await res.json()) as {
          title?: string;
          duration?: number;
          description?: string;
        };
        out.title = data.title ?? null;
        out.duration_seconds =
          typeof data.duration === "number" && data.duration > 0 ? data.duration : null;
        out.description =
          typeof data.description === "string" && data.description.trim()
            ? data.description.trim().slice(0, 5000)
            : null;
      }
    } catch {
      /* ignore */
    }
  }

  return NextResponse.json(out, {
    headers: { "Cache-Control": "no-store" },
  });
}