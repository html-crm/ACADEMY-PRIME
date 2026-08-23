"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { locales } from "@/lib/i18n";
import { Locale } from "@/types/user";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  label: string;
}

export function LanguageSwitcher({ currentLocale, label }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(nextLocale: Locale) {
    setOpen(false);
    if (!pathname) return;
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    router.push(segments.join("/") || `/${nextLocale}`);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-ink-950/10 px-3.5 py-2 text-sm font-medium text-ink-800 transition-colors hover:border-ink-950/25"
      >
        <span aria-hidden className="text-xs">🌐</span>
        <span className="sr-only">{label}</span>
        {currentLocale.toUpperCase()}
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute end-0 top-[calc(100%+8px)] z-20 min-w-[160px] overflow-hidden rounded-xl border border-line bg-white shadow-elevated"
        >
          {locales.map((locale) => (
            <li key={locale.code}>
              <button
                type="button"
                role="option"
                aria-selected={locale.code === currentLocale}
                onClick={() => switchTo(locale.code)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-start text-sm text-ink-800 hover:bg-paper-100"
              >
                <span>{locale.nativeLabel}</span>
                {locale.code === currentLocale && (
                  <span aria-hidden className="text-emerald-600">✓</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
