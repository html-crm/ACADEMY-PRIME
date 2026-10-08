"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError, type ExpertProfile, type SubmittedVideo, type CoursePublic } from "@/lib/api";
import { useSession } from "@/components/session/SessionProvider";

type Earnings = Awaited<ReturnType<typeof api.myExpertEarnings>>;

const COPY = {
  en: {
    heading: "Expert Studio",
    subhead: "Post lessons, shorts and courses. Approved posts go live after admin review.",
    applyTitle: "Become an expert",
    displayName: "Display name",
    headline: "Headline",
    bio: "Short bio",
    links: "Links (comma-separated)",
    apply: "Submit application",
    pending: "Your application is pending review.",
    rejected: "Your application was not approved.",
    suspended: "Your expert account is suspended. Contact support.",
    postNew: "Post a video",
    editVideo: "Edit video",
    type: "Type",
    fDocumentary: "Documentary",
    long: "Lesson (long)",
    documentary: "Documentary",
    short: "Short (≤60s)",
    course: "Course",
    title: "Title",
    url: "Video URL (YouTube, Instagram, Vimeo, TikTok, or other)",
    description: "Description",
    durationMin: "Duration (minutes)",
    durationSec: "Seconds",
    duration: "Duration",
    difficulty: "Difficulty",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    languageEn: "English",
    languageAr: "العربية",
    submit: "Submit for review",
    saveChanges: "Save changes",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Delete this post?",
    myPosts: "My posts",
    earningsTitle: "Earnings",
    videosTotal: "Posts",
    videosPublished: "Published",
    completions: "Completions",
    learnerRewards: "Rewards generated for learners",
    balancePending: "Balance (pending payout)",
    paidOut: "Paid out",
    needLogin: "Log in to open the studio.",
    goLogin: "Log in",
    empty: "No posts yet.",
    shortTooLong: "Shorts must be 60 seconds or less.",
    courseSelector: "Assign to course (optional)",
    noCourse: "No course (standalone)",
    category: "Category",
    noCategory: "No category (optional)",
  },
  ar: {
    heading: "استوديو الخبير",
    subhead: "انشر الدروس والمقاطع والدورات. تُنشر الموافقة بعد مراجعة المشرف.",
    applyTitle: "كن خبيراً",
    displayName: "الاسم الظاهر",
    headline: "العنوان الوصفي",
    bio: "نبذة قصيرة",
    links: "روابط (مفصولة بفواصل)",
    apply: "إرسال الطلب",
    pending: "طلبك قيد المراجعة.",
    rejected: "لم يتم قبول طلبك.",
    suspended: "حساب الخبير معلّق. تواصل مع الدعم.",
    postNew: "انشر فيديو",
    editVideo: "تعديل الفيديو",
    type: "النوع",
    fDocumentary: "وثائقي",
    long: "درس (طويل)",
    documentary: "وثائقي",
    short: "قصير (≤٦٠ث)",
    course: "دورة",
    title: "العنوان",
    url: "رابط الفيديو (يوتيوب، إنستغرام، فيميو، تيك توك، أو مصدر آخر)",
    description: "الوصف",
    durationMin: "المدة (بالدقائق)",
    durationSec: "الثواني",
    duration: "المدة",
    difficulty: "المستوى",
    beginner: "مبتدئ",
    intermediate: "متوسط",
    advanced: "متقدم",
    languageEn: "English",
    languageAr: "العربية",
    submit: "إرسال للمراجعة",
    saveChanges: "حفظ التعديلات",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    confirmDelete: "حذف هذا المنشور؟",
    myPosts: "منشوراتي",
    earningsTitle: "الأرباح",
    videosTotal: "المنشورات",
    videosPublished: "منشورة",
    completions: "مرات الإكمال",
    learnerRewards: "مكافآت ولّدتها للمتعلمين",
    balancePending: "الرصيد (بانتظار الصرف)",
    paidOut: "تم صرفه",
    needLogin: "سجّل الدخول لفتح الاستوديو.",
    goLogin: "تسجيل الدخول",
    empty: "لا منشورات بعد.",
    shortTooLong: "الحد الأقصى للمقطع القصير ٦٠ ثانية.",
    courseSelector: "إضافة إلى دورة (اختياري)",
    noCourse: "بدون دورة (مستقل)",
    category: "التصنيف",
    noCategory: "بدون تصنيف (اختياري)",
  },
};

