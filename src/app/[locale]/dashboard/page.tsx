"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError, type DashboardSummary, type ProgressRow, type RewardLedgerEntry } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useSession } from "@/components/session/SessionProvider";

const COPY = {
  en: {
    heading: "My Dashboard",
    subhead: "Your learning progress, rewards and wallet in one place.",
    hi: "Welcome back",
    balance: "ACAD-P balance",
    balanceNote:
      "Your ACAD-P balance is held on-platform as credits. Real on-chain token distribution will open at a later stage — no external wallet is needed to hold them.",
    pendingRewards: "Pending rewards",
    claimedTotal: "Total claimed",
    lessonsDone: "Lessons completed",
    coursesDone: "Courses completed",
    continueWatching: "Continue watching",
    nothingInProgress: "Nothing in progress yet.",
    browseShorts: "Browse shorts",
    browseCourses: "Explore courses",
    resume: "Resume",
    done: "Completed",
    walletTitle: "My Academy Prime wallet",
    depositAddr: "Solana deposit address",
    depositNote:
      "Add the Solana wallet address you control. When ACAD-P on-chain distribution opens, we will send your tokens to this address. You can change it at any time.",
    addrPlaceholder: "Paste your Solana address (base58)",
    saveAddr: "Save address",
    changeAddr: "Change",
    cancelAddr: "Cancel",
    copyAddr: "Copy",
    copied: "Copied",
    addrSavedSet: "Address saved.",
    addrAlready: "This address is already set.",
    invalidAddr: "Please enter a valid Solana address (32-44 base58 characters).",
    addrSaveError: "Could not save address. Please try again.",
    addrVerified: "Deposit address",
    rewardsTitle: "Recent rewards",
    rewardEmpty: "Watch a lesson to earn your first reward.",
    colType: "Type",
    colAmount: "Amount",
    colStatus: "Status",
    colDate: "Date",
    needLogin: "Log in to see your dashboard.",
    goLogin: "Log in",
    loadError: "Could not load your data. Is the API running?",
    studioTitle: "Creator? Share what you know.",
    studioSub: "Post lessons and shorts from your studio.",
    studioBtn: "Open Studio",
  },
  ar: {
    heading: "لوحتي",
    subhead: "تعلّمك ومكافآتك ومحفظتك في مكان واحد.",
    hi: "مرحباً بعودتك",
    balance: "رصيد ACAD-P",
    balanceNote:
      "رصيد ACAD-P الخاص بك محفوظ على المنصة كأرصدة. توزيع الرموز الحقيقي سيُفتح في مرحلة لاحقة — لا حاجة لمحفظة خارجية للاحتفاظ بها.",
    pendingRewards: "مكافآت معلّقة",
    claimedTotal: "إجمالي المصروف",
    lessonsDone: "دروس مكتملة",
    coursesDone: "دورات مكتملة",
    continueWatching: "أكمل المشاهدة",
    nothingInProgress: "لا يوجد شيء قيد المشاهدة بعد.",
    browseShorts: "تصفح المقاطع",
    browseCourses: "استكشف الدورات",
    resume: "متابعة",
    done: "مكتمل",
    walletTitle: "محفظة أكاديمية برايم",
    depositAddr: "عنوان إيداع سولانا",
    depositNote:
      "أضف عنوان محفظة سولانا الذي تملكه. عندما يُفتح توزيع ACAD-P على السلسلة، سنرسل رموزك إلى هذا العنوان. يمكنك تغييره في أي وقت.",
    addrPlaceholder: "الصق عنوان سولانا الخاص بك",
    saveAddr: "حفظ العنوان",
    changeAddr: "تغيير",
    cancelAddr: "إلغاء",
    copyAddr: "نسخ",
    copied: "تم النسخ",
    addrSavedSet: "تم حفظ العنوان.",
    addrAlready: "هذا العنوان مضبوط بالفعل.",
    invalidAddr: "يرجى إدخال عنوان سولانا صالح (32-44 حرفاً).",
    addrSaveError: "تعذّر حفظ العنوان. حاول مجدداً.",
    addrVerified: "عنوان الإيداع",
    rewardsTitle: "أحدث المكافآت",
    rewardEmpty: "شاهد درساً لتحصل على أول مكافأة.",
    colType: "النوع",
    colAmount: "المبلغ",
    colStatus: "الحالة",
    colDate: "التاريخ",
    needLogin: "سجّل الدخول لعرض لوحتك.",
    goLogin: "تسجيل الدخول",
    loadError: "تعذّر تحميل بياناتك. هل الخدمة تعمل؟",
    studioTitle: "صاحب محتوى؟ شارك ما تعرفه.",
    studioSub: "انشر الدروس والمقاطع من استوديوك.",
    studioBtn: "افتح الاستوديو",
  },
};

