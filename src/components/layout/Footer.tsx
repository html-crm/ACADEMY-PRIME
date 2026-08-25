import Link from "next/link";
import Image from "next/image";
import { Dictionary } from "@/lib/i18n";
import { Locale } from "@/types/user";

interface FooterProps {
  locale: Locale;
  dict: Dictionary;
}

const SOCIALS = [
  { label: "X", href: "https://x.com/tokens100_CTO", icon: "X" },
  { label: "Telegram", href: "https://t.me/Tokns100_CTO", icon: "TG" },
  { label: "Instagram", href: "https://www.academy-prime.site/en", icon: "IG" },
];

export function Footer({ locale, dict }: FooterProps) {
  const { footer, brand, nav } = dict.common;

  const columns: Array<{ heading: string; links: Array<[string, string]> }> = [
    {
      heading: footer.product,
      links: [
        [nav.courses, `/${locale}/courses`],
        [nav.shortVideos, `/${locale}/shorts`],
        [nav.longVideos, `/${locale}/videos`],
        [nav.rewards, `/${locale}/rewards`],
      ],
    },
    {
      heading: footer.company,
      links: [
        [nav.about, `/${locale}/about`],
        [nav.experts, `/${locale}/experts`],
        [nav.learn, `/${locale}/learn`],
      ],
    },
    {
      heading: footer.legal,
      links: [
        ["Terms", `/${locale}/terms`],
        ["Privacy", `/${locale}/privacy`],
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-ink-950 text-paper-100">
      <div className="container-content grid gap-12 py-16 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <Image src="/logo.png" alt="Academy Prime" width={48} height={48} className="h-12 w-auto brightness-0 invert" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper-100/60">
            {brand.tagline}
          </p>

          <div className="mt-6 flex gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-xs font-semibold text-paper-100/70 transition-colors hover:border-brass-400 hover:text-brass-400"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.heading}>
            <h4 className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-paper-100/50">
              {column.heading}
            </h4>
            <ul className="mt-4 flex flex-col gap-2.5">
              {column.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-paper-100/80 hover:text-paper-50">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-content flex flex-col gap-2 py-6 text-xs text-paper-100/50 md:flex-row md:items-center md:justify-between">
          <span>
            © {new Date().getFullYear()} {brand.name}. {footer.rights}
          </span>
        </div>
      </div>
    </footer>
  );
}
