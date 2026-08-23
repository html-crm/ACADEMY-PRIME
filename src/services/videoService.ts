import { api, ApiError, type VideoPublic } from "@/lib/api";
import {
  CatalogVideo,
  DifficultyLevel,
  VideoProviderKind,
} from "@/types/video";
import { detectVideoProvider } from "@/lib/videoProviders";

function toCatalogVideo(video: VideoPublic): CatalogVideo {
  const sourceUrl = video.source_url ?? "";
  const provider: VideoProviderKind =
    video.provider === "youtube"
      ? "youtube"
      : video.provider === "instagram"
        ? "instagram"
        : detectVideoProvider(sourceUrl);
  return {
    id: video.id,
    title: video.title,
    description: video.description ?? "",
    providerRaw: video.provider,
    provider,
    providerVideoId: video.provider_video_id,
    sourceUrl,
    thumbnailUrl: video.thumbnail_url ?? "",
    durationSeconds: video.duration_seconds ?? 0,
    language: video.language,
    difficulty: (video.difficulty as DifficultyLevel) ?? "beginner",
    isShort: video.format === "short",
    reward: Number(video.effective_reward),
    requiredWatchPercentage: Number(video.required_watch_percentage),
  };
}

export interface CatalogQuery {
  q?: string;
  difficulty?: string;
  language?: string;
  sort?: string;
}

export interface CatalogPage {
  items: CatalogVideo[];
  total: number;
}

async function withFallback(
  real: () => Promise<CatalogPage>,
  fallbackItems: CatalogVideo[],
): Promise<CatalogPage> {
  try {
    return await real();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    return { items: fallbackItems, total: fallbackItems.length };
  }
}

export const videoService = {
  async listCourses(query: CatalogQuery = {}): Promise<CatalogPage> {
    return withFallback(
      async () => {
        const page = await api.listVideos({ ...query, format: "long" });
        return { items: page.items.map(toCatalogVideo), total: page.total };
      },
      [],
    );
  },

  async listShorts(query: CatalogQuery = {}): Promise<CatalogPage> {
    return withFallback(
      async () => {
        const page = await api.listVideos({ ...query, format: "short" });
        return { items: page.items.map(toCatalogVideo), total: page.total };
      },
      [],
    );
  },

  async getVideo(id: string): Promise<CatalogVideo | null> {
    try {
      return toCatalogVideo(await api.getVideo(id));
    } catch {
      return null;
    }
  },
};
