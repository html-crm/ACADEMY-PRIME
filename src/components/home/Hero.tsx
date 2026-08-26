import { Dictionary } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";

interface HeroProps {
  copy: Dictionary["home"]["hero"];
}

const transcriptRows = [
  { title: "Blockchain Fundamentals", reward: 120 },
  { title: "Wallet & Custody Security", reward: 90 },
  { title: "DeFi Essentials", reward: 180, pending: true },
];

export function Hero({ copy }: HeroProps) {
  return (
    <section className="overflow-hidden bg-paper-50">
      <div className="container-content grid items-center gap-16 py-20 md:grid-cols-2 md:py-28">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 className="mt-4 max-w-lg text-[2.6rem] leading-[1.08] tracking-tight md:text-[3.2rem]">
            {copy.headline}
          </h1>
          <p className="mt-6 max-w-md text-[15.5px] leading-relaxed text-ink-500">
            {copy.subhead}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Button variant="primary" href="#courses">
              {copy.ctaPrimary}
            </Button>
            <Button variant="secondary" href="#courses">
              {copy.ctaSecondary}
            </Button>
          </div>
          <div className="mt-7 flex justify-center md:justify-start">
            <a
              href="https://dexscreener.com/solana/fcpxrzsme4gaopjjurpyzkgjrtfgecxypua88178yxwx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full bg-brass-400 px-6 py-2.5 text-sm font-bold tracking-wide text-ink-950 shadow-card transition-colors hover:bg-brass-300"
            >
              BUY NOW
            </a>
          </div>
        </div>

        {/* Signature element: a verified-transcript card — the education
            record and the reward, made legible in one artifact. */}
        <div className="relative mx-auto w-full max-w-[420px]">
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-[28px] bg-gradient-to-br from-brass-300/25 via-transparent to-emerald-500/15"
          />
          <div className="rounded-xl2 border border-ink-950/10 bg-white p-7 shadow-elevated">
            <div className="flex items-center justify-between border-b border-dashed border-ink-950/15 pb-5">
              <div>
                <p className="font-display text-[15px] text-ink-950">{copy.transcriptTitle}</p>
                <p className="mt-1 text-xs text-ink-500">{copy.transcriptSubtitle}</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brass-400/60 bg-brass-300/15 font-display text-brass-600">
                A
              </span>
            </div>

            <ul className="mt-5 flex flex-col gap-4">
              {transcriptRows.map((row) => (
                <li key={row.title} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className={
                        row.pending
                          ? "flex h-6 w-6 items-center justify-center rounded-full border border-ink-950/15 text-[11px] text-ink-300"
                          : "flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-[11px] text-white"
                      }
                    >
                      {row.pending ? "…" : "✓"}
                    </span>
                    <span className="text-[13.5px] text-ink-800">{row.title}</span>
                  </div>
                  <span
                    className={
                      row.pending
                        ? "text-[13px] font-medium text-ink-300"
                        : "text-[13px] font-semibold text-emerald-700"
                    }
                  >
                    +{row.reward} ACAD-P
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t border-dashed border-ink-950/15 pt-5 text-xs text-ink-500">
              <span>{copy.transcriptFooter}</span>
              <span className="font-mono text-[11px] tracking-tight text-ink-300">
                0x8f...c31b
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
