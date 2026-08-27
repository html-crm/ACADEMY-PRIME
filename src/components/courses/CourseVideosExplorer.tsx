"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { videoService } from "@/services/videoService";
import type { CatalogVideo } from "@/types/video";
import type { Dictionary } from "@/lib/i18n";

interface CourseVideosExplorerProps {
  copy: Dictionary["catalog"]["courses"];
  locale: string;
}

const fmtDuration = (s: number) => {
  if (!s || s <= 0) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

export function CourseVideosExplorer({ copy, locale }: CourseVideosExplorerProps) {
  const [items, setItems] = useState<CatalogVideo[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    videoService
      .listCoursesVideos()
      .then((page) => setItems(page.items))
      .catch(() => {
        setError(copy.empty);
        setItems([]);
      });
  }, [copy.empty]);

  return (
    <div>
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {items === null ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-paper-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center text-sm text-ink-300">
          {copy.empty}
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((v) => (
            <Link
              key={v.id}
              href={`/${locale}/watch/${v.id}`}
              className="group overflow-hidden rounded-xl2 border border-line bg-white shadow-card transition-shadow hover:shadow-elevated"
            >
              <div
                className="h-44 w-full bg-paper-200 bg-cover bg-center"
                style={v.thumbnailUrl ? { backgroundImage: `url(${v.thumbnailUrl})` } : undefined}
              />
              <div className="p-4">
                <p className="truncate font-medium text-ink-950 group-hover:text-brass-600">{v.title}</p>
                {v.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-ink-500">{v.description}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                  <span className="capitalize">{v.difficulty}</span>
                  <span>·</span>
                  <span>{fmtDuration(v.durationSeconds)}</span>
                </div>
                <p className="mt-2 inline-block rounded-full bg-brass-400/15 px-2.5 py-1 text-xs font-semibold text-brass-600">
                  +{v.reward} ACAD-P · {copy.rewardLabel}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
