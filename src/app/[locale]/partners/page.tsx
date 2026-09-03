"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Partner } from "@/lib/api";

const COPY = {
  en: {
    eyebrow: "Academy Prime",
    heading: "Partners",
    subhead: "Meet the organizations powering the Academy Prime ecosystem.",
    empty: "No partners yet. Check back soon!",
    loadError: "Could not load partners. Is the API running?",
    visit: "Visit website",
    expertsHeading: "Explore the Experts",
    expertsSub: "Learn from our expert contributors and their quick takes.",
    expertsCta: "Go to Experts",
  },
  ar: {
    eyebrow: "أكاديمية برايم",
    heading: "الشركاء",
    subhead: "تعرّف على المنظمات التي تدعم نظام أكاديمية برايم.",
    empty: "لا يوجد شركاء بعد. عود قريباً!",
    loadError: "تعذّر تحميل الشركاء. هل الخدمة تعمل؟",
    visit: "زيارة الموقع",
    expertsHeading: "اكتشف الخبراء",
    expertsSub: "تعلّم من مساهمينا الخبراء ونصائحهم السريعة.",
    expertsCta: "انتقل إلى الخبراء",
  },
};

export default function PartnersPage({ params }: { params: { locale: string } }) {
  const locale = params.locale === "ar" ? "ar" : "en";
  const t = COPY[locale];
  const rtl = locale === "ar";
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listPartners()
      .then((items) => setPartners(items))
      .catch(() => {
        setError(t.loadError);
        setPartners([]);
      });
  }, [t.loadError]);

  return (
    <main className="min-h-screen bg-paper-100 pb-20" dir={rtl ? "rtl" : "ltr"}>
      <div className="container-content pt-14 md:pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{t.heading}</h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-500">{t.subhead}</p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {partners === null ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-paper-200" />
            ))}
          </div>
        ) : partners.length === 0 ? (
          <p className="mx-auto mt-12 max-w-md rounded-xl border border-dashed border-line bg-paper-50 p-12 text-center text-sm text-ink-500">
            {t.empty}
          </p>
        ) : (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <div
                key={p.id}
                className="flex flex-col rounded-xl border border-line bg-paper-50 p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex h-20 items-center justify-center bg-paper-100">
                  {p.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.logo_url}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="font-display text-3xl font-semibold text-brass-600">
                      {p.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-ink-950">{p.name}</h2>
                {p.description && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{p.description}</p>
                )}
                {p.website_url && (
                  <a
                    href={p.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center justify-center rounded-lg border border-brass-400/50 bg-white px-4 py-2 text-sm font-semibold text-brass-600 transition-colors hover:bg-brass-50"
                  >
                    {t.visit}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <section className="mt-16 rounded-2xl border border-line bg-white p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-ink-950">{t.expertsHeading}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">{t.expertsSub}</p>
          <Link
            href={`/${locale}/expert`}
            className="mt-5 inline-block rounded-lg bg-brass-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brass-700"
          >
            {t.expertsCta}
          </Link>
        </section>
      </div>
    </main>
  );
}
