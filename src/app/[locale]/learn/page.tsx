import { Dictionary } from "@/lib/i18n";
import { Locale } from "@/types/user";
import { Button } from "@/components/ui/Button";
import { JourneyCard } from "@/components/learn/JourneyCard";

interface LearnPageProps {
  params: { locale: string };
}

function SectionHeading({
  eyebrow,
  heading,
  body,
}: {
  eyebrow?: string;
  heading: string;
  body?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl leading-tight md:text-4xl">{heading}</h2>
      {body && <p className="mt-5 text-[15.5px] leading-relaxed text-ink-500">{body}</p>}
    </div>
  );
}

export default async function LearnPage({ params }: LearnPageProps) {
  const locale = (params.locale === "ar" ? "ar" : "en") as Locale;
  const dict = await getDictionarySafe(locale);
  const t = dict.learn;

  return (
    <>
      {/* ── 1. HERO ─────────────────────────────────────────────── */}
      <section className="border-b border-line bg-paper-50">
        <div className="container-content py-20 text-center md:py-28">
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl leading-[1.06] tracking-tight md:text-6xl">
            {t.hero.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-display text-lg text-brass-600 md:text-xl">
            {t.hero.subhead}
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-[15.5px] leading-relaxed text-ink-500">
            {t.hero.body}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" href={`/${locale}/courses`}>
              {t.hero.ctaPrimary}
            </Button>
            <Button variant="secondary" href={`/${locale}/courses`}>
              {t.hero.ctaSecondary}
            </Button>
          </div>
        </div>
      </section>

      {/* ── 2. IMPORTANT MESSAGE ────────────────────────────────── */}
      <section className="bg-white py-20 md:py-24">
        <div className="container-content">
          <SectionHeading heading={t.message.headline} body={t.message.body} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {t.message.cards.map((card) => (
              <article
                key={card.title}
                className="rounded-xl2 border border-line bg-paper-50 p-8 shadow-card transition-shadow hover:shadow-elevated"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink-950 font-display text-brass-300">
                  {card.title.slice(0, 1)}
                </span>
                <h3 className="mt-5 font-display text-xl">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. OPPORTUNITY / RISK SPLIT ─────────────────────────── */}
      <section className="bg-ink-950 py-20 text-paper-50 md:py-24">
        <div className="container-content">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass-300">
              {t.risk.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl leading-tight text-paper-50 md:text-4xl">
              {t.risk.headline}
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-paper-100/60">{t.risk.body}</p>
          </div>

          <div className="mx-auto mt-14 max-w-4xl">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl2 border border-emerald-500/30 bg-emerald-500/10 p-8">
                <h3 className="font-display text-lg text-emerald-500">▲ {t.risk.opportunityTitle}</h3>
                <ul className="mt-5 space-y-3">
                  {t.risk.opportunityItems.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-paper-100/85">
                      <span aria-hidden className="text-emerald-500">◆</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl2 border border-red-400/30 bg-red-400/10 p-8">
                <h3 className="font-display text-lg text-red-300">▼ {t.risk.riskTitle}</h3>
                <ul className="mt-5 space-y-3">
                  {t.risk.riskItems.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-paper-100/85">
                      <span aria-hidden className="text-red-300">◆</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-6 text-center font-display text-sm tracking-wide text-brass-300">
              {t.scam.lesson}
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. WHY LEARNING MATTERS ─────────────────────────────── */}
      <section className="bg-paper-100 py-20 md:py-24">
        <div className="container-content">
          <SectionHeading heading={t.why.heading} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.why.cards.map((card) => (
              <article
                key={card.number}
                className="flex flex-col rounded-xl2 border border-line bg-white p-7 shadow-card"
              >
                <span className="font-display text-sm tracking-[0.2em] text-brass-500">{card.number}</span>
                <h3 className="mt-3 font-display text-lg">{card.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">{card.body}</p>
                {card.note && (
                  <p className="mt-5 rounded-lg bg-ink-950 px-4 py-3 text-center text-xs font-bold tracking-wide text-brass-300">
                    {card.note}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. SCAM AWARENESS + CHECKLIST ───────────────────────── */}
      <section className="bg-white py-20 md:py-24">
        <div className="container-content grid items-start gap-12 lg:grid-cols-2">
          <div>
            <h2 className="max-w-md text-3xl leading-tight md:text-4xl">{t.scam.headline}</h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-500">{t.scam.body}</p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {t.scam.phrases.map((phrase) => (
                <span
                  key={phrase}
                  className="rounded-full border border-red-300/60 bg-red-50 px-4 py-1.5 text-xs font-medium text-red-700"
                >
                  {phrase}
                </span>
              ))}
            </div>
            <p className="mt-8 font-display text-lg text-emerald-700">{t.scam.lesson}</p>
          </div>
          <aside className="rounded-xl2 border border-ink-950/15 bg-ink-950 p-8 text-paper-50 shadow-elevated md:p-10">
            <h3 className="font-display text-lg text-brass-300">{t.scam.checklistTitle}</h3>
            <ul className="mt-6 space-y-4">
              {t.scam.checklist.map((item, index) => (
                <li key={item} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brass-400/20 font-display text-xs text-brass-300">
                    ?
                  </span>
                  <span className="text-[15px] font-medium leading-relaxed">{item}</span>
                  <span aria-hidden className="ms-auto text-ink-500">{String(index + 1).padStart(2, "0")}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* ── 6. STOP → CHECK → VERIFY ────────────────────────────── */}
      <section className="bg-paper-100 py-20 md:py-24">
        <div className="container-content">
          <div className="grid gap-6 md:grid-cols-3">
            {t.stopCheckVerify.steps.map((step, index) => (
              <div key={step.title} className="relative rounded-xl2 border border-line bg-white p-8 text-center shadow-card">
                <span className="font-display text-5xl text-brass-400">{index + 1}</span>
                <h3 className="mt-4 font-display text-2xl tracking-wide">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">{step.body}</p>
                {index < 2 && (
                  <span
                    aria-hidden
                    className="absolute end-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 font-display text-2xl text-brass-400 md:block"
                  >
                    {params.locale === "ar" ? "←" : "→"}
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-10 text-center font-display text-lg tracking-wide text-ink-950 md:text-xl">
            {t.stopCheckVerify.flow}
          </p>
        </div>
      </section>

      {/* ── 16. CRYPTO SAFETY JOURNEY MAP ───────────────────────── */}
      <section className="border-y border-line bg-white py-20 md:py-24">
        <div className="container-content">
          <SectionHeading eyebrow={t.journeyMap.eyebrow} heading={t.journeyMap.heading} />
          <ol className="mx-auto mt-12 max-w-3xl space-y-0">
            {t.journeyMap.steps.map((step, index) => (
              <li key={step}>
                <div className="flex items-center gap-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brass-400 bg-brass-400/10 font-display text-xs text-brass-600">
                    {index + 1}
                  </span>
                  <span className="font-display text-base tracking-wide text-ink-900 md:text-lg">{step}</span>
                </div>
                {index < t.journeyMap.steps.length - 1 && (
                  <div aria-hidden className="ms-[17px] h-7 w-px bg-gradient-to-b from-brass-400 to-line" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 7. LEARNING PATH ────────────────────────────────────── */}
      <section className="bg-paper-50 py-20 md:py-24">
        <div className="container-content">
          <SectionHeading heading={t.path.heading} />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {t.path.levels.map((level, index) => (
              <article
                key={level.level}
                className={`flex flex-col rounded-xl2 border p-6 shadow-card transition-shadow hover:shadow-elevated ${
                  index === 0 ? "border-brass-400/60 bg-white" : "border-line bg-white"
                }`}
              >
                <span className={`text-xs font-bold tracking-[0.16em] ${index === 0 ? "text-brass-600" : "text-ink-300"}`}>
                  {level.level}
                </span>
                <h3 className="mt-2 font-display text-base leading-snug">{level.title}</h3>
                <ul className="mt-4 flex-1 space-y-2">
                  {level.topics.slice(0, 6).map((topic) => (
                    <li key={topic} className="flex items-start gap-2 text-xs leading-relaxed text-ink-500">
                      <span aria-hidden className="mt-1 text-brass-400">·</span> {topic}
                    </li>
                  ))}
                </ul>
                <Button variant={index === 0 ? "primary" : "ghost"} href={`/${locale}/courses`} className="!mt-6 !w-full !px-4 !py-2.5 !text-xs">
                  {level.cta}
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. LEARNING PROGRESS / JOURNEY ──────────────────────── */}
      <section className="bg-paper-100 py-20 md:py-24">
        <div className="container-content">
          <JourneyCard copy={t.journey} locale={locale} />
        </div>
      </section>

      {/* ── 11. EDUCATION VS BLIND TRUST ────────────────────────── */}
      <section className="bg-white py-20 md:py-24">
        <div className="container-content">
          <SectionHeading heading={t.compare.heading} />
          <div className="mx-auto mt-12 grid max-w-4xl overflow-hidden rounded-xl2 border border-line shadow-card md:grid-cols-2">
            <div className="bg-paper-100 p-8 md:p-10">
              <h3 className="font-display text-lg text-ink-500">{t.compare.withoutTitle}</h3>
              <ul className="mt-6 space-y-3.5">
                {t.compare.withoutItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ink-500">
                    <span aria-hidden className="mt-0.5 text-ink-300">○</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-emerald-600/20 bg-emerald-500/[0.07] p-8 md:border-t-0 md:border-s md:p-10">
              <h3 className="font-display text-lg text-emerald-700">{t.compare.withTitle}</h3>
              <ul className="mt-6 space-y-3.5">
                {t.compare.withItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-medium text-ink-800">
                    <span aria-hidden className="mt-0.5 text-emerald-600">●</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. SECURITY MESSAGE ────────────────────────────────── */}
      <section className="bg-ink-950 py-20 text-paper-50 md:py-24">
        <div className="container-content mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl text-brass-300 md:text-4xl">{t.security.headline}</h2>
          <p className="mt-5 text-[15px] leading-relaxed text-paper-100/70">{t.security.body}</p>
          <ul className="mx-auto mt-9 max-w-xl space-y-3 text-start">
            {t.security.rules.map((rule) => (
              <li key={rule} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 px-5 py-3 text-sm text-paper-100/90">
                <span aria-hidden className="mt-0.5 text-brass-300">✓</span> {rule}
              </li>
            ))}
          </ul>
          <p className="mt-9 text-xs leading-relaxed text-paper-100/40">{t.security.disclaimer}</p>
        </div>
      </section>

      {/* ── 10. LEARN → EARN FLOW ───────────────────────────────── */}
      <section className="bg-paper-100 py-20 md:py-24">
        <div className="container-content">
          <SectionHeading
            eyebrow={dict.catalog.shorts.eyebrow}
            heading={dict.home.howItWorks.heading}
          />
          <div className="mt-12 flex flex-wrap items-stretch justify-center gap-3">
            {["LEARN", "WATCH", "COMPLETE", "VERIFY", "EARN"].map((step, index, arr) => (
              <div key={step} className="flex items-center gap-3">
                <span
                  className={`rounded-full px-6 py-3 font-display text-sm tracking-[0.14em] ${
                    step === "VERIFY"
                      ? "bg-brass-400 text-ink-950 shadow-card"
                      : step === "EARN"
                        ? "bg-emerald-600 text-white shadow-card"
                        : "border border-line bg-white text-ink-950"
                  }`}
                >
                  {step}
                </span>
                {index < arr.length - 1 && (
                  <span aria-hidden className="hidden font-display text-brass-400 md:inline">
                    {params.locale === "ar" ? "←" : "→"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 15. FINAL CALL TO ACTION ────────────────────────────── */}
      <section className="border-t border-line bg-paper-50 py-20 md:py-28">
        <div className="container-content text-center">
          <h2 className="mx-auto max-w-2xl text-4xl leading-tight md:text-5xl">{t.finalCta.headline}</h2>
          <p className="mx-auto mt-6 max-w-xl text-[15.5px] leading-relaxed text-ink-500">
            {t.finalCta.body}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Button variant="primary" href={`/${locale}/register`}>
              {t.finalCta.ctaPrimary}
            </Button>
            <Button variant="secondary" href={`/${locale}/courses`}>
              {t.finalCta.ctaSecondary}
            </Button>
          </div>
          <p className="mt-12 font-display text-sm tracking-[0.22em] text-brass-600">{t.finalCta.closing}</p>
        </div>
      </section>
    </>
  );
}

async function getDictionarySafe(locale: Locale): Promise<Dictionary> {
  const { getDictionary } = await import("@/lib/i18n");
  return getDictionary(locale);
}
