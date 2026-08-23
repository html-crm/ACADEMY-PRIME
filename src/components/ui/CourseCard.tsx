import { Course } from "@/types/course";
import { Dictionary } from "@/lib/i18n";

interface CourseCardProps {
  course: Course;
  copy: Dictionary["home"]["featuredCourses"];
}

export function CourseCard({ course, copy }: CourseCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl2 border border-line bg-white shadow-card transition-shadow duration-200 hover:shadow-elevated">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-900">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 opacity-90"
        />
        <span className="absolute start-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-paper-50 backdrop-blur-sm">
          {copy.categories[course.category]}
        </span>
        <span className="absolute end-4 top-4 rounded-full bg-brass-400/90 px-3 py-1 text-xs font-semibold text-ink-950">
          {copy.difficulty[course.difficulty]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg leading-snug text-ink-950">{course.title}</h3>
        <p className="text-sm leading-relaxed text-ink-500">{course.description}</p>

        <div className="mt-auto flex items-center justify-between border-t border-line pt-4 text-xs text-ink-500">
          <span>
            {course.lessonCount} {copy.lessons}
          </span>
          <span className="flex items-center gap-1 font-semibold text-emerald-700">
            +{course.totalRewardTokens} APT
          </span>
        </div>
        <p className="text-xs text-ink-300">
          {course.enrolledCount.toLocaleString()} {copy.enrolled}
        </p>
      </div>
    </article>
  );
}
