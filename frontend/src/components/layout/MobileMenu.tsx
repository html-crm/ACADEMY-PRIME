"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dictionary } from "@/lib/i18n";
import { Locale } from "@/types/user";
import { locales } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";

interface MobileMenuProps {
  locale: Locale;
  nav: Dictionary["common"]["nav"];
  language: Dictionary["common"]["language"];
  isLoggedIn: boolean;
  isAdmin: boolean;
  username?: string;
  onLogout: () => void;
}

export function MobileMenu({ locale, nav, language, isLoggedIn, isAdmin, username, onLogout }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const links: Array<[string, string]> = [
    [nav.home, `/${locale}`],
    [nav.learn, `/${locale}/learn`],
    [nav.courses, `/${locale}/courses`],
    [nav.longVideos, `/${locale}/videos`],
    [nav.shortVideos, `/${locale}/shorts`],
    [nav.experts, `/${locale}/experts`],
    [nav.rewards, `/${locale}/rewards`],
    [nav.about, `/${locale}/about`],
  ];

  function switchLocale(nextLocale: Locale) {
    if (!pathname) return;
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    router.push(segments.join("/") || `/${nextLocale}`);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-950/10"
      >
        <span aria-hidden className="flex flex-col gap-[5px]">
          <span className="block h-[1.5px] w-5 bg-ink-950" />
          <span className="block h-[1.5px] w-5 bg-ink-950" />
          <span className="block h-[1.5px] w-3.5 bg-ink-950" />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-ink-950/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative ms-auto flex h-full w-[82%] max-w-sm flex-col bg-paper-50 p-6 shadow-elevated">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-lg text-ink-950">ACADEMY PRIME</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-950/10 text-ink-800"
              >
                ✕
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {links.map(([label, href]) => {
                const isActive = pathname === href || (href !== `/${locale}` && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`rounded-lg px-3 py-3 text-base font-medium transition-all ${
                      isActive
                        ? "bg-ink-950/5 text-ink-950 shadow-navActive"
                        : "text-ink-900 hover:bg-ink-950/5"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-3 pt-6">
              <div className="flex items-center gap-2 rounded-lg border border-ink-950/10 px-3 py-2">
                <span className="text-xs text-ink-500">{language.label}:</span>
                {locales.map((loc) => (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => switchLocale(loc.code)}
                    className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                      loc.code === locale
                        ? "bg-ink-950 text-paper-50"
                        : "text-ink-600 hover:bg-ink-950/5"
                    }`}
                  >
                    {loc.nativeLabel}
                  </button>
                ))}
              </div>

              <a
                href="https://dexscreener.com/solana/fcpxrzsme4gaopjjurpyzkgjrtfgecxypua88178yxwx"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-full bg-brass-400 px-4 py-2.5 text-sm font-bold tracking-wide text-ink-950 shadow-card"
              >
                BUY NOW
              </a>

              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Button variant="secondary" href={`/${locale}/admin`} onClick={() => setOpen(false)}>
                      Admin
                    </Button>
                  )}
                  <Button variant="secondary" href={`/${locale}/dashboard`} onClick={() => setOpen(false)}>
                    {username}
                  </Button>
                  <button
                    onClick={() => { onLogout(); setOpen(false); }}
                    className="rounded-lg border border-ink-950/10 px-3 py-2.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-950"
                  >
                    {nav.login === "Log In" ? "Log out" : "تسجيل الخروج"}
                  </button>
                </>
              ) : (
                <>
                  <Button variant="secondary" href={`/${locale}/login`} onClick={() => setOpen(false)}>
                    {nav.login}
                  </Button>
                  <Button variant="primary" href={`/${locale}/register`} onClick={() => setOpen(false)}>
                    Join Free
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
