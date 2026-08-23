import { CatalogVideo } from "@/types/video";
import { detectVideoProvider } from "@/lib/videoProviders";

function mockShort(
  id: string,
  title: string,
  youtubeId: string,
  durationSeconds: number,
  difficulty: CatalogVideo["difficulty"],
): CatalogVideo {
  const url = `https://www.youtube.com/watch?v=${youtubeId}`;
  return {
    id,
    title,
    description: "",
    providerRaw: "youtube",
    provider: detectVideoProvider(url),
    providerVideoId: youtubeId,
    sourceUrl: url,
    thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    durationSeconds,
    language: "en",
    difficulty,
    isShort: true,
    reward: 5,
    requiredWatchPercentage: 90,
  };
}

/** Shown only when the backend has no published shorts yet. */
export const mockShorts: CatalogVideo[] = [
  mockShort("s-001", "What is a seed phrase?", "bBC-nXj3Ng4", 48, "beginner"),
  mockShort("s-002", "Never share this information", "bBC-nXj3Ng4", 42, "beginner"),
  mockShort("s-003", "What is a rug pull?", "bBC-nXj3Ng4", 55, "intermediate"),
];
