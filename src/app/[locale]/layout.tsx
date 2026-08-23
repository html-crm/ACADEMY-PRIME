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
  title: "ACADEMY PRIME — Learn to Earn",
  description:
    "Learn about crypto, blockchain, Web3, DeFi and more. Complete educational content and earn rewards through ACADEMY PRIME.",
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const { dir } = getLocaleConfig(locale);
  const dict = await getDictionary(locale);

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
        <SessionProvider>
          <Navbar locale={locale} dict={dict} />
          <main>{children}</main>
          <Footer locale={locale} dict={dict} />
        </SessionProvider>
      </body>
    </html>
  );
}