const STATUS_TONE: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-700",
  approved: "bg-emerald-500/10 text-emerald-700",
  submitted: "bg-brass-400/15 text-brass-600",
  draft: "bg-paper-100 text-ink-500",
  rejected: "bg-red-50 text-red-600",
  suspended: "bg-red-50 text-red-600",
};

const inputCls =
  "h-11 w-full rounded-lg border border-line bg-paper-50 px-4 text-sm outline-none focus:border-brass-400";

const fmtDuration = (s: number | null | undefined): string => {
  if (!s || s <= 0) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

interface FormState {
  title: string;
  source_url: string;
  description: string;
  duration_minutes: string;
  duration_seconds: string;
  difficulty: string;
  format: "long" | "short" | "course";
  documentary: boolean;
  language: string;
  course_id: string;
  category_id: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  source_url: "",
  description: "",
  duration_minutes: "",
  duration_seconds: "",
  difficulty: "beginner",
  format: "long",
  documentary: false,
  language: "en",
  course_id: "",
  category_id: "",
};

export default function ExpertStudioPage({ params }: { params: { locale: string } }) {
  const locale = params.locale === "ar" ? "ar" : "en";
  const t = COPY[locale];
  const { me, loading: sessionLoading } = useSession();

  const [profile, setProfile] = useState<ExpertProfile | null>(null);
  const [profileChecked, setProfileChecked] = useState(false);
  const [videos, setVideos] = useState<SubmittedVideo[]>([]);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [courses, setCourses] = useState<CoursePublic[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formNotice, setFormNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState("");

  const reloadAll = useCallback(async () => {
    try {
      const p = await api.myExpertProfile();
      setProfile(p);
      if (p.status === "approved") {
        const [v, e, c, cats] = await Promise.all([
          api.mySubmittedVideos(),
          api.myExpertEarnings(),
          api.listCourses({ page_size: 100 }),
          api.listCategories(),
        ]);
        setVideos(v);
        setEarnings(e);
        setCourses(c.items);
        setCategories(cats);
      }
    } catch {
      setProfile(null);
    } finally {
      setProfileChecked(true);
    }
  }, []);

  useEffect(() => {
    if (me) void reloadAll();
    else if (!sessionLoading) setProfileChecked(true);
  }, [me, sessionLoading, reloadAll]);

  if (!sessionLoading && !me) {
    return (
      <div className="container-content py-24 text-center">
        <p className="text-sm text-ink-500">{t.needLogin}</p>
        <Link
          href={`/${locale}/login`}
          className="mt-5 inline-flex rounded-full bg-ink-950 px-6 py-2.5 text-sm font-semibold text-paper-50"
        >
          {t.goLogin}
        </Link>
      </div>
    );
  }

  async function onApply(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api.applyExpert({
        display_name: displayName,
        headline: headline || undefined,
        bio: bio || undefined,
        links: links.split(",").map((l) => l.trim()).filter(Boolean),
      });
      await reloadAll();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(video: SubmittedVideo) {
    const total = Math.max(0, Number(video.duration_seconds) || 0);
    setEditingId(video.id);
    setForm({
      title: video.title,
      source_url: video.source_url,
      description: video.description ?? "",
      duration_minutes: String(Math.floor(total / 60)),
      duration_seconds: String(total % 60),
      difficulty: video.difficulty,
      format: video.format === "short" ? "short" : video.format === "course" ? "course" : "long",
      documentary: video.documentary,
      language: video.language || "en",
      course_id: "",
      category_id: video.category_id ?? "",
    });
    setFormError(null);
    setFormNotice(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormNotice(null);
  }

  async function onSubmitOrSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormNotice(null);
    const mins = Number(form.duration_minutes) || 0;
    const secs = Number(form.duration_seconds) || 0;
    const duration = mins * 60 + secs;
    if (!Number.isFinite(duration) || duration <= 0) return;
    if (form.format === "short" && duration > 60) {
      setFormError(t.shortTooLong);
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: form.title,
        source_url: form.source_url,
        description: form.description || undefined,
        duration_seconds: Math.round(duration),
        difficulty: form.difficulty,
        format: form.format,
        documentary: form.documentary,
        language: form.language,
        course_id: form.course_id || undefined,
        category_id: form.category_id || undefined,
      };
      if (editingId) await api.updateSubmittedVideo(editingId, payload);
      else await api.submitVideo(payload);
      resetForm();
      await reloadAll();
    } catch (err) {
      setFormError(
        err instanceof ApiError && err.code === "short_too_long"
          ? t.shortTooLong
          : err instanceof ApiError
            ? err.message
            : "Error",
      );
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(video: SubmittedVideo) {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await api.deleteSubmittedVideo(video.id);
      await reloadAll();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Error");
    }
  }

    return (
    <div className="container-content py-12 md:py-16">
      <h1 className="font-display text-3xl md:text-4xl">{t.heading}</h1>
      <p className="mt-2 text-sm text-ink-500">{t.subhead}</p>

      {!profileChecked ? null : !profile ? (
        <form onSubmit={onApply} className="mx-auto mt-12 w-full max-w-md rounded-xl2 border border-line bg-white p-8 shadow-card">
          <h2 className="font-display text-xl">{t.applyTitle}</h2>
          <input required minLength={2} maxLength={80} placeholder={t.displayName} value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={`${inputCls} mt-6`} />
          <input maxLength={160} placeholder={t.headline} value={headline} onChange={(e) => setHeadline(e.target.value)} className={`${inputCls} mt-3`} />
          <textarea rows={3} maxLength={2000} placeholder={t.bio} value={bio} onChange={(e) => setBio(e.target.value)} className="mt-3 w-full rounded-lg border border-line bg-paper-50 px-4 py-3 text-sm outline-none focus:border-brass-400" />
          <input placeholder={t.links} value={links} onChange={(e) => setLinks(e.target.value)} className={`${inputCls} mt-3`} />
          {formError && <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">{formError}</p>}
          <button disabled={busy} className="mt-6 h-11 w-full rounded-full bg-ink-950 text-sm font-semibold text-paper-50 disabled:opacity-60">
            {t.apply}
          </button>
        </form>
      ) : profile.status === "pending" ? (
        <p className="mt-10 rounded-xl2 border border-brass-400/40 bg-brass-400/10 p-6 text-center text-sm font-medium text-brass-600">{t.pending}</p>
      ) : profile.status === "rejected" ? (
        <p className="mt-10 rounded-xl2 border border-red-300/60 bg-red-50 p-6 text-center text-sm font-medium text-red-700">{t.rejected}</p>
      ) : profile.status === "suspended" ? (
        <p className="mt-10 rounded-xl2 border border-red-300/60 bg-red-50 p-6 text-center text-sm font-medium text-red-700">{t.suspended}</p>
      ) : (
        <>
          {earnings && (
            <section className="mt-10">
              <h2 className="font-display text-lg">{t.earningsTitle}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: t.videosTotal, value: String(earnings.videos_total), accent: false },
                  { label: t.videosPublished, value: String(earnings.videos_published), accent: false },
                  { label: t.completions, value: String(earnings.completions), accent: false },
                  { label: t.learnerRewards, value: `⬡ ${Number(earnings.learner_rewards_issued).toLocaleString()}`, accent: false },
                  { label: t.balancePending, value: `⬡ ${Number(earnings.earnings_pending).toLocaleString()}`, accent: true },
                ].map((card) => (
                  <div key={card.label} className={`rounded-xl2 border p-5 shadow-card ${card.accent ? "border-emerald-600/30 bg-emerald-500/[0.07]" : "border-line bg-white"}`}>
                    <p className="text-xs uppercase tracking-wide text-ink-300">{card.label}</p>
                    <p className={`mt-1.5 font-display text-2xl ${card.accent ? "text-emerald-700" : "text-ink-950"}`}>{card.value}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Post / edit form */}
          <section className="mt-10">
            <h2 className="font-display text-lg">{editingId ? t.editVideo : t.postNew}</h2>
            <form onSubmit={onSubmitOrSave} className="mt-4 rounded-xl2 border border-line bg-white p-7 shadow-card">
              <div className="grid gap-3 sm:grid-cols-2">
                <select aria-label={t.type} value={form.documentary && form.format === "long" ? "documentary" : form.format} onChange={(e) => setForm({ ...form, format: e.target.value === "documentary" ? "long" : (e.target.value as FormState["format"]), documentary: e.target.value === "documentary" ? true : false })} className={`${inputCls} px-3`}>
                  <option value="long">{t.long}</option>
                  <option value="documentary">{t.documentary}</option>
                  <option value="short">{t.short}</option>
                  <option value="course">{t.course}</option>
                </select>
                <input required minLength={5} maxLength={200} placeholder={t.title} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
              </div>
              <input required type="url" placeholder={t.url} value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} className={`${inputCls} mt-3`} />
              <textarea rows={3} maxLength={5000} placeholder={t.description} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-3 w-full rounded-lg border border-line bg-paper-50 px-4 py-3 text-sm outline-none focus:border-brass-400" />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.durationMin}</span>
                  <input required type="number" min={0} placeholder="0" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} className={inputCls} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.durationSec}</span>
                  <input required type="number" min={0} max={59} placeholder="0" value={form.duration_seconds} onChange={(e) => setForm({ ...form, duration_seconds: e.target.value })} className={inputCls} />
                </label>
                <select aria-label={t.difficulty} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={`${inputCls} px-3`}>
                  <option value="beginner">{t.beginner}</option>
                  <option value="intermediate">{t.intermediate}</option>
                  <option value="advanced">{t.advanced}</option>
                </select>
                <select aria-label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className={`${inputCls} px-3`}>
                  <option value="en">{t.languageEn}</option>
                  <option value="ar">{t.languageAr}</option>
                </select>
              </div>
              {categories.length > 0 && (
                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.category}</span>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={`${inputCls} px-3`}>
                    <option value="">{t.noCategory}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </label>
              )}
              {courses.length > 0 && (
                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">{t.courseSelector}</span>
                  <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} className={`${inputCls} px-3`}>
                    <option value="">{t.noCourse}</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </label>
              )}
              {formError && <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">{formError}</p>}
              {formNotice && !formError && <p className="mt-4 rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-700">{formNotice}</p>}
              <div className="mt-5 flex gap-3">
                <button disabled={busy} className="h-11 rounded-full bg-ink-950 px-7 text-sm font-semibold text-paper-50 disabled:opacity-60">
                  {editingId ? t.saveChanges : t.submit}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="h-11 rounded-full border border-line px-6 text-sm font-medium text-ink-500">
                    {t.cancel}
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* My posts */}
          <section className="mt-10">
            <h2 className="font-display text-lg">{t.myPosts}</h2>
            <div className="mt-4 space-y-3">
              {videos.length === 0 && (
                <p className="rounded-xl2 border border-dashed border-line bg-white p-8 text-center text-sm text-ink-300">{t.empty}</p>
              )}
              {videos.map((video) => (
                <article key={video.id} className="flex flex-wrap items-center gap-4 rounded-xl2 border border-line bg-white p-4 shadow-card">
                  <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-ink-900">
                    {video.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-ink-950">{video.title}</h3>
                    <p className="mt-0.5 text-xs text-ink-300">
                      {video.format === "short" ? t.short : video.format === "course" ? t.course : t.long} · {fmtDuration(video.duration_seconds)}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_TONE[video.status] ?? "bg-paper-100 text-ink-500"}`}>
                    {video.status}
                  </span>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => startEdit(video)} className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-ink-700 hover:border-brass-400">
                      {t.edit}
                    </button>
                    <button onClick={() => void onDelete(video)} className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                      {t.delete}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

