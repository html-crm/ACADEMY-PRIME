"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, getAccessToken } from "@/lib/api";
import type { DashboardSummary } from "@/lib/api";
import type { Dictionary } from "@/lib/i18n";

interface JourneyCardProps {
  copy: Dictionary["learn"]["journey"];
  locale: string;
}

export function JourneyCard({ copy, locale }: JourneyCardProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      setChecked(true);
      return;
    }
    api
      .dashboard()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setChecked(true));
  }, []);

  if (!checked) return null;

  if (!summary) {
    return (
      <div className="rounded-xl2 border border-brass-300/40 bg-white p-8 text-center shadow-card md:p-12">
        <h3 className="font-display text-2xl md:text-3xl">{copy.guestHeading}</h3>
        <Link
          href={`/${locale}/register`}
          className="mt-6 inline-flex rounded-full bg-ink-950 px-7 py-3 text-sm font-semibold tracking-wide text-paper-50 shadow-card transition-colors hover:bg-ink-900"
        >
          {copy.createAccount}
        </Link>
      </div>
    );
  }

  const lessons = summary.lessons_completed;
  const courses = summary.courses_completed;
  const earned = Number(summary.total_earned);
  const pct = Math.min(100, Math.round(lessons * 10));

  return (
    <div className="rounded-xl2 border border-line bg-white p-8 shadow-card md:p-12">
      <h3 className="text-center font-display text-2xl md:text-3xl">{copy.memberHeading}</h3>
      <div className="mx-auto mt-8 max-w-xl">
        <div className="flex items-end justify-between">
          <span className="text-sm font-medium text-ink-500">{copy.overallProgress}</span>
          <span className="font-display text-4xl text-emerald-700">{pct}%</span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-paper-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-brass-400 transition-all duration-500"
            style={{ width: `${Math.max(pct, 2)}%` }}
          />
        </div>
      </div>
      <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-paper-50 p-4 text-center">
          <dt className="text-xs uppercase tracking-wide text-ink-300">{copy.lessonsCompleted}</dt>
          <dd className="mt-1 font-display text-2xl text-ink-950">{lessons}</dd>
        </div>
        <div className="rounded-lg border border-line bg-paper-50 p-4 text-center">
          <dt className="text-xs uppercase tracking-wide text-ink-300">{copy.coursesCompleted}</dt>
          <dd className="mt-1 font-display text-2xl text-ink-950">{courses}</dd>
        </div>
        <div className="rounded-lg border border-line bg-paper-50 p-4 text-center">
          <dt className="text-xs uppercase tracking-wide text-ink-300">{copy.rewardsEarned}</dt>
          <dd className="mt-1 font-display text-2xl text-emerald-700">⬡ {earned.toLocaleString()}</dd>
        </div>
      </dl>
      <div className="mt-8 text-center">
        <Link
          href={`/${locale}/courses`}
          className="inline-flex rounded-full bg-ink-950 px-7 py-3 text-sm font-semibold tracking-wide text-paper-50 shadow-card transition-colors hover:bg-ink-900"
        >
          {copy.continue}
        </Link>
      </div>
    </div>
  );
}
