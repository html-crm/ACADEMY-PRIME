import { isLocale, defaultLocale, getDictionary } from "@/lib/i18n";
import { Locale } from "@/types/user";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { Tokenomics } from "@/components/home/Tokenomics";

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
      <FeaturedCourses copy={dict.home.featuredCourses} locale={locale} />
      <Tokenomics locale={locale} />
    </>
  );
}
