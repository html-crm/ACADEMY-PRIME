import { getDictionary } from "@/lib/i18n";
import { CategoryLanding } from "@/components/catalog/CategoryLanding";

export const revalidate = 60;

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export default async function SecurityPage({ params }: { params: { locale: string } }) {
  const locale = params.locale === "ar" ? "ar" : "en";
  const dict = await getDictionary(locale);
  const item = dict.home.categoryNav.items[0]!;

  return (
    <CategoryLanding
      eyebrow={dict.home.categoryNav.eyebrow}
      title={item.title}
      description={item.description}
      catalogCopy={dict.catalog.courses}
      locale={locale}
      exploreLabel={dict.home.categoryNav.viewAll}
    />
  );
}