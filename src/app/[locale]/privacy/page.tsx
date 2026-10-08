import type { Metadata } from "next";
import { isLocale, defaultLocale } from "@/lib/i18n";
import { Locale } from "@/types/user";

const COPY = {
  en: {
    title: "Privacy Policy — ACADEMY PRIME",
    description: "How ACADEMY PRIME collects, uses, and protects your personal data.",
    eyebrow: "Legal",
    heading: "Privacy Policy",
    updated: "Last updated: September 2026",
    sections: [
      ["1. Overview", "This Privacy Policy explains what information ACADEMY PRIME (the \u201cPlatform\u201d) collects, why we collect it, and how we protect it."],
      ["2. Information we collect", "Account data (email, username, password hash), learning data (videos watched, progress, completed lessons), reward data (balances, claims, wallet address you link), and basic technical data needed to run the service securely."],
      ["3. How we use it", "To run your account, record progress, pay rewards you earn, keep the Platform secure, and improve our content. We do not sell your personal data."],
      ["4. Storage", "Data is stored in encrypted-at-rest managed cloud databases (Turso) regionally hosted in the EU. We keep data only as long as your account exists or the law requires."],
      ["5. Cookies and local storage", "We use cookies and browser local storage to keep you signed in, remember your language, and detect the latest version of the site."],
      ["6. Sharing", "We only share data with service providers that help operate the Platform (e.g., hosting). They may not use your data for their own purposes. We never sell data to advertisers."],
      ["7. Your rights", "You can request access to, correction of, or deletion of your account and data. In most cases you can also do this yourself from your dashboard or by contacting us through official channels."],
      ["8. Security", "Passwords are stored hashed, API traffic is encrypted end-to-end, and access to production data is restricted. Still, no system is 100% secure — protect your credentials and never share your seed phrase with anyone."],
      ["9. Children", "The Platform is not directed at children. If you believe a child has created an account, contact us so we can remove it."],
      ["10. Changes", "We may update this policy from time to time. Significant changes will be posted here with an updated date."],
      ["11. Contact", "Questions: X x.com/tokens100_CTO and Telegram t.me/Tokns100_CTO."],
    ],
  },
  ar: {
    title: "سياسة الخصوصية — أكاديمي برايم",
    description: "كيفية جمع أكاديمي برايم لبياناتك الشخصية واستخدامها وحمايتها.",
    eyebrow: "قانوني",
    heading: "سياسة الخصوصية",
    updated: "آخر تحديث: سبتمبر 2026",
    sections: [
      ["1. نظرة عامة", "توضح سياسة الخصوصية هذه المعلومات التي تجمعها أكاديمي برايم (\"المنصة\")، ولماذا نجمعها، وكيف نحميها."],
      ["2. المعلومات التي نجمعها", "بيانات الحساب (البريد الإلكتروني واسم المستخدم وتجزئة كلمة المرور)، وبيانات التعلم (الفيديوهات المشاهدة والتقدم والدروس المكتملة)، وبيانات المكافآت (الأرصدة والسحوبات وعنوان المحفظة الذي تربطه)، والبيانات التقنية الأساسية اللازمة لتشغيل الخدمة بأمان."],
      ["3. كيف نستخدمها", "لتشغيل حسابك وتسجيل تقدمك ودفع المكافآت التي تربحها والحفاظ على أمان المنصة وتحسين محتواها. لا نبيع بياناتك الشخصية."],
      ["4. التخزين", "تُخزن البيانات في قواعد بيانات سحابية مُدارة ومشفرة أثناء السكون (Turso) مستضافة في الاتحاد الأوروبي. نحتفظ بالبيانات فقط ما دام حسابك قائماً أو وفق ما يقتضيه القانون."],
      ["5. ملفات تعريف الارتباط والتخزين المحلي", "نستخدم ملفات تعريف الارتباط والتخزين المحلي في المتصفح لإبقائك مسجلاً وتذكر لغتك واكتشاف أحدث إصدار للموقع."],
      ["6. المشاركة", "نشارك البيانات فقط مع مزودي الخدمة الذين يساعدون في تشغيل المنصة (مثل الاستضافة). لا يجوز لهم استخدام بياناتك لأغراضهم الخاصة. لا نبيع البيانات للمعلنين أبداً."],
      ["7. حقوقك", "يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها. في معظم الحالات يمكنك فعل ذلك بنفسك من لوحة المعلومات أو عبر التواصل معنا من خلال القنوات الرسمية."],
      ["8. الأمان", "تُخزن كلمات المرور بشكل مجزّأ، وتُشفّر حركة مرور الواجهة من طرف إلى طرف، وتُقيّد الوصول إلى بيانات الإنتاج. ومع ذلك لا يوجد نظام آمن 100% — احمِ بيانات الدخول ولا تشارك عبارة الاسترداد مع أي شخص أبداً."],
      ["9. الأطفال", "المنصة غير موجّهة للأطفال. إذا اعتقدت أن طفلاً أنشأ حساباً فتواصل معنا لإزالته."],
      ["10. التغييرات", "قد نحدّث هذه السياسة من وقت لآخر. ستُنشر التغييرات المهمة هنا مع تاريخ التحديث."],
      ["11. التواصل", "الأسئلة: إكس x.com/tokens100_CTO وتيليجرام t.me/Tokns100_CTO."],
    ],
  },
};

export const metadata: Metadata = {
  title: COPY.en.title,
  description: COPY.en.description,
};

export default function PrivacyPage({ params }: { params: { locale: string } }) {
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