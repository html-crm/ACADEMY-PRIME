import { getDictionary } from "@/lib/i18n";
import { ShortsFeed } from "@/components/shorts/ShortsFeed";

export default async function ShortsPage({ params }: { params: { locale: string } }) {
  const locale = params.locale === "ar" ? "ar" : "en";
  const dict = await getDictionary(locale);
  const t = dict.catalog.shorts;

  return (
    <div className="bg-paper-100">
      <div className="container-content py-14 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="mt-3 text-4xl leading-tight md:text-5xl">{t.headline}</h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-ink-500">{t.subhead}</p>
          <p className="mt-3 inline-flex rounded-full border border-brass-400/50 bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-brass-600">
            ⏱ {t.maxDurationNote}
          </p>
        </div>
        <div className="mt-12">
          <ShortsFeed copy={t} locale={locale} />
        </div>
      </div>
    </div>
  );
}
