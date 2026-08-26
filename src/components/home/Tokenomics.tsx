"use client";

import { useMemo, useState } from "react";
import { Locale } from "@/types/user";

const COPY = {
  en: {
    eyebrow: "TRANSPARENCY",
    heading: "Tokenomics",
    subhead: "How every ACAD-P token is allocated.",
    centerTop: "ACAD-P",
    caption: "Total supply distribution",
  },
  ar: {
    eyebrow: "الشفافية",
    heading: "اقتصاد الرمز",
    subhead: "كيف يتم توزيع كل رمز ACAD-P.",
    centerTop: "ACAD-P",
    caption: "توزيع المعروض الكلي",
  },
};

const SLICES: Array<{ pct: number; color: string; en: string; ar: string; solscan?: string }> = [
  { pct: 30, color: "#C9A227", en: "Rewards", ar: "المكافآت", solscan: "https://solscan.io/account/HtXUEKD8nvzasa96JMgJSJ92cBRTAa3EAcB7wLAm5Yzz" },
  { pct: 20, color: "#1F2933", en: "Old Token Distribution", ar: "توزيع العملة القديمة", solscan: "https://solscan.io/account/6XTiJVSFzPEuuJ8B3qFbJ2cfxgGHmvJCfyexgTYmHAFz" },
  { pct: 20, color: "#2F80ED", en: "Pool", ar: "المجمع" },
  { pct: 10, color: "#27AE60", en: "Marketing", ar: "التسويق" },
  { pct: 10, color: "#9B51E0", en: "Treasury", ar: "الخزينة", solscan: "https://solscan.io/account/8f4nELPoMo8yozfYo9RM3vmzDaTEsSBuqmnNv4wmyXVk" },
  { pct: 10, color: "#EB5757", en: "Team", ar: "الفريق" },
];

const R = 70;
const CX = 100;
const CY = 100;
const STROKE = 56;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function Tokenomics({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const rtl = locale === "ar";
  const [hovered, setHovered] = useState<number | null>(null);

  const geometry = useMemo(() => {
    let acc = 0;
    return SLICES.map((s) => {
      const start = acc;
      acc += s.pct;
      const midRad = ((start + s.pct / 2) / 100) * 2 * Math.PI - Math.PI / 2;
      return {
        ...s,
        index0: start,
        dasharray: `${(s.pct / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`,
        dashoffset: -(start / 100) * CIRCUMFERENCE,
        tipX: CX + Math.cos(midRad) * R,
        tipY: CY + Math.sin(midRad) * R,
      };
    });
  }, []);

  const active = hovered !== null ? geometry[hovered] : null;

  return (
    <section className="border-b border-line bg-paper-50 py-24">
      <div className="container-content">
        <p className="eyebrow text-center">{t.eyebrow}</p>
        <h2 className="mx-auto mt-4 max-w-xl text-center text-3xl leading-tight text-ink-950 md:text-4xl">
          {t.heading}
        </h2>
        <p className="mt-3 text-center text-sm text-ink-500">{t.subhead}</p>

        <div className="mt-14 grid items-center gap-12 md:grid-cols-2">
          {/* Donut chart */}
          <div className="flex justify-center">
            <div className="relative h-[280px] w-[280px]">
              <svg viewBox="0 0 200 200" role="img" aria-label={t.heading} className="h-full w-full">
                {geometry.map((s, i) => (
                  <circle
                    key={s.en}
                    cx={CX}
                    cy={CY}
                    r={R}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={hovered === i ? STROKE + 10 : STROKE}
                    strokeDasharray={s.dasharray}
                    strokeDashoffset={s.dashoffset}
                    transform={`rotate(-90 ${CX} ${CY})`}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    className="cursor-pointer transition-all duration-200"
                    style={{
                      opacity: hovered === null || hovered === i ? 1 : 0.35,
                      filter: hovered === i ? "drop-shadow(0 6px 10px rgba(0,0,0,0.45))" : undefined,
                    }}
                  />
                ))}
              </svg>

              {/* Center label */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                {active ? (
                  <>
                    <span className="font-display text-2xl font-semibold text-ink-950">{active.pct}%</span>
                    <span className="mt-0.5 max-w-[110px] text-center text-[11px] leading-tight text-ink-500">
                      {rtl ? active.ar : active.en}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-display text-xl font-semibold text-ink-950">{t.centerTop}</span>
                    <span className="text-xs text-ink-500">100%</span>
                  </>
                )}
              </div>

              {/* Floating tooltip */}
              {active && (
                <div
                  className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-semibold text-ink-950 shadow-lg"
                  style={{ left: `${active.tipX / 2}%`, top: `${active.tipY / 2}%` }}
                >
                  {active.pct}% {rtl ? active.ar : active.en}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <ul className="mx-auto w-full max-w-md space-y-3" dir={rtl ? "rtl" : "ltr"}>
            {geometry.map((s, i) => (
              <li
                key={s.en}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-4 py-3 transition-all duration-200 ${
                  hovered === i ? "border-brass-400 shadow-md" : "border-line"
                }`}
                style={{ opacity: hovered === null || hovered === i ? 1 : 0.5 }}
              >
                <span
                  aria-hidden
                  className="h-3.5 w-3.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.solscan ? (
                  <a
                    href={s.solscan}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-medium text-brass-600 underline decoration-brass-400/40 transition-colors hover:text-brass-500 hover:decoration-brass-400"
                  >
                    {rtl ? s.ar : s.en} ↗
                  </a>
                ) : (
                  <span className="text-sm font-medium text-ink-800">{rtl ? s.ar : s.en}</span>
                )}
                <span className="ms-auto font-display text-base font-semibold text-ink-950">{s.pct}%</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 text-center text-xs uppercase tracking-wide text-ink-400">{t.caption}</p>
        <p className="mt-2 text-center text-xs text-ink-300">✓ Verified on Solscan · On-chain allocations</p>
      </div>
    </section>
  );
}
