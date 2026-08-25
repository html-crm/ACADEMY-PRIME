"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type VideoPublic } from "@/lib/api";

const COPY = {
  en: {
    heading: "Long Videos",
    subhead: "Full lessons that pay rewards when you complete them.",
    empty: "No lessons published yet. Check back soon!",
    loadError: "Could not load videos. Is the API running?",
    minWatch: "Min. watch",
    reward: "Reward",
  },
  ar: {
    heading: "فيديوهات طويلة",
    subhead: "دروس كاملة تكافئك عند إكمالها.",
    empty: "لا توجد دروس منشورة بعد. عود قريباً!",
    loadError: "تعذّر تحميل الفيديوهات. هل الخدمة تعمل؟",
    minWatch: "أقل مشاهدة",
    reward: "المكافأة",
  },
};

const fmtDuration = (s: number | null) => {
  if (!s || s <= 0) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

export default function LongVideosPage({ params }: { params: { locale: string } }) {
  const locale = params.locale === "ar" ? "ar" : "en";
  const t = COPY[locale];
  const rtl = locale === "ar";
  const [videos, setVideos] = useState<VideoPublic[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listVideos({ format: "long", page_size: 50 })
      .then((page) => setVideos(page.items))
      .catch(() => {
        setError(t.loadError);
        setVideos([]);
      });
  }, [t.loadError]);

  return (
    <main className="min-h-screen bg-paper-100 pb-20" dir={rtl ? "rtl" : "ltr"}>
      <div className="container-content pt-12">
        <h1 className="font-display text-3xl font-semibold text-ink-950">{t.heading}</h1>
        <p className="mt-1 text-sm text-ink-500">{t.subhead}</p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {videos === null ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-paper-200" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-line bg-paper-50 p-12 text-center text-sm text-ink-500">
            {t.empty}
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <Link
                key={v.id}
                href={`/${locale}/watch/${v.id}`}
                className="group overflow-hidden rounded-xl border border-line bg-paper-50 transition-shadow hover:shadow-md"
              >
                <div
                  className="h-44 w-full bg-paper-200 bg-cover bg-center"
                  style={v.thumbnail_url ? { backgroundImage: `url(${v.thumbnail_url})` } : undefined}
                />
                <div className="p-4">
                  <p className="truncate font-medium text-ink-950 group-hover:text-brass-600">{v.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                    <span className="capitalize">{v.difficulty}</span>
                    <span>·</span>
                    <span>{fmtDuration(v.duration_seconds)}</span>
                    <span>·</span>
                    <span>
                      {t.minWatch} {Number(v.required_watch_percentage)}%
                    </span>
                  </div>
                  <p className="mt-2 inline-block rounded-full bg-brass-400/15 px-2.5 py-1 text-xs font-semibold text-brass-600">
                    +{Number(v.effective_reward)} ACAD-P · {t.reward}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
