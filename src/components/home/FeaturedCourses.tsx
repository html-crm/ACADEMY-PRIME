import { Dictionary } from "@/lib/i18n";
import { courseService } from "@/services/courseService";
import { CourseCard } from "@/components/ui/CourseCard";
import { Button } from "@/components/ui/Button";
import { Locale } from "@/types/user";

interface FeaturedCoursesProps {
  copy: Dictionary["home"]["featuredCourses"];
  locale: Locale;
}

export async function FeaturedCourses({ copy, locale }: FeaturedCoursesProps) {
  const courses = await courseService.getFeaturedCourses();

  return (
    <section id="courses" className="bg-paper-50 py-24">
      <div className="container-content">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 className="mt-4 max-w-md text-3xl leading-tight md:text-4xl">{copy.heading}</h2>
          </div>
          <Button variant="ghost" href={`/${locale}/courses`}>
            {copy.viewAll} →
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} copy={copy} />
          ))}
        </div>
      </div>
    </section>
  );
}
