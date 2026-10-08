import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, defaultLocale } from "@/lib/i18n";
import { Locale } from "@/types/user";

const CA = "Gg1Uw8ft2QDzSFnRqLFZqBJWDw1KoyPR7ch1VsPrime";

const COPY = {
  en: {
    title: "About ACADEMY PRIME — Learn to Earn Crypto Education",
    description:
      "Discover ACADEMY PRIME: a bilingual (English/Arabic) learn-to-earn crypto education platform with structured courses on blockchain, DeFi, security and trading, and ACAD-P token rewards.",
    eyebrow: "ACADEMY PRIME",
    heading: "The Learn-to-Earn crypto education platform",
    lead:
      "ACADEMY PRIME turns time spent learning into real reward. Watch verified educational videos, complete courses, and earn ACAD-P credits for the progress you make — held in your on-platform balance, with on-chain token distribution coming at a later stage.",
    missionTitle: "Our mission",
    mission:
      "To make crypto, blockchain and Web3 knowledge accessible to everyone — starting with Arabic and English learners — and to reward the effort it takes to understand this space properly.",
    featuresTitle: "What you will find on the platform",
    features: [
      ["Structured video courses", "Step-by-step lessons in Blockchain Basics, Security, DeFi, Trading and more — built as learning paths, not random clips."],
      ["Verified learning rewards", "Every eligible completed lesson earns ACAD-P rewards, tracked transparently on your progress and dashboard."],
      ["Balance-based rewards", "Earned ACAD-P accrues in your Academy Prime balance as on-platform credits — no wallet needed to hold them."],
      ["Leaderboard & experts", "Compete on the leaderboard and learn from contributed content by vetted expert contributors."],
      ["Full Arabic + English support", "The same platform experience in both languages, including RTL design and localized content."],
      ["Practical safety track", "Dedicated learning paths on wallet security, scams and device safety before you handle real funds."],
    ],
    tokenTitle: "The ACAD-P token",
    tokenBody:
      "ACAD-P is the utility token of the ACADEMY PRIME ecosystem. Today, rewards are granted to learners who complete verified educational content and accumulate as on-platform balance credits. Real on-chain ACAD-P distribution will be announced at a later stage — the official address is printed below for when it goes live. Always verify the contract address before interacting with any token.",
    contractLabel: "Official contract address (CA)",
    verifyNote:
      "Always verify this address directly on-chain (e.g., in your wallet before any transaction) and only follow links from official Academy Prime channels.",
    rolloutTitle: "How rewards work",
    rollout: [
      ["1", "Learn", "Watch and complete a verified lesson to the required percentage."],
      ["2", "Earn", "Rewards accrue to your account balance the moment a lesson is completed."],
      ["3", "Grow", "Your ACAD-P stays in your balance as credits; on-chain distribution opens at a later stage."],
    ],
    trustTitle: "Built with trust in mind",
    trust: [
      "Content is reviewed before it is published — no random clips, no bait videos.",
      "Progress and rewards are tracked per lesson so every ACAD-P earned is tied to real completed learning.",
      "We teach safety first: from seed-phrase care to recognizing scams, before any real wallet is used.",
      "Our social channels are the source of truth for official updates:",
    ],
    socials: "X: x.com/tokens100_CTO  ·  Telegram: t.me/Tokns100_CTO",
    faqTitle: "Frequently asked questions",
    faq: [
      ["Is ACADEMY PRIME a trading or investment platform?"],
      ["No. ACADEMY PRIME is an educational platform. It teaches crypto, blockchain, DeFi and security concepts. It is not financial advice and does not promise any returns."],
      ["How do I earn rewards?"],
      ["Complete eligible video lessons from the library or course paths. Each verified completion adds ACAD-P credit to your dashboard balance. On-chain ACAD-P distribution will open at a later stage."],
      ["What is the ACAD-P contract address?"],
      [`The official ACAD-P contract address is ${CA}. It will be used when on-chain distribution opens; until then rewards are held as on-platform balance. Always verify it through official Academy Prime channels.`],
      ["In which languages is the platform available?"],
      ["English and Arabic, with full RTL support and localized content for both."],
      ["Do I need a wallet to start learning?"],
      ["No. You can learn without a wallet. ACAD-P is held in your on-platform balance; a wallet is only needed later, when on-chain distribution opens."],
      ["Is the content free?"],
      ["Sign up and browse the library for free. Rewards are granted for completing verified lessons as described in the terms."],
    ],
    ctaTitle: "Start learning today",
    ctaBody: "Create a free account and begin your first lesson — every minute of learning counts.",
    ctaButton: "Browse the library",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
  },
  ar: {
    title: "حول أكاديمي برايم — التعليم المشفّر واكسب",
    description:
      "اكتشف أكاديمي برايم: منصة تعليمية ثنائية اللغة (عربي/إنجليزي) للتعلم المشفر، بدورات منظمة في البلوكشين وDeFi والأمان والتداول ومكافآت توكن ACAD-P.",
    eyebrow: "أكاديمي برايم",
    heading: "منصة تعلّم المشفّرات واكسب",
    lead:
      "أكاديمي برايم تحوّل وقت التعلّم إلى مكافأة حقيقية. شاهد الفيديوهات التعليمية الموثّقة، أكمِل الدورات، واربح أرصدة ACAD-P مقابل تقدّمك — محفوظة في حسابك على المنصة، على أن يُفتح توزيع التوكنات الحقيقي في مرحلة لاحقة.",
    missionTitle: "رسالتنا",
    mission:
      "جعل المعرفة بالمشفّرات والبلوكشين والويب 3 في متناول الجميع — بدءاً من المتعلمين بالعربية والإنجليزية — ومكافأة الجهد اللازم لفهم هذا المجال بشكل صحيح.",
    featuresTitle: "ماذا ستجد في المنصة",
    features: [
      ["دورات فيديو منظمة", "دروس خطوة بخطوة في أساسيات البلوكشين والأمان وDeFi والتداول وغيرها — مسارات تعليمية حقيقية وليست مقاطع عشوائية."],
      ["مكافآت تعلّم موثّقة", "كل درس مكتمل ومؤهل يضيف مكافأة ACAD-P، وتُتتبع بشفافية في تقدمك ولوحة المعلومات."],
      ["مكافآت قائمة على الرصيد", "تُضاف ACAD-P المكتسبة إلى رصيدك في أكاديمي برايم كأرصدة على المنصة — لا حاجة لمحفظة للاحتفاظ بها."],
      ["لوحة المتصدرين والخبراء", "نافس على لوحة المتصدرين وتعلّم من محتوى يساهم به خبراء معتمدون."],
      ["دعم كامل بالعربية والإنجليزية", "نفس تجربة المنصة باللغتين مع تصميم RTL ومحتوى مترجم."],
      ["مسار أمان عملي", "مسارات مخصصة لأمان المحفظة والاحتيال وأمان الأجهزة قبل التعامل بأموال حقيقية."],
    ],
    tokenTitle: "توكن ACAD-P",
    tokenBody:
      "ACAD-P هو توكن المنفعة في نظام أكاديمي برايم. اليوم، تُمنح المكافآت للمتعلمين الذين يكمّلون المحتوى التعليمي الموثّق وتتراكم كأرصدة على المنصة. سيُعلن عن توزيع ACAD-P الحقيقي في مرحلة لاحقة — والعنوان الرسمي أدناه لوقت إطلاقه. تحقّق دائماً من عنوان العقد قبل أي تعامل.",
    contractLabel: "عنوان العقد الرسمي (CA)",
    verifyNote:
      "تحقّق دائماً من هذا العنوان على السلسلة مباشرة (مثل محفظتك قبل أي معاملة) واتبع فقط الروابط من قنوات أكاديمي برايم الرسمية.",
    rolloutTitle: "كيف تعمل المكافآت",
    rollout: [
      ["1", "تعلّم", "شاهد وأكمل درساً موثّقاً إلى النسبة المطلوبة."],
      ["2", "اربح", "تُضاف المكافآت إلى رصيد حسابك فور اكتمال الدرس."],
      ["3", "نموّ", "تبقى ACAD-P في رصيدك كأرصدة، ويُفتح التوزيع على السلسلة في مرحلة لاحقة."],
    ],
    trustTitle: "مبنيّ على الثقة",
    trust: [
      "يُراجع المحتوى قبل نشره — لا مقاطع عشوائية ولا فيديوهات مضللة.",
      "يُتتبع التقدم والمكافآت لكل درس، فكل ACAD-P مرتبط بتعلّم حقيقي مكتمل.",
      "نعلّم الأمان أولاً: من حماية عبارة الاسترداد إلى توعية الاحتيال، قبل استخدام أي محفظة حقيقية.",
      "قنواتنا الرسمية هي مصدر الحقيقة للتحديثات:",
    ],
    socials: "إكس: x.com/tokens100_CTO  ·  تيليجرام: t.me/Tokns100_CTO",
    faqTitle: "الأسئلة الشائعة",
    faq: [
      ["هل أكاديمي برايم منصة استثمار أو تداول؟"],
      ["لا. أكاديمي برايم منصة تعليمية. تعلّم أساسيات المشفّرات والبلوكشين وDeFi والأمان. وهي ليست نصيحة مالية ولا تعد بأي عوائد."],
      ["كيف أربح المكافآت؟"],
      ["أكمِل الدروس الفيديوية المؤهلة من المكتبة أو مسارات الدورات. كل إكمال موثّق يضيف رصيد ACAD-P في لوحة المعلومات. توزيع ACAD-P على السلسلة سيُفتح في مرحلة لاحقة."],
      ["ما عنوان عقد ACAD-P؟"],
      [`العنوان الرسمي لعقد ACAD-P هو ${CA}. سيُستخدم عندما يفتح التوزيع على السلسلة؛ وحتى ذلك الحين تبقى المكافآت كأرصدة على المنصة. تحقّق دائماً عبر قنوات أكاديمي برايم الرسمية.`],
      ["بأي لغات تتوفر المنصة؟"],
      ["الإنجليزية والعربية، مع دعم كامل لاتجاه RTL ومحتوى مترجم للغتين."],
      ["هل أحتاج محفظة لبدء التعلّم؟"],
      ["لا. يمكنك التعلّم بدون محفظة. ACAD-P محفوظة في رصيدك على المنصة؛ تحتاج محفظة لاحقاً فقط عند فتح التوزيع على السلسلة."],
      ["هل المحتوى مجاني؟"],
      ["سجّل واستعرض المكتبة مجاناً. تُمنح المكافآت لإكمال الدروس الموثّقة وفق الشروط."],
    ],
    ctaTitle: "ابدأ التعلم اليوم",
    ctaBody: "أنشئ حساباً مجانياً وابدأ أول درس — كل دقيقة تعلّم تحتسب.",
    ctaButton: "تصفح المكتبة",
    terms: "شروط الخدمة",
    privacy: "سياسة الخصوصية",
  },
};

