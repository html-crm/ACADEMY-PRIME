import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { api } from "@/lib/api";
import { videoService } from "@/services/videoService";
import { WatchClient } from "@/components/watch/WatchClient";

export default async function WatchPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const locale = params.locale === "ar" ? "ar" : "en";
  const dict = await getDictionary(locale);
  const video = await videoService.getVideo(params.id);

  if (!video) {
    return (
      <div className="container-content py-24">
        <p className="rounded-xl2 border border-dashed border-line bg-white p-12 text-center text-sm text-ink-300">
          Lesson not found.
        </p>
        <div className="mt-6 text-center">
          <Link href={`/${locale}/courses`} className="text-sm font-semibold text-brass-600 hover:underline">
            ← {dict.catalog.courses.headline}
          </Link>
        </div>
      </div>
    );
  }

  const relatedPage = await api.listVideos({ format: "long", exclude_in_course: true, page_size: 10 });
  const others = relatedPage.items.filter((item) => item.id !== video.id).slice(0, 4);

  return (
    <div className="bg-paper-50">
      <div className="container-content grid gap-10 py-10 lg:grid-cols-[1fr_340px] lg:py-14">
        <WatchClient video={video} locale={locale} />
        {others.length > 0 && (
          <aside className="space-y-4">
            <h2 className="font-display text-lg">{dict.catalog.courses.results}</h2>
            {others.map((item) => (
              <Link key={item.id} href={`/${locale}/watch/${item.id}`}>
                <article className="flex gap-3 rounded-xl border border-line bg-white p-3 shadow-card transition-shadow hover:shadow-elevated">
                  <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-ink-900">
                    {item.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.thumbnail_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink-950">{item.title}</h3>
                    <p className="mt-1 text-xs text-emerald-700">+{Number(item.effective_reward)} ACAD-P</p>
                  </div>
                </article>
              </Link>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}
