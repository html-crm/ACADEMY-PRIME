import { Course } from "@/types/course";
import { api, ApiError, type VideoPublic } from "@/lib/api";
import { featuredCourses } from "@/data/courses.mock";

const FALLBACK_CATEGORY = "blockchain-basics";

function toCourse(video: VideoPublic): Course {
  return {
    id: video.id,
    slug: video.id,
    title: video.title,
    description: video.description ?? "",
    category: FALLBACK_CATEGORY,
    difficulty: (video.difficulty as Course["difficulty"]) ?? "beginner",
    thumbnailUrl: video.thumbnail_url ?? "",
    instructor: {
      name: "ACADEMY PRIME",
      avatarUrl: "",
      title: "Verified Expert",
    },
    lessonCount: 1,
    totalRewardTokens: Number(video.effective_reward),
    enrolledCount: 0,
  };
}

export const courseService = {
  async getFeaturedCourses(): Promise<Course[]> {
    try {
      const page = await api.listVideos({ sort: "reward", page: 1 });
      if (page.items.length > 0) {
        return page.items.map(toCourse);
      }
    } catch (error) {
      // Backend offline or not seeded — fall back to mock content so the
      // landing page still renders during development.
      if (!(error instanceof ApiError)) return featuredCourses;
    }
    return featuredCourses;
  },

  async getCourseById(id: string): Promise<Course | undefined> {
    try {
      return toCourse(await api.getVideo(id));
    } catch {
      return undefined;
    }
  },
};
