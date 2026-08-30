"use client";

import { useCallback, useEffect, useState } from "react";
import {
  api,
  ApiError,
  type AdminStats,
  type AdminVideoRow,
  type AdminExpertRow,
  type AdminUserRow,
  type RewardSettingsData,
  type CoursePublic,
  type Partner,
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/components/session/SessionProvider";

const COPY = {
  en: {
    heading: "Admin Console",
    subhead: "Platform stats, content moderation and reward settings.",
    tabOverview: "Overview",
    tabVideos: "Videos",
    tabExperts: "Experts",
    tabPartners: "Partners",
    tabUsers: "Users",
    tabSettings: "Reward settings",
    tabPost: "Post",
    statUsers: "Users",
    statActive: "Active users",
    statExperts: "Experts",
    statPendingExperts: "Pending experts",
    statVideos: "Videos",
    statPublished: "Published",
    statAvailable: "Rewards available",
    statClaimed: "Rewards claimed",
    tokensTitle: "Tokens collected by users",
    statTokensIssued: "Total issued",
    statTokensClaimed: "Claimed on-chain",
    statTokensPending: "Waiting to claim",
    filterAll: "All",
    filterSubmitted: "Submitted",
    filterApproved: "Approved",
    filterRejected: "Rejected",
    colTitle: "Title",
    colFormat: "Format",
    colLang: "Lang",
    colStatus: "Status",
    colReward: "Reward",
    colActions: "Actions",
    approve: "Approve",
    reject: "Reject",
    publish: "Publish",
    unpublish: "Unpublish",
    suspend: "Suspend",
    activate: "Activate",
    displayName: "Expert",
    headlineCol: "Headline",
    emailCol: "Email",
    roleCol: "Role",
    notePlaceholder: "Optional review note",
    save: "Save",
    saved: "Saved!",
    defaultReward: "Default video reward",
    courseBonus: "Course bonus",
    watchPct: "Required watch %",
    dailyLimit: "Daily claim limit",
    minAge: "Min account age (days)",
    needAdmin: "Admins only. This area requires an administrator account.",
    goLogin: "Log in",
    loadError: "Could not load data.",
    emptyList: "Nothing here.",
    postHeading: "Create a post",
    postSub: "Publish lessons or shorts directly as admin.",
    fTitle: "Title",
    fUrl: "Video URL (YouTube, Instagram, Vimeo, TikTok, or other)",
    fDurationMin: "Minutes",
    fDurationSec: "Seconds",
    fDesc: "Description (optional)",
    fDifficulty: "Difficulty",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    fFormat: "Type",
    longF: "Lesson",
    shortF: "Short (≤60s)",
    courseF: "Course",
    fDocumentary: "Documentary",
    fLang: "Language",
    langEn: "English",
    langAr: "العربية",
    fReward: "Token reward per completion",
    fRewardEmpty: "Leave empty to use the default",
    rewardUpdated: "Reward saved",
    submitPost: "Submit for review",
    posting: "Submitting…",
    postOk: "Created! Approve and publish it from the Videos tab.",
    tabPassword: "Password",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    passwordMismatch: "Passwords do not match",
    passwordSuccess: "Password updated!",
    passwordError: "Failed to update password.",
    changePassword: "Update Password",
    passwordsNoMatch: "Passwords do not match",
    courseSelector: "Assign to course (optional)",
    noCourse: "No course (standalone)",
    partnerName: "Partner name",
    partnerLogo: "Logo URL",
    partnerWebsite: "Website URL",
    partnerDesc: "Description (optional)",
    partnerActive: "Active",
    partnerAdd: "Add partner",
    partnerUpdate: "Update partner",
    partnerDelete: "Delete",
    partnerSaved: "Partner saved!",
    partnerCreated: "Partner created!",
    partnerNew: "Add a partner",
    add: "Add",
    cancel: "Cancel",
  },
  ar: {
    heading: "لوحة المشرف",
    subhead: "إحصائيات المنصة ومراجعة المحتوى وإعدادات المكافآت.",
    tabOverview: "نظرة عامة",
    tabVideos: "الفيديوهات",
    tabExperts: "الخبراء",
    tabPartners: "الشركاء",
    tabUsers: "المستخدمون",
    tabSettings: "إعدادات المكافآت",
    tabPost: "منشور",
    statUsers: "المستخدمون",
    statActive: "نشط",
    statExperts: "الخبراء",
    statPendingExperts: "طلبات معلّقة",
    statVideos: "الفيديوهات",
    statPublished: "منشورة",
    statAvailable: "مكافآت متاحة",
    statClaimed: "تم صرفها",
    tokensTitle: "رموز جمعها المستخدمون",
    statTokensIssued: "إجمالي المُصدَر",
    statTokensClaimed: "المصروف على السلسلة",
    statTokensPending: "بانتظار الصرف",
    filterAll: "الكل",
    filterSubmitted: "مُرسلة",
    filterApproved: "مقبولة",
    filterRejected: "مرفوضة",
    colTitle: "العنوان",
    colFormat: "النوع",
    colLang: "اللغة",
    colStatus: "الحالة",
    colReward: "المكافأة",
    colActions: "إجراءات",
    approve: "قبول",
    reject: "رفض",
    publish: "نشر",
    unpublish: "إلغاء النشر",
    suspend: "تعليق",
    activate: "تنشيط",
    displayName: "الخبير",
    headlineCol: "الوصف",
    emailCol: "البريد",
    roleCol: "الدور",
    notePlaceholder: "ملاحظة مراجعة (اختياري)",
    save: "حفظ",
    saved: "تم الحفظ!",
    defaultReward: "مكافأة الفيديو الافتراضية",
    courseBonus: "مكافأة الدورة",
    watchPct: "نسبة المشاهدة المطلوبة",
    dailyLimit: "حد الصرف اليومي",
    minAge: "أقل عمر للحساب (أيام)",
    needAdmin: "للمشرفين فقط. هذه المنطقة تتطلب حساب مدير.",
    goLogin: "تسجيل الدخول",
    loadError: "تعذّر تحميل البيانات.",
    emptyList: "لا يوجد شيء هنا.",
    postHeading: "إنشاء منشور",
    postSub: "انشر الدروس أو المقاطع مباشرة كمشرف.",
    fTitle: "العنوان",
    fUrl: "رابط الفيديو (يوتيوب، إنستغرام، فيميو، تيك توك، أو مصدر آخر)",
    fDurationMin: "الدقائق",
    fDurationSec: "الثواني",
    fDesc: "الوصف (اختياري)",
    fDifficulty: "المستوى",
    beginner: "مبتدئ",
    intermediate: "متوسط",
    advanced: "متقدم",
    fFormat: "النوع",
    longF: "درس",
    shortF: "قصير (≤٦٠ث)",
    courseF: "دورة",
    fDocumentary: "وثائقي",
    fLang: "اللغة",
    langEn: "English",
    langAr: "العربية",
    fReward: "مكافأة الرمز لكل إتمام",
    fRewardEmpty: "اتركه فارغًا لاستخدام الافتراضي",
    rewardUpdated: "تم حفظ المكافأة",
    submitPost: "إرسال للمراجعة",
    posting: "جارٍ الإرسال…",
    postOk: "تم الإنشاء! قبوله وانشره من تبويب الفيديوهات.",
    tabPassword: "كلمة المرور",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور الجديدة",
    passwordMismatch: "كلمتا المرور غير متطابقتين",
    passwordSuccess: "تم تحديث كلمة المرور!",
    passwordError: "فشل تحديث كلمة المرور.",
    changePassword: "تحديث كلمة المرور",
    passwordsNoMatch: "كلمتا المرور غير متطابقتين",
    courseSelector: "إضافة إلى دورة (اختياري)",
    noCourse: "بدون دورة (مستقل)",
    partnerName: "اسم الشريك",
    partnerLogo: "رابط الشعار",
    partnerWebsite: "رابط الموقع",
    partnerDesc: "الوصف (اختياري)",
    partnerActive: "نشط",
    partnerAdd: "إضافة شريك",
    partnerUpdate: "تحديث الشريك",
    partnerDelete: "حذف",
    partnerSaved: "تم حفظ الشريك!",
    partnerCreated: "تم إنشاء الشريك!",
    partnerNew: "إضافة شريك",
    add: "إضافة",
    cancel: "إلغاء",
  },
};

const TONE: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-700",
  approved: "bg-emerald-500/10 text-emerald-700",
  active: "bg-emerald-500/10 text-emerald-700",
  submitted: "bg-brass-400/15 text-brass-600",
  pending: "bg-brass-400/15 text-brass-600",
  draft: "bg-paper-100 text-ink-500",
  rejected: "bg-red-50 text-red-600",
  suspended: "bg-red-50 text-red-600",
};

