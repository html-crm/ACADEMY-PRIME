"use client";

import { usePathname } from "next/navigation";
import { defaultLocale, isLocale } from "@/lib/i18n";
import { Locale } from "@/types/user";

/**
 * Reads the active locale from the first URL segment.
 * Client components that already receive `locale` as a prop from a
 * server component do not need this — prefer prop drilling where the
 * data already flows through a server component.
 */
export function useLocale(): Locale {
  const pathname = usePathname();
  const segment = pathname?.split("/")[1] ?? "";
  return isLocale(segment) ? segment : defaultLocale;
}
