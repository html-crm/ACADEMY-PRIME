import Link from "next/link";
import { Locale } from "@/types/user";

const COPY = {
  en: {
    eyebrow: "ACADEMY PRIME — REWARDS SYSTEM",
    heroTitle: "LEARN. COMPLETE. EARN.",
    heroSub: "Learn crypto. Complete educational content. Earn ACAD-P.",
    heroDesc:
      "Every eligible video on ACADEMY PRIME gives you the opportunity to earn 0.001 ACAD-P after successfully completing the required viewing and verification process.",
    howItWorks: "HOW IT WORKS",
    step1Title: "CHOOSE",
    step1Desc: "Choose an eligible educational video.",
    step2Title: "WATCH",
    step2Desc: "Watch the video completely according to the required completion rules.",
    step3Title: "COMPLETE",
    step3Desc: "Finish the lesson and any required verification.",
    step4Title: "EARN",
    step4Desc: "Once your completion is verified, you qualify for:",
    rewardAmount: "0.001 ACAD-P",
    simpleFlow: "SIMPLE FLOW",
    flowText: "WATCH → COMPLETE → VERIFY → EARN",
    yourLearning: "YOUR LEARNING HAS A REWARD",
    yourLearningDesc:
      "The more eligible educational content you complete, the more opportunities you have to earn ACAD-P.",
    tableHeader1: "Completed Videos",
    tableHeader2: "Reward",
    formula: "Reward calculation:",
    formulaCode: "Completed eligible videos × 0.001 ACAD-P",
    connectWallet: "CONNECT YOUR WALLET",
    connectDesc:
      "To receive your rewards, connect your compatible Solana wallet to your ACADEMY PRIME account.",
    connectDesc2:
      "After your reward becomes eligible, you can claim it to your connected wallet.",
    connectBtn: "Connect Wallet",
    feesNote: "Applicable Solana network transaction fees are the user's responsibility.",
    security: "SECURITY",
    securityText: "Never share your seed phrase or private key. ACADEMY PRIME will never ask you for them.",
    important: "IMPORTANT",
    importantText:
      "Rewards are available only for eligible content and are subject to ACADEMY PRIME's completion and verification requirements.",
    importantText2:
      "Watching a video alone does not guarantee a reward. The platform must verify that the required completion conditions have been met.",
    closing: "YOUR KNOWLEDGE. YOUR REWARD.",
    closingSub: "Learn more. Complete more. Earn ACAD-P.",
    startBtn: "START LEARNING →",
  },
  ar: {
    eyebrow: "أكاديمية برايم — نظام المكافآت",
    heroTitle: "تعلّم. أكمل. اكسب.",
    heroSub: "تعلّم الكريبتو. أكمل المحتوى التعليمي. اكسب ACAD-P.",
    heroDesc:
      "كل فيديو مؤهل في أكاديمية برايم يمنحك الفرصة لكسب 0.001 ACAD-P بعد إتمام المشاهدة والتحقق بنجاح.",
    howItWorks: "كيف يعمل",
    step1Title: "اختر",
    step1Desc: "اختر فيديو تعليمي مؤهلاً.",
    step2Title: "شاهد",
    step2Desc: "شاهد الفيديو بالكامل وفقاً لقواعد الإتمام المطلوبة.",
    step3Title: "أكمل",
    step3Desc: "أنهِ الدرس وأي التحقق المطلوب.",
    step4Title: "اكسب",
    step4Desc: "بمجرد التحقق من إتمامك، تؤهل لتلقي:",
    rewardAmount: "0.001 ACAD-P",
    simpleFlow: "تدفق بسيط",
    flowText: "شاهد ← أكمل ← تحقق ← اكسب",
    yourLearning: "تعلّمك له مكافأة",
    yourLearningDesc:
      "كلما أكملت المزيد من المحتوى التعليمي المؤهل، زادت فرصك في كسب ACAD-P.",
    tableHeader1: "الفيديوهات المكتملة",
    tableHeader2: "المكافأة",
    formula: "حساب المكافأة:",
    formulaCode: "عدد الفيديوهات المؤهلة المكتملة × 0.001 ACAD-P",
    connectWallet: "اربط محفظتك",
    connectDesc:
      "للحصول على مكافآتك، اربط محفظة Solana المتوافقة مع حسابك في أكاديمية برايم.",
    connectDesc2:
      "بمجرد أهلية مكافأتك، يمكنك المطالبة بها إلى محفظتك المرتبطة.",
    connectBtn: "ربط المحفظة",
    feesNote: "رسوم معاملات شبكة Solana الناتجة على عاتق المستخدم.",
    security: "الأمان",
    securityText: "لا تشارك أبداً عبارة البذرة أو المفتاح الخاص. أكاديمية برايم لن تطلب منك أيهما.",
    important: "مهم",
    importantText:
      "المكافآت متاحة فقط للمحتوى المؤهل وتخضع لمتطلبات الإتمام والتحقق في أكاديمية برايم.",
    importantText2:
      "مشاهدة الفيديو وحدها لا تضمن مكافأة. يجب على المنصة التحقق من استيفاء شروط الإتمام المطلوبة.",
    closing: "معرفتك. مكافأتك.",
    closingSub: "تعلّم أكثر. أكمل أكثر. اكسب ACAD-P.",
    startBtn: "← ابدأ التعلّم",
  },
};

