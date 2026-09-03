import Link from "next/link";
import Image from "next/image";
import { Dictionary } from "@/lib/i18n";
import { Locale } from "@/types/user";

interface FooterProps {
  locale: Locale;
  dict: Dictionary;
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "X", href: "https://x.com/tokens100_CTO", Icon: XIcon },
  { label: "Telegram", href: "https://t.me/Tokns100_CTO", Icon: TelegramIcon },
  { label: "Instagram", href: "https://www.academy-prime.site/en", Icon: InstagramIcon },
];

export function Footer({ locale, dict }: FooterProps) {
  const { footer, brand, nav } = dict.common;

  const columns: Array<{ heading: string; links: Array<[string, string]> }> = [
    {
      heading: footer.product,
      links: [
        [nav.courses, `/${locale}/courses`],
        [nav.videoLibrary, `/${locale}/library`],
        [nav.rewards, `/${locale}/rewards`],
      ],
    },
    {
      heading: footer.company,
      links: [
        [nav.about, `/${locale}/about`],
        [nav.partners, `/${locale}/partners`],
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
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-paper-100/70 transition-colors hover:border-brass-400 hover:text-brass-400"
              >
                <s.Icon />
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
