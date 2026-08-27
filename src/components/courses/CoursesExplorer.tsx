"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { videoService, type CatalogQuery, type CourseItem } from "@/services/videoService";
import type { Dictionary } from "@/lib/i18n";

interface CoursesExplorerProps {
  copy: Dictionary["catalog"]["courses"];
  locale: string;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const base = `${mm}:${String(s).padStart(2, "0")}`;
  return h > 0 ? `${h}:${base}` : base;
}

export function CoursesExplorer({ copy, locale }: CoursesExplorerProps) {
  const [items, setItems] = useState<CourseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<CatalogQuery>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const handle = setTimeout(() => {
      videoService
        .listCoursesActual(query)
        .then((page) => {
          if (cancelled) return;
          setItems(page.items);
          setTotal(page.total);
        })
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  const difficultyOptions = ["", "beginner", "intermediate", "advanced"] as const;
  const sortOptions = [
    { value: "", label: copy.sortNewest },
    { value: "reward", label: copy.sortReward },
  ];

  const skeletons = useMemo(() => Array.from({ length: 6 }), []);

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-xl2 border border-line bg-white p-5 shadow-card md:flex-row md:items-center">
        <input
          type="search"
          value={query.q ?? ""}
          onChange={(e) => setQuery({ ...query, q: e.target.value })}
          placeholder={copy.searchPlaceholder}
          className="h-11 flex-1 rounded-full border border-line bg-paper-50 px-5 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-brass-400"
        />
        <select
          value={query.difficulty ?? ""}
          onChange={(e) => setQuery({ ...query, difficulty: e.target.value })}
          className="h-11 rounded-full border border-line bg-paper-50 px-4 text-sm text-ink-900 outline-none focus:border-brass-400"
        >
          <option value="">{copy.allDifficulties}</option>
          {difficultyOptions.filter(Boolean).map((d) => (
            <option key={d} value={d}>
              {d === "beginner" ? copy.beginner : d === "intermediate" ? copy.intermediate : copy.advanced}
            </option>
          ))}
        </select>
        <select
          value={query.sort ?? ""}
          onChange={(e) => setQuery({ ...query, sort: e.target.value })}
          className="h-11 rounded-full border border-line bg-paper-50 px-4 text-sm text-ink-900 outline-none focus:border-brass-400"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-6 text-sm text-ink-500">
        {loading ? copy.loading : `${total} ${copy.results}`}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? skeletons.map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl2 border border-line bg-white">
                <div className="aspect-[16/10] rounded-t-xl2 bg-paper-200" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-3/4 rounded bg-paper-200" />
                  <div className="h-3 w-full rounded bg-paper-200" />
                  <div className="h-3 w-1/2 rounded bg-paper-200" />
                </div>
              </div>
            ))
          : items.map((course) => (
              <Link key={course.id} href={`/${locale}/courses/${course.id}`}>
                <article className="group flex h-full flex-col overflow-hidden rounded-xl2 border border-line bg-white shadow-card transition-shadow hover:shadow-elevated">
                  <div className="relative aspect-[16/10] w-full bg-ink-900">
                    {course.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.thumbnailUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                      />
                    ) : (
                      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-ink-800 to-ink-950" />
                    )}
                    <span className="absolute end-4 top-4 rounded-full bg-brass-400/90 px-3 py-1 text-xs font-semibold text-ink-950">
                      {course.difficulty === "beginner"
                        ? copy.beginner
                        : course.difficulty === "intermediate"
                          ? copy.intermediate
                          : copy.advanced}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="font-display text-lg leading-snug text-ink-950">{course.title}</h3>
                    <p className="line-clamp-2 text-sm leading-relaxed text-ink-500">{course.description}</p>
                    <div className="mt-auto flex items-center justify-between border-t border-line pt-4 text-xs text-ink-500">
                      <span>{course.videoCount} {course.videoCount === 1 ? "lesson" : "lessons"}</span>
                      <span>{formatDuration(course.totalDuration)}</span>
                    </div>
                    <span className="text-xs font-semibold text-brass-600">{copy.watchCta} →</span>
                  </div>
                </article>
              </Link>
            ))}
      </div>

      {!loading && items.length === 0 && (
        <p className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-sm text-ink-300">
          {copy.empty}
        </p>
      )}
    </div>
  );
}
