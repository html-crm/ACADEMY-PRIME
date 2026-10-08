import Link from "next/link";
import { CourseVideosExplorer } from "@/components/courses/CourseVideosExplorer";
import type { Dictionary } from "@/lib/i18n";

interface CategoryLandingProps {
  eyebrow: string;
  title: string;
  description: string;
  catalogCopy: Dictionary["catalog"]["courses"];
  locale: string;
  exploreLabel: string;
}

export function CategoryLanding({
  eyebrow,
  title,
  description,
  catalogCopy,
  locale,
  exploreLabel,
}: CategoryLandingProps) {
  return (
    <div className="bg-paper-50">
      <div className="container-content py-16 md:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight md:text-5xl">{title}</h1>
        <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-500">{description}</p>

        <div className="mt-12 rounded-3xl border border-line bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-xl font-semibold text-ink-950">{title}</h2>
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-50 px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:border-brass-400 hover:text-brass-600"
            >
              {exploreLabel} →
            </Link>
          </div>
          <CourseVideosExplorer copy={catalogCopy} locale={locale} />
        </div>
      </div>
    </div>
  );
}