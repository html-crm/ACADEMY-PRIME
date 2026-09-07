import { api, ApiError, type VideoPublic, type CoursePublic } from "@/lib/api";
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
        : video.provider === "vimeo"
          ? "vimeo"
          : video.provider === "tiktok"
            ? "tiktok"
            : video.provider === "dailymotion"
              ? "dailymotion"
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

export interface CourseItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  language: string;
  difficulty: string;
  videoCount: number;
  totalDuration: number;
  ownerName: string | null;
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
  async listCoursesActual(query: CatalogQuery = {}): Promise<{ items: CourseItem[]; total: number }> {
    try {
      const page = await api.listCourses(query);
      return {
        items: page.items.map((c) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          description: c.description,
          thumbnailUrl: c.thumbnail_url,
          language: c.language,
          difficulty: c.difficulty,
          videoCount: c.video_count,
          totalDuration: c.total_duration,
          ownerName: c.owner_name,
        })),
        total: page.total,
      };
    } catch {
      return { items: [], total: 0 };
    }
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

  async listCoursesVideos(query: CatalogQuery = {}): Promise<CatalogPage> {
    return withFallback(
      async () => {
        const page = await api.listVideos({ ...query, format: "course" });
        return { items: page.items.map(toCatalogVideo), total: page.total };
      },
      [],
    );
  },

  async listLongVideos(query: CatalogQuery = {}): Promise<CatalogPage> {
    return withFallback(
      async () => {
        const page = await api.listVideos({ ...query, format: "long", exclude_in_course: true });
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
