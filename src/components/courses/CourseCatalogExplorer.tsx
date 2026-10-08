"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { videoService, type CatalogQuery } from "@/services/videoService";
import type { CatalogVideo } from "@/types/video";
import type { Dictionary } from "@/lib/i18n";

interface CourseCatalogExplorerProps {
  copy: Dictionary["catalog"]["courses"];
  locale: string;
}

type Difficulty = "beginner" | "intermediate" | "advanced";

const fmtDuration = (s: number) => {
  if (!s || s <= 0) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

const COPY = {
  en: {
    loadError: "Could not load videos. Is the API running?",
    retry: "Retry",
  },
  ar: {
    loadError: "تعذّر تحميل الفيديوهات. هل الخدمة تعمل؟",
    retry: "إعادة المحاولة",
  },
};

export function CourseCatalogExplorer({ copy, locale }: CourseCatalogExplorerProps) {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [items, setItems] = useState<CatalogVideo[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState<CatalogQuery>({});
  const [topic, setTopic] = useState("");
  const t = locale === "ar" ? COPY.ar : COPY.en;

  useEffect(() => {
    api.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      videoService
        .listCoursesVideos(query)
        .then((page) => {
          if (cancelled) return;
          setItems(page.items);
          setTotal(page.total);
        })
        .catch(() => {
          if (cancelled) return;
          setError(t.loadError);
          setItems([]);
        });
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, t.loadError, attempt]);

  const spotlight = items && items.length > 0 ? (items[0] ?? null) : null;
  const grid = items ? (spotlight ? items.slice(1) : items) : null;

  const applyTopic = (categoryId: string) => {
    setTopic(categoryId);
    setQuery((q) => ({ ...q, categoryId: categoryId || undefined }));
  };

  const applyDifficulty = (difficulty: Difficulty | "") => {
    setQuery((q) => ({ ...q, difficulty: difficulty || undefined }));
  };

  const skeletons = useMemo(() => Array.from({ length: 6 }), []);
  const uid = useMemo(() => Math.random().toString(36).slice(2, 8), []);

  return (
    <div>
      {/* Spotlight — the newest course, like an academy feature */}
      {spotlight && (
        <Link
          href={`/${locale}/watch/${spotlight.id}`}
          className="group grid overflow-hidden rounded-3xl border border-line bg-white shadow-card transition-shadow hover:shadow-elevated lg:grid-cols-[1.4fr_1fr]"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink-900 lg:aspect-auto lg:min-h-[300px]">
            {spotlight.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={spotlight.thumbnailUrl}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950"
              />
            )}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent"
            />
            <span className="absolute start-5 top-5 rounded-full bg-brass-400/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink-950">
              {copy.featured}
            </span>
            <span className="absolute bottom-4 start-5 rounded-lg bg-ink-950/75 px-2.5 py-1 text-xs font-medium text-paper-50 backdrop-blur-sm">
              {fmtDuration(spotlight.durationSeconds)} · {copy.min}
            </span>
          </div>
          <div className="flex flex-col justify-center gap-4 p-7 lg:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-line bg-paper-50 px-3 py-1 text-xs font-medium capitalize text-ink-600">
                {spotlight.difficulty === "beginner"
                  ? copy.beginner
                  : spotlight.difficulty === "intermediate"
                    ? copy.intermediate
                    : copy.advanced}
              </span>
              <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                +{spotlight.reward} ACAD-P
              </span>
            </div>
            <h2 className="font-display text-2xl leading-tight tracking-tight text-ink-950 md:text-3xl">
              {spotlight.title}
            </h2>
            {spotlight.description && (
              <p className="line-clamp-3 text-[15px] leading-relaxed text-ink-500">{spotlight.description}</p>
            )}
            {spotlight.ownerName && (
              <p className="text-xs font-semibold tracking-wide text-brass-600">
                {copy.byExpert} {spotlight.ownerName}
              </p>
            )}
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-ink-950 px-6 py-3 text-sm font-semibold text-paper-50 transition-colors group-hover:bg-brass-500 group-hover:text-ink-950">
              {copy.startLearning} →
            </span>
          </div>
        </Link>
      )}

      {/* Topic pills — the "Crypto · Courses · Product Guides" style rows */}
      <div className="mt-10 rounded-3xl border border-line bg-white p-6 shadow-card">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <input
              type="search"
              value={query.q ?? ""}
              onChange={(e) => setQuery({ ...query, q: e.target.value })}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchPlaceholder}
              className="h-12 flex-1 rounded-full border border-line bg-paper-50 px-6 text-sm text-ink-900 outline-none transition-colors placeholder:text-ink-300 focus:border-brass-400 md:max-w-xs"
            />
            <div className="flex items-center gap-3 md:ms-auto">
              <span className="hidden text-sm text-ink-400 sm:inline">{copy.sort}</span>
              <select
                value={query.sort ?? ""}
                onChange={(e) => setQuery({ ...query, sort: e.target.value || undefined })}
                aria-label={copy.sort}
                className="h-12 rounded-full border border-line bg-paper-50 px-5 text-sm text-ink-900 outline-none focus:border-brass-400"
              >
                <option value="">{copy.sortNewest}</option>
                <option value="reward">{copy.sortReward}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div
              className="flex gap-2 overflow-x-auto pb-1 lg:overflow-visible"
              role="tablist"
              aria-label="Topics"
            >
              <button
                type="button"
                role="tab"
                aria-selected={topic === ""}
                onClick={() => applyTopic("")}
                className={`h-10 shrink-0 rounded-full border px-5 text-sm font-medium transition-colors ${
                  topic === ""
                    ? "border-ink-950 bg-ink-950 text-white"
                    : "border-line bg-paper-50 text-ink-600 hover:border-ink-300"
                }`}
              >
                {copy.allTopics}
              </button>
              {categories.map((category) => {
                const active = topic === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => applyTopic(category.id)}
                    className={`h-10 shrink-0 rounded-full border px-5 text-sm font-medium transition-colors ${
                      active
                        ? "border-ink-950 bg-ink-950 text-white"
                        : "border-line bg-paper-50 text-ink-600 hover:border-ink-300"
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2" role="group" aria-label="Skill level">
              {(["", "beginner", "intermediate", "advanced"] as const).map((level) => {
                const active = (query.difficulty ?? "") === level;
                const label =
                  level === ""
                    ? copy.allDifficulties
                    : level === "beginner"
                      ? copy.beginner
                      : level === "intermediate"
                        ? copy.intermediate
                        : copy.advanced;
                return (
                  <button
                    key={level === "" ? "all" : level}
                    type="button"
                    onClick={() => applyDifficulty(level)}
                    className={`h-10 rounded-full px-4 text-xs font-semibold transition-colors ${
                      active
                        ? "bg-brass-400 text-ink-950"
                        : "bg-paper-50 text-ink-500 hover:bg-paper-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Results + grid */}
      <div className="mt-8 flex items-baseline justify-between">
        <p className="text-sm font-medium text-ink-500">
          {items === null ? copy.loading : `${total} ${copy.results}`}
        </p>
      </div>

      {error && (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <span>{error}</span>
          <button
            onClick={() => {
              setError("");
              setItems(null);
              setAttempt((a) => a + 1);
            }}
            className="shrink-0 rounded-full bg-red-100 px-4 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
          >
            {t.retry}
          </button>
        </div>
      )}

      {items === null ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skeletons.map((_, i) => (
            <div key={`${uid}-sk-${i}`} className="animate-pulse overflow-hidden rounded-3xl border border-line bg-white">
              <div className="aspect-[16/10] bg-paper-200" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-2/3 rounded bg-paper-200" />
                <div className="h-3 w-full rounded bg-paper-200" />
                <div className="h-3 w-1/2 rounded bg-paper-200" />
              </div>
            </div>
          ))}
        </div>
      ) : grid && grid.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {grid.map((v) => (
            <Link
              key={v.id}
              href={`/${locale}/watch/${v.id}`}
              className="group overflow-hidden rounded-3xl border border-line bg-white shadow-card transition-shadow hover:shadow-elevated"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-900">
                {v.thumbnailUrl ? (
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundImage: `url(${v.thumbnailUrl})` }}
                  />
                ) : (
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-ink-800 to-ink-950" />
                )}
                <span className="absolute end-4 top-4 rounded-full bg-brass-400/90 px-2.5 py-1 text-[11px] font-bold text-ink-950">
                  +{v.reward} ACAD-P
                </span>
                <span className="absolute bottom-3 start-4 rounded-md bg-ink-950/75 px-2 py-0.5 text-[11px] font-medium text-paper-50 backdrop-blur-sm">
                  {fmtDuration(v.durationSeconds)} · {copy.min}
                </span>
              </div>
              <div className="flex flex-col gap-2.5 p-5">
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <span className="rounded-full bg-paper-100 px-2.5 py-0.5 capitalize">{v.difficulty}</span>
                </div>
                <h3 className="line-clamp-2 font-display text-lg leading-snug text-ink-950">{v.title}</h3>
                {v.description && <p className="line-clamp-2 text-sm leading-relaxed text-ink-500">{v.description}</p>}
                <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-xs">
                  <span className="text-brass-600">{copy.watchCta} →</span>
                  {v.ownerName && <span className="truncate text-ink-400">{copy.byExpert} {v.ownerName}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-12 text-center text-sm text-ink-300">
          {copy.empty}
        </div>
      )}
    </div>
  );
}