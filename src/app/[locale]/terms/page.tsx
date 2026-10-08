import type { Metadata } from "next";
import { isLocale, defaultLocale } from "@/lib/i18n";
import { Locale } from "@/types/user";

const COPY = {
  en: {
    title: "Terms of Service — ACADEMY PRIME",
    description: "Terms of Service for the ACADEMY PRIME learn-to-earn crypto education platform.",
    eyebrow: "Legal",
    heading: "Terms of Service",
    updated: "Last updated: September 2026",
    sections: [
      ["1. Acceptance of terms", "By creating an account or using ACADEMY PRIME (the \u201cPlatform\u201d), you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the Platform."],
      ["2. Educational purpose", "The Platform provides educational content about crypto, blockchain, Web3, DeFi, security and trading. Nothing on the Platform is financial, investment or legal advice, and no content should be relied upon as a promise of profit or returns."],
      ["3. Accounts", "You are responsible for keeping your login credentials confidential and for all activity that occurs under your account. You must be at least the age required to provide consent for these services in your jurisdiction."],
      ["4. Content and intellectual property", "All lessons, courses, texts, graphics and design elements are owned by or licensed to ACADEMY PRIME. You may use the Platform content for personal, non-commercial learning only."],
      ["5. Rewards and tokens", "ACAD-P rewards are granted for completing verified lessons as described on the Platform. Rewards are not investments: the token has no guaranteed value, and nothing here constitutes an offer to sell securities. Claiming rewards requires a wallet you control, and you are solely responsible for transaction-side risks, including fees and network errors."],
      ["6. Acceptable use", "You agree not to abuse, spam, scrap, or attempt to disrupt the Platform, its APIs, or other users; not to use automated means to inflate watch time, progress, or rewards; and not to misrepresent your identity or link wallets you do not control."],
      ["7. Wallet links", "Linking a wallet is optional and used only for reward claims. You should verify any contract or wallet address on-chain. ACADEMY PRIME is not liable for losses caused by scams, phishing, or addresses obtained outside official channels."],
      ["8. Third-party links", "The Platform may link to third-party sites, communities, or explorers. We are not responsible for their content or practices."],
      ["9. Limitation of liability", "The Platform is provided \u201cas is\u201d without warranties of any kind. To the maximum extent permitted by law, ACADEMY PRIME is not liable for indirect, incidental or consequential damages, or for losses resulting from market changes, network failures, or misuse of tokens."],
      ["10. Changes", "We may update these Terms from time to time. Continued use of the Platform after changes take effect means you accept the updated Terms."],
      ["11. Contact", "Questions about these Terms can be directed to our official channels: X x.com/tokens100_CTO and Telegram t.me/Tokns100_CTO."],
    ],
  },
  ar: {
    title: "شروط الخدمة — أكاديمي برايم",
    description: "شروط الخدمة لمنصة أكاديمي برايم للتعليم المشفّر وتعلّم واكسب.",
    eyebrow: "قانوني",
    heading: "شروط الخدمة",
    updated: "آخر تحديث: سبتمبر 2026",
    sections: [
      ["1. قبول الشروط", "بإنشاء حساب أو استخدام أكاديمي برايم (\"المنصة\") فإنك توافق على شروط الخدمة هذه وسياسة الخصوصية. إذا لم توافق، فيرجى عدم استخدام المنصة."],
      ["2. الغرض التعليمي", "توفر المنصة محتوى تعليمياً عن المشفّرات والبلوكشين والويب 3 وDeFi والأمان والتداول. لا شيء في المنصة يُعدّ نصيحة مالية أو استثمارية أو قانونية، ولا يجوز الاعتماد على أي محتوى كوعد بأرباح أو عوائد."],
      ["3. الحسابات", "أنت مسؤول عن الحفاظ على سرية بيانات الدخول وعن كل النشاط الذي يحدث تحت حسابك. يجب أن تكون بسن يحق فيه الموافقة على هذه الخدمات في بلدك."],
      ["4. المحتوى والملكية الفكرية", "جميع الدروس والدورات والنصوص والرسومات والعناصر التصميمية مملوكة أو مرخّصة لأكاديمي برايم. يُسمح باستخدام محتوى المنصة للتعلم الشخصي غير التجاري فقط."],
      ["5. المكافآت والتوكنات", "تُمنح مكافآت ACAD-P لإكمال الدروس الموثّقة كما هو موضح في المنصة. المكافآت ليست استثماراً: لا قيمة مضمونة للتوكن، ولا يشكل أي شيء هنا عرضاً لبيع أوراق مالية. يتطلب سحب المكافآت محفظة تتحكم فيها، وأنت وحدك المسؤول عن مخاطر جانب المعاملة، بما فيها الرسوم وأخطاء الشبكة."],
      ["6. الاستخدام المقبول", "تتعهد بعدم إساءة استخدام المنصة أو مراسلاتها أو واجهاتها أو تعطيلها أو غيرها من المستخدمين؛ وعدم استخدام وسائل آلية لتضخيم مدة المشاهدة أو التقدم أو المكافآت؛ وعدم انتحال الهوية أو ربط محافظ لا تتحكم فيها."],
      ["7. ربط المحافظ", "ربط المحفظة اختياري ويُستخدم للسحب فقط. يجب التحقق من أي عقد أو عنوان محفظة على السلسلة. لا تتحمل أكاديمي برايم المسؤولية عن خسائر الاحتيال أو التصيد أو العناوين التي تُحصل من خارج القنوات الرسمية."],
      ["8. روابط خارجية", "قد تتضمن المنصة روابط لمواقع أو مجتمعات أو مستكشفات تابعة لجهات خارجية. لسنا مسؤولين عن محتواها أو ممارساتها."],
      ["9. حدود المسؤولية", "تُقدم المنصة \"كما هي\" دون أي ضمانات. إلى أقصى حد يسمح به القانون، لا تتحمل أكاديمي برايم المسؤولية عن الأضرار غير المباشرة أو العرضية أو التبعية، أو عن الخسائر الناتجة عن تغيرات السوق أو أعطال الشبكة أو سوء استخدام التوكنات."],
      ["10. التغييرات", "قد نحدّث هذه الشروط من وقت لآخر. استمرارك في استخدام المنصة بعد سريان التغييرات يعني قبولك للشروط المحدثة."],
      ["11. التواصل", "يمكن توجيه الأسئلة حول هذه الشروط عبر قنواتنا الرسمية: إكس x.com/tokens100_CTO وتيليجرام t.me/Tokns100_CTO."],
    ],
  },
};

export const metadata: Metadata = {
  title: COPY.en.title,
  description: COPY.en.description,
};

export default function TermsPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : defaultLocale;
  const t = COPY[locale];
  const rtl = locale === "ar";

  return (
    <main className="min-h-screen bg-paper-100 pb-20" dir={rtl ? "rtl" : "ltr"}>
      <div className="container-content max-w-3xl pt-16 md:pt-20">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{t.heading}</h1>
        <p className="mt-2 text-sm text-ink-400">{t.updated}</p>
        <div className="mt-8 space-y-6">
          {t.sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="text-[15px] font-semibold text-ink-900">{heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}