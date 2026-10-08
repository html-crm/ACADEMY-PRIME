"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type VideoPublic } from "@/lib/api";

const COPY = {
  en: {
    heading: "Long Videos",
    subhead: "Full lessons that pay rewards when you complete them.",
    documentaries: "Documentaries",
    docsEmpty: "No documentaries published yet. Check back soon!",
    empty: "No lessons published yet. Check back soon!",
    loadError: "Could not load videos. Is the API running?",
    retry: "Retry",
    minWatch: "Min. watch",
    reward: "Reward",
    expert: "By",
  },
  ar: {
    heading: "فيديوهات طويلة",
    subhead: "دروس كاملة تكافئك عند إكمالها.",
    documentaries: "أفلام وثائقية",
    docsEmpty: "لا توجد أفلام وثائقية منشورة بعد. عود قريباً!",
    empty: "لا توجد دروس منشورة بعد. عود قريباً!",
    loadError: "تعذّر تحميل الفيديوهات. هل الخدمة تعمل؟",
    retry: "إعادة المحاولة",
    minWatch: "أقل مشاهدة",
    reward: "المكافأة",
    expert: "بواسطة",
  },
};

const fmtDuration = (s: number | null) => {
  if (!s || s <= 0) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export default function LongVideosPage({ params }: { params: { locale: string } }) {
  const locale = params.locale === "ar" ? "ar" : "en";
  const t = COPY[locale];
  const rtl = locale === "ar";
  const [docs, setDocs] = useState<VideoPublic[] | null>(null);
  const [regular, setRegular] = useState<VideoPublic[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const base = { format: "long", page_size: 50, exclude_in_course: true } as const;
    Promise.all([
      api.listVideos({ ...base, documentary: true }),
      api.listVideos({ ...base, documentary: false }),
    ])
      .then(([docPage, regPage]) => {
        setDocs(docPage.items);
        setRegular(regPage.items);
      })
      .catch(() => {
        setError(t.loadError);
        setDocs([]);
        setRegular([]);
      });
  }, [t.loadError, attempt]);

  const loading = docs === null || regular === null;
  const docsLoaded = docs !== null && docs.length > 0;

  return (
    <main className="min-h-screen bg-paper-100 pb-20" dir={rtl ? "rtl" : "ltr"}>
      <div className="container-content pt-12">
        <h1 className="font-display text-3xl font-semibold text-ink-950">{t.heading}</h1>
        <p className="mt-1 text-sm text-ink-500">{t.subhead}</p>

        {error && (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <span>{error}</span>
            <button
              onClick={() => {
                setError("");
                setDocs(null);
                setRegular(null);
                setAttempt((a) => a + 1);
              }}
              className="shrink-0 rounded-full bg-red-100 px-4 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
            >
              {t.retry}
            </button>
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-paper-200" />
            ))}
          </div>
        ) : !docsLoaded && (regular?.length ?? 0) === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-line bg-paper-50 p-12 text-center text-sm text-ink-500">
            {t.empty}
          </p>
        ) : (
          <>
            {docsLoaded && (
              <section className="mt-8">
                <h2 className="font-display text-2xl font-semibold text-ink-950">{t.documentaries}</h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {docs!.map((v) => (
                    <VideoCard key={v.id} v={v} locale={locale} t={t} />
                  ))}
                </div>
              </section>
            )}
            {(regular?.length ?? 0) > 0 && (
              <section className="mt-8">
                {docsLoaded && (
                  <h2 className="font-display text-2xl font-semibold text-ink-950">{t.heading}</h2>
                )}
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {regular!.map((v) => (
                    <VideoCard key={v.id} v={v} locale={locale} t={t} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

type CopyT = (typeof COPY)["en"];

function VideoCard({ v, locale, t }: { v: VideoPublic; locale: string; t: CopyT }) {
  return (
    <Link
      href={`/${locale}/watch/${v.id}`}
      className="group overflow-hidden rounded-xl border border-line bg-paper-50 transition-shadow hover:shadow-md"
    >
      <div
        className="h-44 w-full bg-paper-200 bg-cover bg-center"
        style={v.thumbnail_url ? { backgroundImage: `url(${v.thumbnail_url})` } : undefined}
      />
      <div className="p-4">
        <p className="truncate font-medium text-ink-950 group-hover:text-brass-600">{v.title}</p>
        {v.owner_name && (
          <p className="mt-1 text-xs font-medium text-brass-600">
            {t.expert} {v.owner_name}
          </p>
        )}
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
  );
}
