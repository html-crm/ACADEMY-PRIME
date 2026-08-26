import { Locale, LocaleConfig } from "@/types/user";

/**
 * Single source of truth for supported locales.
 * To make Arabic the default later, reorder this array (or add a
 * `default: true` flag) — no component needs to change, since every
 * page reads its copy from the dictionary for the active locale.
 */
export const locales: LocaleConfig[] = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
];

export const defaultLocale: Locale = "ar";

export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale.code === value);
}

export function getLocaleConfig(locale: Locale): LocaleConfig {
  return locales.find((entry) => entry.code === locale) ?? locales[0]!;
}

type CommonDict = typeof import("@/locales/en/common.json");
type HomeDict = typeof import("@/locales/en/home.json");
type LearnDict = typeof import("@/locales/en/learn.json");
type CatalogDict = typeof import("@/locales/en/catalog.json");

export interface Dictionary {
  common: CommonDict;
  home: HomeDict;
  learn: LearnDict;
  catalog: CatalogDict;
}

const dictionaryLoaders: Record<Locale, () => Promise<Dictionary>> = {
  en: async () => ({
    common: (await import("@/locales/en/common.json")).default,
    home: (await import("@/locales/en/home.json")).default,
    learn: (await import("@/locales/en/learn.json")).default,
    catalog: (await import("@/locales/en/catalog.json")).default,
  }),
  ar: async () => ({
    common: (await import("@/locales/ar/common.json")).default,
    home: (await import("@/locales/ar/home.json")).default,
    learn: (await import("@/locales/ar/learn.json")).default,
    catalog: (await import("@/locales/ar/catalog.json")).default,
  }),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaryLoaders[locale] ?? dictionaryLoaders[defaultLocale];
  return loader();
}
