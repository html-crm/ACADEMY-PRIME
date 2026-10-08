import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

interface Props {
  copy: Dictionary["home"]["categoryNav"];
  locale: string;
}

const SLUGS = [
  "security",
  "courses",
  "learn-and-earn",
  "prime-product-guides",
  "learn-btc",
] as const;

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M12 3l7 3v5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CoursesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M4 6a2 2 0 0 1 2-2h14v16H6a2 2 0 0 1-2-2z" />
      <path d="M4 6v10" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}

function LearnEarnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M22 9 12 4 2 9l10 5z" />
      <path d="M6 11.5V16c3 2 9 2 12 0v-4.5" />
      <path d="M22 9l-10 5L2 9" />
      <circle cx="19" cy="19" r="2.2" />
      <path d="M19 22v-1M19 15v-1M17.8 17h1.2a.9.9 0 1 1 0 1.8h-1.2M18 18h1.2a.9.9 0 1 1 0 1.8h-1.2" />
    </svg>
  );
}

function GuidesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </svg>
  );
}

function LearnBtcIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
      <text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" stroke="none">
        ₿
      </text>
    </svg>
  );
}

const ICONS = [ShieldIcon, CoursesIcon, LearnEarnIcon, GuidesIcon, LearnBtcIcon];

export function HomeCategoryNav({ copy, locale }: Props) {
  return (
    <section className="border-b border-line bg-paper-50 py-20 md:py-24">
      <div className="container-content">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">{copy.eyebrow}</p>
            <h2 className="mt-4 max-w-xl font-display text-3xl font-bold leading-tight text-ink-950 md:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-500">{copy.subtitle}</p>
          </div>
          <Link
            href={`/${locale}/courses`}
            className="shrink-0 rounded-full border border-line bg-white px-6 py-3 text-sm font-semibold text-ink-950 shadow-card transition-colors hover:border-brass-400 hover:text-brass-600"
          >
            {copy.viewAll} →
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {copy.items.map((item, index) => {
            const Icon = ICONS[index] ?? ShieldIcon;
            const href = `/${locale}/${SLUGS[index] ?? "courses"}`;
            return (
              <Link
                key={item.title}
                href={href}
                className="group flex aspect-square flex-col items-center justify-center gap-2.5 overflow-hidden rounded-3xl border border-line bg-white p-4 text-center shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brass-400/70 hover:shadow-elevated"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brass-400/15 text-brass-600 transition-colors group-hover:bg-brass-400 group-hover:text-ink-950">
                  <Icon />
                </span>
                <h3 className="line-clamp-2 shrink-0 font-display text-base font-semibold leading-tight text-ink-950">
                  {item.title}
                </h3>
                <p className="line-clamp-2 shrink-0 text-[13px] leading-relaxed text-ink-500">{item.description}</p>
                <span className="max-h-0 shrink-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-h-6 group-hover:opacity-100">
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brass-600">
                    {locale === "ar" ? "استكشف" : "Explore"} →
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}