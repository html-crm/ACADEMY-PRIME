import { getDictionary } from "@/lib/i18n";
import { LibraryBrowser } from "@/components/library/LibraryBrowser";

export default async function LibraryPage({ params }: { params: { locale: string } }) {
  const locale: "en" | "ar" = params.locale === "ar" ? "ar" : "en";
  const dict = await getDictionary(locale);

  return (
    <main className="min-h-screen bg-paper-100 pb-20">
      <div className="container-content pt-12">
        <h1 className="font-display text-3xl font-semibold text-ink-950">{dict.common.nav.videoLibrary}</h1>
        <p className="mt-1 text-sm text-ink-500">{dict.catalog.shorts.subhead}</p>
      </div>
      <div className="mt-8">
        <LibraryBrowser
          locale={locale}
          shortsCopy={dict.catalog.shorts}
          longLabel={dict.common.nav.longVideos}
          shortLabel={dict.common.nav.shortVideos}
        />
      </div>
    </main>
  );
}
