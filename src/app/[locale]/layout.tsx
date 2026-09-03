import type { Metadata } from "next";
import { Fraunces, Inter, Markazi_Text, IBM_Plex_Sans_Arabic } from "next/font/google";
import clsx from "clsx";
import { isLocale, defaultLocale, getLocaleConfig, getDictionary, locales } from "@/lib/i18n";
import { Locale } from "@/types/user";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "@/components/session/SessionProvider";
import "@/app/globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const markaziText = Markazi_Text({
  subsets: ["arabic"],
  variable: "--font-display-ar",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-body-ar",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale: locale.code }));
}

export const metadata: Metadata = {
  metadataBase: new URL("https://www.academy-prime.site"),
  title: {
    default: "ACADEMY PRIME — Learn to Earn",
    template: "%s · ACADEMY PRIME",
  },
  description:
    "Learn crypto, blockchain, Web3, DeFi and more. Complete educational content, earn ACAD-P rewards, and withdraw to your wallet on ACADEMY PRIME.",
  keywords: [
    "learn to earn",
    "crypto education",
    "blockchain course",
    "Web3",
    "DeFi",
    "bitcoin course",
    "earn crypto learning",
    "academy prime",
    "أكاديمية برايم",
    "تعلم واربح",
  ],
  applicationName: "ACADEMY PRIME",
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      ar: "/ar",
    },
  },
  openGraph: {
    type: "website",
    siteName: "ACADEMY PRIME",
    locale: "en_US",
    alternateLocale: "ar_SA",
    title: "ACADEMY PRIME — Learn to Earn",
    description:
      "Learn about crypto and blockchain, complete courses, and earn ACAD-P rewards that you withdraw to your wallet.",
    url: "https://www.academy-prime.site/",
  },
  twitter: {
    card: "summary_large_image",
    title: "ACADEMY PRIME — Learn to Earn",
    description:
      "Learn crypto and blockchain and earn rewards. The Learn-to-Earn crypto education platform.",
  },
};

const SITE_URL = "https://www.academy-prime.site";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const { dir } = getLocaleConfig(locale);
  const dict = await getDictionary(locale);

  const siteLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ACADEMY PRIME",
    alternateName: "Academic Prime",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      "Learn to Earn crypto education platform. Watch educational videos on crypto, blockchain, Web3 and DeFi to earn ACAD-P token rewards.",
  };

  const webSiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ACADEMY PRIME",
    url: `${SITE_URL}/${locale}`,
    inLanguage: locale,
    description:
      "Watch educational lessons, complete courses, and earn ACAD-P token rewards you can withdraw to your wallet.",
  };

  return (
    <html
      lang={locale}
      dir={dir}
      className={clsx(
        fraunces.variable,
        inter.variable,
        markaziText.variable,
        plexArabic.variable,
      )}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteLd) }}
        />
        <SessionProvider>
          <Navbar locale={locale} dict={dict} />
          <main>{children}</main>
          <Footer locale={locale} dict={dict} />
        </SessionProvider>
      </body>
    </html>
  );
}
