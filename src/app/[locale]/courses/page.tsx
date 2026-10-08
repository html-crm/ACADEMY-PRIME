import { getDictionary } from "@/lib/i18n";
import { CourseCatalogExplorer } from "@/components/courses/CourseCatalogExplorer";

export const revalidate = 60;

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export default async function CoursesPage({ params }: { params: { locale: string } }) {
  const locale = params.locale === "ar" ? "ar" : "en";
  const dict = await getDictionary(locale);
  const t = dict.catalog.courses;

  return (
    <div className="bg-paper-50">
      <div className="container-content py-16 md:py-20">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="mt-3 max-w-2xl text-4xl leading-tight md:text-5xl">{t.headline}</h1>
        <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-500">{t.subhead}</p>
        <div className="mt-12">
          <CourseCatalogExplorer copy={t} locale={locale} />
        </div>
      </div>
    </div>
  );
}