const TABS = ["overview", "post", "videos", "experts", "partners", "users", "settings", "password"] as const;
type Tab = (typeof TABS)[number];

const inputCls =
  "h-11 w-full rounded-lg border border-line bg-paper-50 px-4 text-sm outline-none focus:border-brass-400";

function RewardInput({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        step="any"
        value={draft}
        placeholder="—"
        onChange={(e) => {
          setDraft(e.target.value);
          setSaved(false);
        }}
        className="h-8 w-24 rounded-lg border border-line bg-paper-50 px-2 text-sm outline-none focus:border-brass-400"
      />
      <button
        onClick={() => {
          onSave(draft);
          setSaved(true);
        }}
        className="rounded-md bg-ink-950 px-2 py-1 text-xs font-semibold text-paper-50 hover:bg-ink-800"
      >
        Set
      </button>
      {saved && <span className="text-xs text-emerald-700">✓</span>}
    </div>
  );
}

export default function AdminPage({ params }: { params: { locale: string } }) {
  const locale = params.locale === "ar" ? "ar" : "en";
  const t = COPY[locale];
  const rtl = locale === "ar";
  const { me, loading: sessionLoading } = useSession();

  const [tab, setTab] = useState<Tab>("overview");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [videos, setVideos] = useState<AdminVideoRow[]>([]);
  const [videoFilter, setVideoFilter] = useState<string | undefined>(undefined);
  const [experts, setExperts] = useState<AdminExpertRow[]>([]);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [settings, setSettings] = useState<RewardSettingsData | null>(null);
  const [savedMsg, setSavedMsg] = useState("");
  const [rewardMsg, setRewardMsg] = useState("");
  const [post, setPost] = useState({
    title: "",
    source_url: "",
    duration_minutes: "",
    duration_seconds: "",
    description: "",
    difficulty: "beginner",
    format: "long",
    documentary: false,
    language: "en",
    course_id: "",
    reward: "",
  });
  const [postState, setPostState] = useState<"idle" | "busy" | "ok">("idle");
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [passwordState, setPasswordState] = useState<"idle" | "busy" | "ok" | "error">("idle");
  const [courses, setCourses] = useState<CoursePublic[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerForm, setPartnerForm] = useState({
    id: "",
    name: "",
    logo_url: "",
    website_url: "",
    description: "",
    is_active: true,
  });
  const [partnerMsg, setPartnerMsg] = useState("");

  const safeLoad = useCallback(
    async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
      try {
        return await fn();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t.loadError);
        return fallback;
      }
    },
    [t.loadError],
  );

  const loadTab = useCallback(
    async (which: Tab) => {
      setError("");
      setRewardMsg("");
      setPartnerMsg("");
      if (which === "overview") setStats(await safeLoad(() => api.adminStats(), null as unknown as AdminStats));
      if (which === "videos") setVideos(await safeLoad(() => api.adminVideos(videoFilter), []));
      if (which === "experts") setExperts(await safeLoad(() => api.adminExperts(), []));
      if (which === "partners") setPartners(await safeLoad(() => api.adminPartners(), []));
      if (which === "users") setUsers(await safeLoad(() => api.adminUsers(), []));
      if (which === "settings") setSettings(await safeLoad(() => api.adminRewardSettings(), null as unknown as RewardSettingsData));
      if (which === "post") {
        const c = await safeLoad(() => api.listCourses({ page_size: 100 }), { items: [], total: 0, page: 1, page_size: 100 });
        setCourses(c.items);
      }
    },
    [safeLoad, videoFilter],
  );

  useEffect(() => {
    if (me?.role === "admin") void loadTab(tab);
  }, [me, tab, loadTab]);

  if (sessionLoading) {
    return <div className="container-content py-24 text-sm text-ink-500">…</div>;
  }

  if (!me || me.role !== "admin") {
    return (
      <div className="container-content flex flex-col items-center gap-4 py-28">
        <p className="text-lg text-ink-700">{t.needAdmin}</p>
        {!me && <Button variant="primary" href={`/${locale}/login`}>{t.goLogin}</Button>}
      </div>
    );
  }

  async function reviewVideo(id: string, action: string) {
    try {
      await api.adminReviewVideo(id, action);
      await loadTab("videos");
      if (stats) setStats(await safeLoad(() => api.adminStats(), stats));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.loadError);
    }
  }

  async function saveVideoReward(id: string, reward: string) {
    setRewardMsg("");
    const value = reward.trim() === "" ? null : reward.trim();
    try {
      await api.adminSetVideoReward(id, value);
      setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, reward_amount: value } : v)));
      setRewardMsg(t.rewardUpdated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.loadError);
    }
  }

  async function reviewExpert(id: string, status: string) {
    try {
      await api.adminReviewExpert(id, status);
      await loadTab("experts");
      if (stats) setStats(await safeLoad(() => api.adminStats(), stats));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.loadError);
    }
  }

  async function setUserStatus(id: string, status: string) {
    try {
      await api.adminSetUserStatus(id, status);
      await loadTab("users");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.loadError);
    }
  }

  async function saveSettings() {
    if (!settings) return;
    setSavedMsg("");
    try {
      const updated = await api.adminUpdateRewardSettings({
        default_video_reward: settings.default_video_reward,
        course_bonus_reward: settings.course_bonus_reward,
        default_watch_percentage: settings.default_watch_percentage,
        daily_claim_limit: settings.daily_claim_limit,
        min_account_age_days: settings.min_account_age_days,
      });
      setSettings(updated);
      setSavedMsg(t.saved);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.loadError);
    }
  }

  async function submitPost() {
    const mins = Number(post.duration_minutes) || 0;
    const secs = Number(post.duration_seconds) || 0;
    const dur = mins * 60 + secs;
    if (!post.title.trim() || !post.source_url.trim() || dur <= 0) return;
    setPostState("busy");
    setError("");
    try {
      await api.adminCreateVideo({
        title: post.title.trim(),
        source_url: post.source_url.trim(),
        duration_seconds: dur,
        description: post.description.trim() || undefined,
        difficulty: post.difficulty,
        format: post.format,
        documentary: post.documentary,
        language: post.language,
        course_id: post.course_id || undefined,
        reward_amount: post.reward.trim() || undefined,
      });
      setPostState("ok");
      setPost({ title: "", source_url: "", duration_minutes: "", duration_seconds: "", description: "", difficulty: "beginner", format: "long", documentary: false, language: "en", course_id: "", reward: "" });
    } catch (err) {
      setPostState("idle");
      setError(err instanceof ApiError ? err.message : t.loadError);
    }
  }

  async function handleChangePassword() {
    if (!passwordForm.current || !passwordForm.newPass) return;
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordState("error");
      return;
    }
    setPasswordState("busy");
    setError("");
    try {
      await api.changePassword(passwordForm.current, passwordForm.newPass);
      setPasswordState("ok");
      setPasswordForm({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      setPasswordState("error");
      setError(err instanceof ApiError ? err.message : t.passwordError);
    }
  }

  function resetPartnerForm() {
    setPartnerForm({ id: "", name: "", logo_url: "", website_url: "", description: "", is_active: true });
    setPartnerMsg("");
  }

  function startEditPartner(p: Partner) {
    setPartnerForm({
      id: p.id,
      name: p.name,
      logo_url: p.logo_url ?? "",
      website_url: p.website_url ?? "",
      description: p.description ?? "",
      is_active: p.is_active,
    });
    setPartnerMsg("");
  }

  async function savePartner() {
    if (!partnerForm.name.trim()) return;
    setError("");
    setPartnerMsg("");
    const payload = {
      name: partnerForm.name.trim(),
      logo_url: partnerForm.logo_url.trim() || undefined,
      website_url: partnerForm.website_url.trim() || undefined,
      description: partnerForm.description.trim() || undefined,
      is_active: partnerForm.is_active,
    };
    try {
      if (partnerForm.id) {
        await api.adminUpdatePartner(partnerForm.id, payload);
        setPartnerMsg(t.partnerSaved);
      } else {
        await api.adminCreatePartner(payload);
        setPartnerMsg(t.partnerCreated);
      }
      resetPartnerForm();
      setPartners(await safeLoad(() => api.adminPartners(), []));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.loadError);
    }
  }

  async function deletePartner(id: string) {
    setError("");
    try {
      await api.adminDeletePartner(id);
      if (partners.some((p) => p.id === id)) {
        resetPartnerForm();
      }
      setPartners(await safeLoad(() => api.adminPartners(), []));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.loadError);
    }
  }

  return (
    <main className="min-h-screen bg-paper-100 pb-20" dir={rtl ? "rtl" : "ltr"}>
      <div className="container-content pt-12">
        <h1 className="font-display text-3xl font-semibold text-ink-950">{t.heading}</h1>
        <p className="mt-1 text-sm text-ink-500">{t.subhead}</p>

        <nav className="mt-6 flex flex-wrap gap-2">
          {TABS.map((x) => (
            <button
              key={x}
              onClick={() => setTab(x)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === x ? "bg-ink-950 text-paper-50" : "border border-line bg-paper-50 text-ink-700 hover:border-brass-400"
              }`}
            >
              {t[`tab${x.charAt(0).toUpperCase()}${x.slice(1)}` as keyof typeof t]}
            </button>
          ))}
        </nav>

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {tab === "overview" && stats && (
          <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {([
              [t.statUsers, stats.users_total],
              [t.statActive, stats.users_active],
              [t.statExperts, stats.experts_total],
              [t.statPendingExperts, stats.experts_pending],
              [t.statVideos, stats.videos_total],
              [t.statPublished, stats.videos_published],
              [t.statAvailable, Number(stats.rewards_available).toLocaleString("en-US")],
              [t.statClaimed, Number(stats.rewards_claimed).toLocaleString("en-US")],
            ] as Array<[string, string | number]>).map(([label, value]) => (
              <div key={label} className="rounded-xl border border-line bg-paper-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
                <p className="mt-1 font-display text-2xl font-semibold text-ink-950">{value}</p>
              </div>
            ))}
          </section>
        )}

        {tab === "overview" && stats && (
          <section className="mt-6 rounded-xl border border-brass-400/40 bg-brass-400/5 p-5">
            <h2 className="font-display text-lg font-semibold text-ink-950">{t.tokensTitle}</h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {([
                [t.statTokensIssued, stats.tokens_issued],
                [t.statTokensClaimed, stats.tokens_claimed],
                [t.statTokensPending, stats.tokens_pending],
              ] as Array<[string, string]>).map(([label, value]) => (
                <div key={label} className="rounded-xl border border-line bg-paper-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-brass-600">
                    {Number(value).toLocaleString("en-US")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "videos" && (
          <section className="mt-8">
            <div className="flex flex-wrap gap-2">
              {[undefined, "submitted", "approved", "rejected"].map((f) => (
                <button
                  key={f ?? "all"}
                  onClick={() => setVideoFilter(f)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${
                    videoFilter === f ? "bg-brass-400/20 text-brass-600" : "border border-line bg-paper-50 text-ink-700"
                  }`}
                >
                  {f === undefined ? t.filterAll : COPY[locale][`filter${f.charAt(0).toUpperCase()}${f.slice(1)}` as keyof typeof t]}
                </button>
              ))}
            </div>
            {rewardMsg && <p className="mt-3 text-sm font-medium text-emerald-700">{rewardMsg}</p>}
            {videos.length === 0 ? (
              <p className="mt-4 text-sm text-ink-500">{t.emptyList}</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-paper-50">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-500">
                      <th className="px-4 py-3 text-start">{t.colTitle}</th>
                      <th className="px-4 py-3 text-start">{t.colFormat}</th>
                      <th className="px-4 py-3 text-start">{t.colLang}</th>
                      <th className="px-4 py-3 text-start">{t.colStatus}</th>
                      <th className="px-4 py-3 text-start">{t.colReward}</th>
                      <th className="px-4 py-3 text-start">{t.colActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map((v) => (
                      <tr key={v.id} className="border-b border-line/60 last:border-0">
                        <td className="max-w-[240px] truncate px-4 py-3 font-medium text-ink-950">{v.title}</td>
                        <td className="px-4 py-3 capitalize text-ink-700">{v.format}</td>
                        <td className="px-4 py-3 uppercase text-ink-500">{v.language}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE[v.status] ?? "bg-paper-100 text-ink-500"}`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <RewardInput value={v.reward_amount ?? ""} onSave={(val) => void saveVideoReward(v.id, val)} />
                        </td>
                        <td className="px-4 py-3">
                          {(v.status === "submitted" || v.status === "under_review" || v.status === "rejected" || v.status === "draft") && (
                            <div className="flex gap-2">
                              <button onClick={() => reviewVideo(v.id, "approve")} className="text-xs font-semibold text-emerald-700 hover:underline">
                                {t.approve}
                              </button>
                              <button onClick={() => reviewVideo(v.id, "reject")} className="text-xs font-semibold text-red-600 hover:underline">
                                {t.reject}
                              </button>
                            </div>
                          )}
                          {v.status === "approved" && (
                            <button onClick={() => reviewVideo(v.id, "publish")} className="text-xs font-semibold text-brass-600 hover:underline">
                              {t.publish}
                            </button>
                          )}
                          {v.status === "published" && (
                            <button onClick={() => reviewVideo(v.id, "unpublish")} className="text-xs font-semibold text-ink-500 hover:underline">
                              {t.unpublish}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
        {tab === "experts" && (
          <section className="mt-8">
            {experts.length === 0 ? (
              <p className="text-sm text-ink-500">{t.emptyList}</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-line bg-paper-50">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-500">
                      <th className="px-4 py-3 text-start">{t.displayName}</th>
                      <th className="px-4 py-3 text-start">{t.headlineCol}</th>
                      <th className="px-4 py-3 text-start">{t.colStatus}</th>
                      <th className="px-4 py-3 text-start">{t.colActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experts.map((e) => (
                      <tr key={e.id} className="border-b border-line/60 last:border-0">
                        <td className="px-4 py-3 font-medium text-ink-950">{e.display_name}</td>
                        <td className="max-w-[220px] truncate px-4 py-3 text-ink-500">{e.headline ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE[e.status] ?? "bg-paper-100 text-ink-500"}`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {e.status !== "approved" && (
                              <button onClick={() => reviewExpert(e.id, "approved")} className="text-xs font-semibold text-emerald-700 hover:underline">
                                {t.approve}
                              </button>
                            )}
                            {e.status !== "rejected" && e.status !== "suspended" && (
                              <button onClick={() => reviewExpert(e.id, e.status === "pending" ? "rejected" : "suspended")} className="text-xs font-semibold text-red-600 hover:underline">
                                {e.status === "pending" ? t.reject : t.suspend}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === "partners" && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
            <div className={partners.length === 0 && !partnerForm.name ? "" : "overflow-x-auto rounded-xl border border-line bg-paper-50"}>
              {partners.length === 0 && !partnerForm.name ? (
                <p className="rounded-xl border border-line bg-paper-50 p-6 text-sm text-ink-500">{t.emptyList}</p>
              ) : (
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-500">
                      <th className="px-4 py-3 text-start">{t.partnerName}</th>
                      <th className="px-4 py-3 text-start">{t.partnerWebsite}</th>
                      <th className="px-4 py-3 text-start">{t.partnerActive}</th>
                      <th className="px-4 py-3 text-start">{t.colActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((p) => (
                      <tr key={p.id} className="border-b border-line/60 last:border-0">
                        <td className="max-w-[220px] truncate px-4 py-3 font-medium text-ink-950">{p.name}</td>
                        <td className="max-w-[220px] truncate px-4 py-3 text-ink-500">{p.website_url ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.is_active ? "bg-emerald-500/10 text-emerald-700" : "bg-paper-100 text-ink-500"}`}>
                            {p.is_active ? t.partnerActive : t.filterRejected}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            <button onClick={() => startEditPartner(p)} className={`text-xs font-semibold ${partnerForm.id === p.id ? "text-ink-500" : "text-brass-600 hover:underline"}`}>
                              {partnerForm.id === p.id ? "✓" : t.save}
                            </button>
                            <button onClick={() => deletePartner(p.id)} className="text-xs font-semibold text-red-600 hover:underline">
                              {t.partnerDelete}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void savePartner();
              }}
              className="h-fit rounded-xl border border-line bg-paper-50 p-5"
            >
              <h2 className="font-display text-base font-semibold text-ink-950">
                {partnerForm.id ? t.partnerUpdate : t.partnerNew}
              </h2>
              {partnerMsg && <p className="mt-2 text-sm font-medium text-emerald-700">{partnerMsg}</p>}
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.partnerName}</span>
                <input value={partnerForm.name} onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })} className={inputCls} required />
              </label>
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.partnerLogo}</span>
                <input value={partnerForm.logo_url} onChange={(e) => setPartnerForm({ ...partnerForm, logo_url: e.target.value })} className={inputCls} placeholder="https://…" />
              </label>
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.partnerWebsite}</span>
                <input value={partnerForm.website_url} onChange={(e) => setPartnerForm({ ...partnerForm, website_url: e.target.value })} className={inputCls} placeholder="https://…" />
              </label>
              <label className="mt-3 block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.partnerDesc}</span>
                <textarea rows={3} value={partnerForm.description} onChange={(e) => setPartnerForm({ ...partnerForm, description: e.target.value })} className={`${inputCls} h-auto py-2`} />
              </label>
              <label className="mt-3 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={partnerForm.is_active}
                  onChange={(e) => setPartnerForm({ ...partnerForm, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-line accent-brass-600"
                />
                <span className="text-sm font-medium text-ink-700">{t.partnerActive}</span>
              </label>
              <div className="mt-4 flex items-center gap-3">
                <Button variant="primary" type="submit">{partnerForm.id ? t.save : t.add}</Button>
                {partnerForm.id && (
                  <button type="button" onClick={resetPartnerForm} className="text-sm font-semibold text-ink-500 hover:underline">
                    {t.cancel}
                  </button>
                )}
              </div>
            </form>
          </section>
        )}

        {tab === "users" && (
          <section className="mt-8">
            <div className="overflow-x-auto rounded-xl border border-line bg-paper-50">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-500">
                    <th className="px-4 py-3 text-start">{t.emailCol}</th>
                    <th className="px-4 py-3 text-start">{t.roleCol}</th>
                    <th className="px-4 py-3 text-start">{t.colStatus}</th>
                    <th className="px-4 py-3 text-start">{t.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-line/60 last:border-0">
                      <td className="max-w-[240px] truncate px-4 py-3 font-medium text-ink-950">{u.email}</td>
                      <td className="px-4 py-3 capitalize text-ink-500">{u.role}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE[u.status] ?? "bg-paper-100 text-ink-500"}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.status === "active" ? (
                          <button onClick={() => setUserStatus(u.id, "suspended")} className="text-xs font-semibold text-red-600 hover:underline">
                            {t.suspend}
                          </button>
                        ) : (
                          <button onClick={() => setUserStatus(u.id, "active")} className="text-xs font-semibold text-emerald-700 hover:underline">
                            {t.activate}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "settings" && settings && (
          <section className="mt-8 max-w-xl rounded-xl border border-line bg-paper-50 p-6">
            {([
              ["default_video_reward", t.defaultReward],
              ["course_bonus_reward", t.courseBonus],
              ["default_watch_percentage", t.watchPct],
              ["daily_claim_limit", t.dailyLimit],
              ["min_account_age_days", t.minAge],
            ] as Array<[keyof RewardSettingsData, string]>).map(([key, label]) => {
              const value = settings[key];
              const isNumber = typeof value === "number";
              return (
                <label key={key} className="mt-4 block first:mt-0">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{label}</span>
                  <input
                    type={isNumber ? "number" : "text"}
                    value={String(value)}
                    onChange={(ev) =>
                      setSettings({
                        ...settings,
                        [key]: isNumber ? Number(ev.target.value) : ev.target.value,
                      })
                    }
                    className={inputCls}
                  />
                </label>
              );
            })}
            <div className="mt-5 flex items-center gap-3">
              <Button variant="primary" onClick={saveSettings}>{t.save}</Button>
              {savedMsg && <span className="text-sm font-medium text-emerald-700">{savedMsg}</span>}
            </div>
          </section>
        )}

        {tab === "post" && (
          <section className="mt-8 max-w-xl">
            <h2 className="font-display text-lg font-semibold text-ink-950">{t.postHeading}</h2>
            <p className="mb-4 mt-1 text-sm text-ink-500">{t.postSub}</p>
            {postState === "ok" && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {t.postOk}
              </div>
            )}
            <div className="rounded-xl border border-line bg-paper-50 p-6">
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.fTitle}</span>
                <input value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} className={inputCls} />
              </label>
              <label className="mt-4 block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.fUrl}</span>
                <input value={post.source_url} onChange={(e) => setPost({ ...post, source_url: e.target.value })} className={inputCls} />
              </label>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.fDurationMin}</span>
                  <input type="number" min={0} value={post.duration_minutes} onChange={(e) => setPost({ ...post, duration_minutes: e.target.value })} className={inputCls} placeholder="0" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.fDurationSec}</span>
                  <input type="number" min={0} max={59} value={post.duration_seconds} onChange={(e) => setPost({ ...post, duration_seconds: e.target.value })} className={inputCls} placeholder="0" />
                </label>
              </div>
              <label className="mt-4 block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.fFormat}</span>
                <select value={post.format} onChange={(e) => setPost({ ...post, format: e.target.value })} className={inputCls}>
                  <option value="long">{t.longF}</option>
                  <option value="short">{t.shortF}</option>
                  <option value="course">{t.courseF}</option>
                </select>
              </label>
              <label className="mt-4 flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={post.documentary}
                  onChange={(e) => setPost({ ...post, documentary: e.target.checked })}
                  className="h-4 w-4 rounded border-line accent-brass-600"
                />
                <span className="text-sm font-medium text-ink-700">{t.fDocumentary}</span>
              </label>
              <label className="mt-4 block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.fReward}</span>
                <input
                  type="number"
                  min={0}
                  step="any"
                  value={post.reward}
                  placeholder={t.fRewardEmpty}
                  onChange={(e) => setPost({ ...post, reward: e.target.value })}
                  className={inputCls}
                />
              </label>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.fDifficulty}</span>
                  <select value={post.difficulty} onChange={(e) => setPost({ ...post, difficulty: e.target.value })} className={inputCls}>
                    <option value="beginner">{t.beginner}</option>
                    <option value="intermediate">{t.intermediate}</option>
                    <option value="advanced">{t.advanced}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.fLang}</span>
                  <select value={post.language} onChange={(e) => setPost({ ...post, language: e.target.value })} className={inputCls}>
                    <option value="en">{t.langEn}</option>
                    <option value="ar">{t.langAr}</option>
                  </select>
                </label>
              </div>
              {courses.length > 0 && (
                <label className="mt-4 block">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.courseSelector}</span>
                  <select value={post.course_id} onChange={(e) => setPost({ ...post, course_id: e.target.value })} className={inputCls}>
                    <option value="">{t.noCourse}</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </label>
              )}
              <label className="mt-4 block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.fDesc}</span>
                <textarea rows={3} value={post.description} onChange={(e) => setPost({ ...post, description: e.target.value })} className={`${inputCls} h-auto py-2`} />
              </label>
              <div className="mt-5">
                <Button
                  variant="primary"
                  onClick={() => {
                    void submitPost();
                  }}
                  disabled={postState === "busy"}
                >
                  {postState === "busy" ? t.posting : t.submitPost}
                </Button>
              </div>
            </div>
          </section>
        )}

        {tab === "password" && (
          <section className="mt-8 max-w-xl rounded-xl border border-line bg-paper-50 p-6">
            <h2 className="font-display text-lg font-semibold text-ink-950">{t.tabPassword}</h2>
            {passwordState === "ok" && (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {t.passwordSuccess}
              </div>
            )}
            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.currentPassword}</span>
              <input
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className={inputCls}
              />
            </label>
            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.newPassword}</span>
              <input
                type="password"
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                className={inputCls}
              />
            </label>
            <label className="mt-4 block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.confirmPassword}</span>
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className={inputCls}
              />
            </label>
            {passwordState === "error" && (
              <p className="mt-3 text-sm text-red-600">{t.passwordsNoMatch}</p>
            )}
            <div className="mt-5">
              <Button
                variant="primary"
                onClick={() => { void handleChangePassword(); }}
                disabled={passwordState === "busy"}
              >
                {t.changePassword}
              </Button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
