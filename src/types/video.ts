export type VideoProviderKind =
  | "youtube"
  | "instagram"
  | "vimeo"
  | "tiktok"
  | "dailymotion"
  | "external"
  | "unsupported";

export type VideoFormat = "long" | "short" | "course";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

/** Frontend catalog model mapped from the FastAPI `VideoPublic` payload. */
export interface CatalogVideo {
  id: string;
  title: string;
  description: string;
  providerRaw: string;
  provider: VideoProviderKind;
  providerVideoId: string | null;
  sourceUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  language: string;
  difficulty: DifficultyLevel;
  isShort: boolean;
  reward: number;
  requiredWatchPercentage: number;
}

export const SHORT_VIDEO_MAX_SECONDS = 60;

export function isEligibleShortDuration(seconds: number): boolean {
  return seconds > 0 && seconds <= SHORT_VIDEO_MAX_SECONDS;
}
