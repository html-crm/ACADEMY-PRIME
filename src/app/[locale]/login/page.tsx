"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, ApiError, saveTokens } from "@/lib/api";
import { useSession } from "@/components/session/SessionProvider";

const COPY = {
  en: {
    heading: "Welcome back",
    subhead: "Log in to continue learning and track your rewards.",
    email: "Email",
    password: "Password",
    submit: "Log In",
    busy: "Signing in…",
    noAccount: "No account yet?",
    createOne: "Create a free account",
  },
  ar: {
    heading: "مرحباً بعودتك",
    subhead: "سجّل الدخول لمتابعة التعلّم وتتبّع مكافآتك.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    submit: "تسجيل الدخول",
    busy: "جارٍ تسجيل الدخول…",
    noAccount: "ليس لديك حساب؟",
    createOne: "أنشئ حساباً مجانياً",
  },
};

export default function LoginPage({ params }: { params: { locale: string } }) {
  const locale = params.locale === "ar" ? "ar" : "en";
  const t = COPY[locale];
  const router = useRouter();
  const { refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const tokens = await api.login({ email, password });
      saveTokens(tokens.access_token, tokens.refresh_token);
      await refresh();
      router.push(`/${locale}/courses`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-content flex min-h-[70vh] items-center justify-center py-16">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl2 border border-line bg-white p-8 shadow-card">
        <h1 className="font-display text-2xl">{t.heading}</h1>
        <p className="mt-2 text-sm text-ink-500">{t.subhead}</p>
        <label className="mt-6 block text-sm font-medium text-ink-700">
          {t.email}
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-paper-50 px-4 text-sm outline-none focus:border-brass-400" />
        </label>
        <label className="mt-4 block text-sm font-medium text-ink-700">
          {t.password}
          <input required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-line bg-paper-50 px-4 text-sm outline-none focus:border-brass-400" />
        </label>
        {error && <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="mt-6 h-11 w-full rounded-full bg-ink-950 text-sm font-semibold tracking-wide text-paper-50 transition-colors hover:bg-ink-900 disabled:opacity-60">
          {busy ? t.busy : t.submit}
        </button>
        <p className="mt-5 text-center text-sm text-ink-500">
          {t.noAccount}{" "}
          <Link href={`/${locale}/register`} className="font-semibold text-brass-600 hover:underline">
            {t.createOne}
          </Link>
        </p>
      </form>
    </div>
  );
}
