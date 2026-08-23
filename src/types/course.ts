export type Difficulty = "beginner" | "intermediate" | "advanced";

export type CourseCategory =
  | "blockchain-basics"
  | "trading"
  | "defi"
  | "security"
  | "web3-development"
  | "nft";

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  videoUrl: string; // mock URL, replaced by real CDN asset later
  rewardTokens: number;
  completed: boolean;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: Difficulty;
  thumbnailUrl: string;
  instructor: {
    name: string;
    avatarUrl: string;
    title: string;
  };
  lessonCount: number;
  totalRewardTokens: number;
  enrolledCount: number;
  lessons?: Lesson[];
}