const REWARDS_TABLE = [
  { videos: "1", reward: "0.001 ACAD-P" },
  { videos: "10", reward: "0.010 ACAD-P" },
  { videos: "100", reward: "0.100 ACAD-P" },
  { videos: "1,000", reward: "1.000 ACAD-P" },
];

const STEPS = [
  { num: "01", titleKey: "step1Title" as const, descKey: "step1Desc" as const, icon: "🔍" },
  { num: "02", titleKey: "step2Title" as const, descKey: "step2Desc" as const, icon: "▶️" },
  { num: "03", titleKey: "step3Title" as const, descKey: "step3Desc" as const, icon: "✓" },
  { num: "04", titleKey: "step4Title" as const, descKey: "step4Desc" as const, icon: "💰" },
];

export default function RewardsPage({ params }: { params: { locale: string } }) {
  const locale = (params.locale === "ar" ? "ar" : "en") as Locale;
  const t = COPY[locale];

  return (
    <div className="bg-paper-50">
      {/* Hero */}
      <section className="border-b border-line bg-ink-950 py-24 text-center">
        <div className="container-content">
          <p className="eyebrow text-brass-400">{t.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-paper-50 md:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-paper-100/80">{t.heroSub}</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-paper-100/60">{t.heroDesc}</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container-content">
          <h2 className="text-center font-display text-2xl font-bold">{t.howItWorks}</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="relative rounded-xl2 border border-line bg-white p-8 text-center shadow-card transition-shadow hover:shadow-elevated"
              >
                <span className="absolute left-4 top-4 text-xs font-bold text-ink-300">{step.num}</span>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-paper-100 text-2xl">
                  {step.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-ink-950">{t[step.titleKey]}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{t[step.descKey]}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-xl2 border border-line bg-white p-8 text-center shadow-card">
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-300">{t.simpleFlow}</p>
            <p className="mt-3 font-display text-xl font-bold tracking-wide text-ink-950">{t.flowText}</p>
          </div>
        </div>
      </section>

      {/* Reward Table */}
      <section className="border-t border-line py-20">
        <div className="container-content">
          <h2 className="text-center font-display text-2xl font-bold">{t.yourLearning}</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-ink-500">{t.yourLearningDesc}</p>

          <div className="mx-auto mt-10 max-w-md overflow-hidden rounded-xl2 border border-line bg-white shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-paper-50">
                  <th className="px-6 py-3 text-start font-semibold text-ink-700">{t.tableHeader1}</th>
                  <th className="px-6 py-3 text-end font-semibold text-ink-700">{t.tableHeader2}</th>
                </tr>
              </thead>
              <tbody>
                {REWARDS_TABLE.map((row) => (
                  <tr key={row.videos} className="border-b border-line/50 last:border-0">
                    <td className="px-6 py-3 text-start text-ink-800">{row.videos}</td>
                    <td className="px-6 py-3 text-end font-semibold text-brass-600">{row.reward}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-center text-sm text-ink-400">
            {t.formula} <code className="rounded bg-paper-100 px-2 py-0.5 font-mono text-xs text-ink-700">{t.formulaCode}</code>
          </p>
        </div>
      </section>

      {/* Connect Wallet */}
      <section className="border-t border-line py-20">
        <div className="container-content">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold">{t.connectWallet}</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-500">{t.connectDesc}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{t.connectDesc2}</p>

            <Link
              href={`/${locale}/dashboard`}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-ink-950 px-8 py-3.5 text-sm font-semibold tracking-wide text-paper-50 shadow-card transition-colors hover:bg-ink-900"
            >
              {t.connectBtn}
            </Link>

            <p className="mt-4 text-xs text-ink-400">{t.feesNote}</p>

            <div className="mt-10 rounded-xl2 border border-amber-200 bg-amber-50 p-6 text-start">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">{t.security}</p>
              <p className="mt-2 text-sm leading-relaxed text-amber-800">{t.securityText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Important */}
      <section className="border-t border-line py-20">
        <div className="container-content">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-xl2 border border-line bg-paper-50 p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-400">{t.important}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-600">{t.importantText}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{t.importantText2}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-line bg-ink-950 py-24 text-center">
        <div className="container-content">
          <h2 className="font-display text-3xl font-bold text-paper-50 md:text-4xl">{t.closing}</h2>
          <p className="mt-3 text-lg text-paper-100/70">{t.closingSub}</p>
          <Link
            href={`/${locale}/courses`}
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-brass-400 px-8 py-3.5 text-sm font-semibold tracking-wide text-ink-950 transition-colors hover:bg-brass-300"
          >
            {t.startBtn}
          </Link>
        </div>
      </section>
    </div>
  );
}

