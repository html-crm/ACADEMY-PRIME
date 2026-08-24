"use client";

import { useState } from "react";
import Link from "next/link";
import { Dictionary } from "@/lib/i18n";
import { Locale } from "@/types/user";
import { Button } from "@/components/ui/Button";

interface MobileMenuProps {
  locale: Locale;
  nav: Dictionary["common"]["nav"];
}

export function MobileMenu({ locale, nav }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

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
              {links.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-ink-900 hover:bg-ink-950/5"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-3 pt-8">
              <Button variant="secondary" href={`/${locale}/login`}>
                {nav.login}
              </Button>
              <Button variant="primary" href={`/${locale}/wallet`}>
                {nav.connectWallet}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