const num = (v: string) => Number(v).toLocaleString("en-US");

const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const shortAddr = (a: string) => (a.length > 16 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-line bg-paper-50 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-ink-950">{value}</p>
    </div>
  );
}

export default function DashboardPage({ params }: { params: { locale: string } }) {
  const locale = params.locale === "ar" ? "ar" : "en";
  const t = COPY[locale];
  const rtl = locale === "ar";
  const { me, loading: sessionLoading } = useSession();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [rewards, setRewards] = useState<RewardLedgerEntry[]>([]);
  const [error, setError] = useState("");
  const [addrInput, setAddrInput] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wlError, setWlError] = useState("");
  const [wlOk, setWlOk] = useState("");
  const [copied, setCopied] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      setError("");
      const [s, p, r] = await Promise.all([
        api.dashboard(),
        api.myProgress(),
        api.myRewards(),
      ]);
      setSummary(s);
      setProgress(p.items);
      setRewards(r.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.loadError);
    }
  }, [t.loadError]);

  useEffect(() => {
    if (me) void loadAll();
  }, [me, loadAll]);

  if (sessionLoading) {
    return <div className="container-content py-24 text-sm text-ink-500">…</div>;
  }

  if (!me) {
    return (
      <div className="container-content flex flex-col items-center gap-4 py-28">
        <p className="text-lg text-ink-700">{t.needLogin}</p>
        <Button variant="primary" href={`/${locale}/login`}>
          {t.goLogin}
        </Button>
      </div>
    );
  }

  const inProgress = progress.filter((p) => !p.completed).slice(0, 6);
  const completedCount = progress.filter((p) => p.completed).length;

  const currentAddr = summary?.wallet_address ?? null;

  const saveAddress = async () => {
    const a = addrInput.trim();
    if (!SOLANA_RE.test(a)) {
      setWlError(t.invalidAddr);
      setWlOk("");
      return;
    }
    if (currentAddr === a) {
      setEditing(false);
      setWlError("");
      setWlOk(t.addrAlready);
      return;
    }
    setSaving(true);
    setWlError("");
    setWlOk("");
    try {
      await api.linkWallet(a);
      setWlOk(t.addrSavedSet);
      setSummary((s) => (s ? { ...s, wallet_address: a } : s));
      setEditing(false);
      setAddrInput("");
    } catch (err) {
      setWlError(err instanceof ApiError ? err.message : t.addrSaveError);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    setAddrInput(currentAddr ?? "");
    setWlError("");
    setWlOk("");
    setEditing(true);
  };

  const copyAddress = () => {
    if (!currentAddr) return;
    void navigator.clipboard
      .writeText(currentAddr)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <main className="min-h-screen bg-paper-100 pb-20" dir={rtl ? "rtl" : "ltr"}>
      <div className="container-content pt-12">
        <p className="text-sm font-medium text-brass-600">{t.hi}, {me.username} 👋</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink-950">{t.heading}</h1>
        <p className="mt-1 text-sm text-ink-500">{t.subhead}</p>

        {(me.role === "expert" || me.role === "admin") && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brass-400/40 bg-brass-400/5 p-5">
            <div>
              <p className="font-display text-base font-semibold text-ink-950">{t.studioTitle}</p>
              <p className="text-sm text-ink-500">{t.studioSub}</p>
            </div>
            <Button variant="primary" href={`/${locale}/expert`}>{t.studioBtn}</Button>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!summary ? (
          <p className="mt-10 text-sm text-ink-500">…</p>
        ) : (
          <>
            <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label={t.balance} value={num(summary.available)} />
              <StatCard label={t.pendingRewards} value={num(summary.pending)} />
              <StatCard label={t.claimedTotal} value={num(summary.claimed)} />
              <StatCard label={t.lessonsDone} value={summary.lessons_completed} />
              <StatCard label={t.coursesDone} value={summary.courses_completed} />
            </section>

            <section className="mt-8 rounded-xl border border-line bg-paper-50 p-5">
              <h2 className="font-display text-lg font-semibold text-ink-950">{t.walletTitle}</h2>
              <div className="mt-3 flex items-end gap-2">
                <p className="font-display text-4xl font-bold text-ink-950">{num(summary.available)}</p>
                <span className="pb-1 text-sm font-bold text-brass-600">ACAD-P</span>
              </div>
<p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500">{t.balanceNote}</p>

              <div className="mt-6 border-t border-line pt-5">
                <p className="text-sm font-semibold text-ink-950">{t.depositAddr}</p>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-500">{t.depositNote}</p>

                {wlError && <p className="mt-3 text-sm font-medium text-red-600">{wlError}</p>}
                {wlOk && <p className="mt-3 text-sm font-medium text-emerald-700">{wlOk}</p>}

                {!currentAddr || editing ? (
                  <div className="mt-3 flex max-w-2xl flex-wrap items-center gap-2">
                    <input
                      value={addrInput}
                      onChange={(e) => setAddrInput(e.target.value)}
                      placeholder={t.addrPlaceholder}
                      dir="ltr"
                      className="min-w-[260px] flex-1 rounded-lg border border-line bg-paper-50 px-3 py-2 font-mono text-sm text-ink-900 outline-none focus:border-brass-500"
                    />
                    <Button variant="secondary" onClick={() => void saveAddress()} disabled={saving}>
                      {t.saveAddr}
                    </Button>
                    {editing && currentAddr && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditing(false);
                          setWlError("");
                          setWlOk("");
                        }}
                      >
                        {t.cancelAddr}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 flex max-w-2xl flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brass-400/15 px-2.5 py-0.5 text-xs font-semibold text-brass-700">
                      {t.addrVerified}
                    </span>
                    <code
                      dir="ltr"
                      className="rounded-lg border border-line bg-paper-50 px-3 py-2 font-mono text-sm text-ink-900"
                    >
                      {shortAddr(currentAddr)}
                    </code>
                    <Button variant="ghost" onClick={copyAddress}>
                      {copied ? t.copied : t.copyAddr}
                    </Button>
                    <Button variant="secondary" onClick={startEdit}>
                      {t.changeAddr}
                    </Button>
                  </div>
                )}
              </div>
            </section>
            <section className="mt-8">
              <h2 className="font-display text-lg font-semibold text-ink-950">{t.continueWatching}</h2>
              {inProgress.length === 0 && completedCount === 0 ? (
                <div className="mt-3 rounded-xl border border-dashed border-line bg-paper-50 p-8 text-center">
                  <p className="text-sm text-ink-500">{t.nothingInProgress}</p>
                  <div className="mt-4 flex justify-center gap-3">
                    <Button variant="primary" href={`/${locale}/shorts`}>{t.browseShorts}</Button>
                    <Button variant="secondary" href={`/${locale}/courses`}>{t.browseCourses}</Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {inProgress.map((p) => {
                    const pct = Math.round(Number(p.percentage));
                    return (
                      <Link
                        key={p.video_id}
                        href={`/${locale}/watch/${p.video_id}`}
                        className="group overflow-hidden rounded-xl border border-line bg-paper-50 transition-shadow hover:shadow-md"
                      >
                        <div
                          className="h-36 w-full bg-paper-200 bg-cover bg-center"
                          style={p.thumbnail_url ? { backgroundImage: `url(${p.thumbnail_url})` } : undefined}
                        />
                        <div className="p-4">
                          <p className="truncate text-sm font-medium text-ink-950 group-hover:text-brass-600">
                            {p.title}
                          </p>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper-200">
                            <div className="h-full rounded-full bg-brass-400" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <p className="mt-1.5 text-xs text-ink-500">{t.resume} · {pct}%</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="mt-10">
              <h2 className="font-display text-lg font-semibold text-ink-950">{t.rewardsTitle}</h2>
              {rewards.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-line bg-paper-50 p-6 text-center text-sm text-ink-500">
                  {t.rewardEmpty}
                </p>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-paper-50">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-line text-start text-xs uppercase tracking-wide text-ink-500">
                        <th className="px-4 py-3 text-start">{t.colType}</th>
                        <th className="px-4 py-3 text-start">{t.colAmount}</th>
                        <th className="px-4 py-3 text-start">{t.colStatus}</th>
                        <th className="px-4 py-3 text-start">{t.colDate}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rewards.map((r) => (
                        <tr key={r.id} className="border-b border-line/60 last:border-0">
                          <td className="px-4 py-3 capitalize text-ink-700">{r.source_type.replace(/_/g, " ")}</td>
                          <td className="px-4 py-3 font-medium text-ink-950">{num(r.amount)}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "claimed" ? "bg-emerald-500/10 text-emerald-700" : "bg-brass-400/15 text-brass-600"}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-ink-500">
                            {new Date(r.created_at).toLocaleDateString(locale)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
