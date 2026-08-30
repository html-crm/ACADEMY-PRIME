"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Locale } from "@/types/user";
import { api, LeaderboardEntry } from "@/lib/api";

const COPY = {
  en: {
    eyebrow: "TOP EARNERS",
    heading: "Rewards leaderboard",
    subhead:
      "See how much learners are earning by completing verified lessons. Values update in real time.",
    rank: "Rank",
    user: "Learner",
    earned: "Earned",
    lessons: "Lessons",
    emptyTitle: "No earnings yet",
    emptyDesc:
      "No learner has earned tokens yet. Be the first — watch a verified lesson and start earning ACAD-P.",
    you: "You",
    viewAll: "View full leaderboard",
    loadMore: "Show more",
    hiding: "Showing top {n}",
    connecting: "Fetching leaderboard…",
    acad: "ACAD-P",
  },
  ar: {
    eyebrow: "الأعلى ربحاً",
    heading: "لوحة المتصدرين للمكافآت",
    subhead: "شاهد كم يكسب المتعلمون من إتمام الدروس الموثقة. تتحدث القيم في الوقت الفعلي.",
    rank: "الترتيب",
    user: "المتعلم",
    earned: "المكسب",
    lessons: "الدروس",
    emptyTitle: "لا توجد أرباح بعد",
    emptyDesc: "لم يكسب أي متعلم رموزاً بعد. كن الأول — شاهد درساً موثقاً وابدأ بكسب ACAD-P.",
    you: "أنت",
    viewAll: "عرض لوحة المتصدرين",
    loadMore: "عرض المزيد",
    hiding: "إظهار أفضل {n}",
    connecting: "جارٍ جلب لوحة المتصدرين…",
    acad: "ACAD-P",
  },
};

function formatAmount(value: string): string {
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 9 });
}

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  const first = parts[0];
  const last = parts[parts.length - 1];
  const firstChar = first ? first[0] ?? "" : "";
  const lastChar = parts.length > 1 && last ? last[0] ?? "" : "";
  return (firstChar + lastChar).toUpperCase();
}

function Avatar({ name, url, isYou, size }: { name: string; url: string | null; isYou: boolean; size: "sm" | "md" }) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const cls = `${dim} flex shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold ${
    isYou ? "bg-brass-400 text-ink-950" : "bg-ink-950 text-paper-50"
  }`;
  if (url) {
    return <img src={url} alt={name} className={`${dim} shrink-0 rounded-full object-cover`} />;
  }
  return <span className={cls}>{initials(name)}</span>;
}

export function EarnersLeaderboard({
  locale,
  variant = "full",
  limit = 50,
}: {
  locale: Locale;
  variant?: "full" | "teaser";
  limit?: number;
}) {
  const t = COPY[locale];
  const rtl = locale === "ar";
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(null);
  const [visible, setVisible] = useState(10);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setError(false);
    api
      .leaderboard(limit)
      .then((res) => {
        if (active) setRows(res.items);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [limit]);

  const showRows = rows === null ? [] : rows.slice(0, visible);

  const content = (
    <div dir={rtl ? "rtl" : "ltr"}>
      {error ? (
        <p className="text-center text-sm text-ink-400">{t.connecting}</p>
      ) : rows === null ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl2 border border-line bg-white px-4 py-3">
              <div className="h-8 w-8 rounded-full bg-paper-100" />
              <div className="h-3 flex-1 rounded bg-paper-100" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl2 border border-line bg-white p-8 text-center shadow-card">
          <p className="font-display text-lg font-bold text-ink-950">{t.emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">{t.emptyDesc}</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-line overflow-hidden rounded-xl2 border border-line bg-white shadow-card">
            {showRows.map((row) => (
              <li
                key={row.rank}
                className={`flex items-center gap-3 px-4 py-3 ${
                  row.is_you ? "bg-brass-400/10" : "bg-white"
                }`}
              >
                <span
                  className={`w-7 shrink-0 text-center font-display text-sm font-bold ${
                    row.rank <= 3 ? "text-brass-600" : "text-ink-400"
                  }`}
                >
                  {row.rank}
                </span>
                <Avatar name={row.display_name || row.username} url={row.avatar_url} isYou={row.is_you} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-800">
                  {row.display_name || row.username}
                  {row.is_you && (
                    <span className="ms-2 rounded-full bg-ink-950 px-2 py-0.5 text-[10px] font-bold uppercase text-brass-400">
                      {t.you}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-ink-400">
                  {row.earned_count} {t.lessons}
                </span>
                <span className="shrink-0 font-display text-sm font-bold text-brass-600">
                  {formatAmount(row.total_earned)} <span className="text-[11px] text-ink-400">{t.acad}</span>
                </span>
              </li>
            ))}
          </ul>
          {rows.length > visible && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setVisible((v) => v + 10)}
                className="rounded-full border border-ink-950/15 px-5 py-2 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-950/35"
              >
                {t.loadMore}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (variant === "teaser") {
    return (
      <div>
        <p className="eyebrow text-brass-400">{t.eyebrow}</p>
        <h2 className="mt-3 font-display text-2xl font-bold text-paper-50 md:text-3xl">{t.heading}</h2>
        <p className="mt-3 text-sm text-paper-100/70">{t.subhead}</p>

        <div className="mt-6">{content}</div>

        {rows !== null && rows.length > 0 && (
          <div className="mt-6">
            <Link
              href={`/${locale}/rewards`}
              className="inline-flex items-center gap-2 rounded-full bg-brass-400 px-6 py-2.5 text-sm font-semibold text-ink-950 shadow-card transition-colors hover:bg-brass-300"
            >
              {t.viewAll} →
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="py-20">
      <div className="container-content">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-center">{t.eyebrow}</p>
          <h2 className="mt-4 text-center font-display text-2xl font-bold md:text-3xl">{t.heading}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-ink-500">{t.subhead}</p>
          <div className="mt-10">{content}</div>
        </div>
      </div>
    </section>
  );
}