export const metadata: Metadata = {
  title: COPY.en.title,
  description: COPY.en.description,
};

export default function AboutPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const t = COPY[locale];
  const rtl = locale === "ar";

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <main className="min-h-screen bg-paper-100 pb-20" dir={rtl ? "rtl" : "ltr"}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <div className="container-content pt-16 md:pt-20">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight md:text-5xl">
          {t.heading}
        </h1>
        <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-ink-500">{t.lead}</p>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold text-ink-900">{t.missionTitle}</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-500">{t.mission}</p>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold text-ink-900">{t.featuresTitle}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.features.map(([title, body]) => (
              <div key={title} className="rounded-xl border border-line bg-paper-50 p-5">
                <h3 className="text-[15px] font-semibold text-ink-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 rounded-2xl bg-ink-950 p-7 text-paper-100 md:p-9">
          <h2 className="font-display text-2xl font-bold">{t.tokenTitle}</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-paper-100/70">{t.tokenBody}</p>
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-brass-400">{t.contractLabel}</p>
            <code className="mt-2 inline-block max-w-full break-all rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-paper-100">
              {CA}
            </code>
            <p className="mt-3 max-w-2xl text-xs leading-relaxed text-paper-100/50">{t.verifyNote}</p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold text-ink-900">{t.rolloutTitle}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {t.rollout.map(([step, title, body]) => (
              <div key={step} className="rounded-xl border border-line bg-paper-50 p-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brass-400 text-sm font-semibold text-ink-950">
                  {step}
                </span>
                <h3 className="mt-3 text-[15px] font-semibold text-ink-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold text-ink-900">{t.trustTitle}</h2>
          <ul className="mt-5 max-w-2xl space-y-3">
            {t.trust.slice(0, 3).map((item) => (
              <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-500">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-500">{t.socials}</p>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold text-ink-900">{t.faqTitle}</h2>
          <div className="mt-5 max-w-3xl divide-y divide-line rounded-xl border border-line bg-paper-50">
            {t.faq.map(([q, a], i) => (
              <details key={q} className="group px-5 py-4" open={i === 0}>
                <summary className="cursor-pointer list-none text-[15px] font-semibold text-ink-900">
                  {q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-14 flex flex-col items-start gap-5 rounded-2xl border border-line bg-paper-50 p-7 md:flex-row md:items-center md:justify-between md:p-9">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900">{t.ctaTitle}</h2>
            <p className="mt-2 text-[15px] text-ink-500">{t.ctaBody}</p>
          </div>
          <Link
            href={`/${locale}/library`}
            className="inline-flex items-center gap-2 rounded-full bg-brass-400 px-6 py-3 text-sm font-semibold text-ink-950 shadow-card transition-colors hover:bg-brass-300"
          >
            {t.ctaButton}
          </Link>
          <p className="w-full text-xs text-ink-400 md:w-auto">
            <Link href={`/${locale}/terms`} className="hover:text-ink-600">{t.terms}</Link>
            {" · "}
            <Link href={`/${locale}/privacy`} className="hover:text-ink-600">{t.privacy}</Link>
          </p>
        </section>
      </div>
    </main>
  );
}