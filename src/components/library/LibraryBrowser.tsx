"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShortsFeed } from "@/components/shorts/ShortsFeed";
import { api, type VideoPublic } from "@/lib/api";
import type { Dictionary } from "@/lib/i18n";

type Tab = "long" | "short";

export function LibraryBrowser({
  locale,
  shortsCopy,
  longLabel,
  shortLabel,
}: {
  locale: string;
  shortsCopy: Dictionary["catalog"]["shorts"];
  longLabel: string;
  shortLabel: string;
}) {
  const [tab, setTab] = useState<Tab>("long");
  const [docs, setDocs] = useState<VideoPublic[] | null>(null);
  const [regular, setRegular] = useState<VideoPublic[] | null>(null);
  const [error, setError] = useState("");
  const rtl = locale === "ar";
  const t = COPY[locale === "ar" ? "ar" : "en"];

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
  }, [t.loadError]);

  const loading = docs === null || regular === null;

  return (
    <div dir={rtl ? "rtl" : "ltr"}>
      <div className="border-b border-line bg-white">
        <div className="container-content flex gap-1 overflow-x-auto">
          {(
            [
              ["long", longLabel],
              ["short", shortLabel],
            ] as [Tab, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={
                "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors " +
                (tab === value
                  ? "border-brass-600 text-brass-600"
                  : "border-transparent text-ink-500 hover:text-ink-900")
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "short" ? (
        <div className="container-content py-8">
          <ShortsFeed copy={shortsCopy} locale={locale} />
        </div>
      ) : (
        <div className="container-content pt-8">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-paper-200" />
              ))}
            </div>
          ) : (
            <>
              <section className="mb-8">
                <h2 className="font-display text-2xl font-semibold text-ink-950">{t.documentaries}</h2>
                {docs && docs.length > 0 ? (
                  <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {docs.map((v) => (
                      <VideoCard key={v.id} v={v} locale={locale} t={t} />
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl border border-dashed border-line bg-paper-50 p-8 text-center text-sm text-ink-500">
                    {t.docsEmpty}
                  </p>
                )}
              </section>
              {(regular?.length ?? 0) > 0 && (
                <section>
                  <h2 className="font-display text-2xl font-semibold text-ink-950">{t.heading}</h2>
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
      )}
    </div>
  );
}

type CopyT = (typeof COPY)["en"];

const COPY = {
  en: {
    heading: "Long Videos",
    documentaries: "Documentaries",
    docsEmpty: "No documentaries published yet. Check back soon!",
    empty: "No lessons published yet. Check back soon!",
    loadError: "Could not load videos. Is the API running?",
    minWatch: "Min. watch",
    reward: "Reward",
  },
  ar: {
    heading: "فيديوهات طويلة",
    documentaries: "أفلام وثائقية",
    docsEmpty: "لا توجد أفلام وثائقية منشورة بعد. عود قريباً!",
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
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

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
