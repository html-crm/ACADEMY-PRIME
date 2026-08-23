import Link from "next/link";
import { Dictionary } from "@/lib/i18n";
import { Locale } from "@/types/user";

interface FooterProps {
  locale: Locale;
  dict: Dictionary;
}

export function Footer({ locale, dict }: FooterProps) {
  const { footer, brand, nav } = dict.common;

  const columns: Array<{ heading: string; links: Array<[string, string]> }> = [
    {
      heading: footer.product,
      links: [
        [nav.courses, `/${locale}/courses`],
        [nav.shortVideos, `/${locale}/short-videos`],
        [nav.rewards, `/${locale}/rewards`],
      ],
    },
    {
      heading: footer.company,
      links: [
        [nav.about, `/${locale}/about`],
        [nav.experts, `/${locale}/experts`],
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
          <span className="font-display text-lg text-paper-50">{brand.name}</span>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper-100/60">
            {brand.tagline}
          </p>
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
