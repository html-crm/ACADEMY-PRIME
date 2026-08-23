"use client";

import Link from "next/link";
import { Dictionary } from "@/lib/i18n";
import { Locale } from "@/types/user";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useSession } from "@/components/session/SessionProvider";

interface NavbarProps {
  locale: Locale;
  dict: Dictionary;
}

export function Navbar({ locale, dict }: NavbarProps) {
  const { nav, language, brand } = dict.common;
  const { me, logout } = useSession();

  const links: Array<[string, string]> = [
    [nav.home, `/${locale}`],
    [nav.learn, `/${locale}/learn`],
    [nav.courses, `/${locale}/courses`],
    [nav.shortVideos, `/${locale}/shorts`],
    [nav.experts, `/${locale}/experts`],
    [nav.rewards, `/${locale}/rewards`],
    [nav.about, `/${locale}/about`],
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper-50/90 backdrop-blur-md">
      <div className="container-content flex h-[76px] items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-md bg-ink-950 font-display text-sm text-brass-300"
          >
            A
          </span>
          <span className="font-display text-[15px] font-medium tracking-wide text-ink-950">
            {brand.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="text-[13.5px] font-medium text-ink-700 transition-colors hover:text-ink-950"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <LanguageSwitcher currentLocale={locale} label={language.label} />
          </div>
          {me ? (
            <>
              {me.role === "admin" && (
                <Link href={`/${locale}/admin`} className="hidden text-[13px] font-semibold text-brass-600 hover:underline md:block">
                  Admin
                </Link>
              )}
              <Link href={`/${locale}/expert`} className="hidden text-[13px] font-semibold text-brass-600 hover:underline md:block">
                Studio
              </Link>
              <Button variant="secondary" href={`/${locale}/dashboard`} className="hidden md:inline-flex">
                {me.username}
              </Button>
              <button
                onClick={logout}
                className="hidden text-[13px] font-medium text-ink-500 transition-colors hover:text-ink-950 md:block"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Button variant="secondary" href={`/${locale}/login`} className="hidden md:inline-flex">
                {nav.login}
              </Button>
              <Button variant="primary" href={`/${locale}/register`} className="hidden md:inline-flex">
                Join Free
              </Button>
            </>
          )}
          <MobileMenu locale={locale} nav={nav} />
        </div>
      </div>
    </header>
  );
}
