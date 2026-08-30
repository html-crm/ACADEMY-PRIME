import { isLocale, defaultLocale, getDictionary } from "@/lib/i18n";
import { Locale } from "@/types/user";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { Tokenomics } from "@/components/home/Tokenomics";
import { EarnersLeaderboard } from "@/components/rewards/EarnersLeaderboard";

interface HomePageProps {
  params: { locale: string };
}

export default async function HomePage({ params }: HomePageProps) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const dict = await getDictionary(locale);

  return (
    <>
      <Hero copy={dict.home.hero} />
      <HowItWorks copy={dict.home.howItWorks} />
      <section className="border-b border-line bg-ink-950 py-24">
        <div className="container-content grid items-start gap-12 lg:grid-cols-2">
          <EarnersLeaderboard locale={locale} variant="teaser" limit={5} />
          <div className="flex flex-col items-start gap-6 lg:pt-16">
            <p className="eyebrow text-brass-400">
              {locale === "ar" ? "اكسب مع أكاديمية برايم" : "EARN WITH ACADEMY PRIME"}
            </p>
            <h2 className="font-display text-3xl font-bold leading-tight text-paper-50 md:text-4xl">
              {locale === "ar"
                ? "تعلّم، أكمل، وادخل في لوحة المتصدرين"
                : "Learn, complete, and climb the leaderboard"}
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-paper-100/70">
              {locale === "ar"
                ? "أكمل الدروس الموثقة لتكسب رموز ACAD-P. كل مشاهدة مؤهلة تضعك على الطريق لدخول لوحة أفضل المتعلمين."
                : "Complete verified lessons to earn ACAD-P tokens. Every eligible watch puts you on the path to the top of the leaderboard."}
            </p>
            <a
              href={`/${locale}/courses`}
              className="inline-flex items-center gap-2 rounded-full bg-brass-400 px-6 py-3 text-sm font-semibold text-ink-950 shadow-card transition-colors hover:bg-brass-300"
            >
              {locale === "ar" ? "ابدأ التعلّم" : "Start learning"} →
            </a>
          </div>
        </div>
      </section>
      <FeaturedCourses copy={dict.home.featuredCourses} locale={locale} />
      <Tokenomics locale={locale} />
    </>
  );
}
