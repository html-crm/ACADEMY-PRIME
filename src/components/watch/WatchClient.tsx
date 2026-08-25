"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, getAccessToken, type HeartbeatResult } from "@/lib/api";
import type { CatalogVideo } from "@/types/video";
import { youTubeEmbedUrl } from "@/lib/videoProviders";

type YTPlayer = {
  getCurrentTime: () => number;
  getPlayerState: () => number;
};

type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: Record<string, unknown>,
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT as YTNamespace);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return ytApiPromise;
}

const AR = {
  loginToEarn: "سجّل الدخول لتسجيل تقدمك وكسب المكافأة.",
  completed: "تم إكمال الدرس",
  rewardEligible: "المكافأة مستحقة",
  progress: "التقدم",
  rewardLabel: "المكافأة",
  requiredWatch: "المطلوب للمكافأة",
  viewDashboard: "عرض مكافآتك",
  cannotEmbed: "لا يمكن تضمين هذا الفيديو هنا. لا يسمح مزوّد الفيديو حالياً بتشغيل هذا المحتوى داخل أكاديمي برايم.",
  openSource: "فتح مصدر الفيديو",
};

const EN = {
  loginToEarn: "Log in to track your progress and earn the reward.",
  completed: "LESSON COMPLETED",
  rewardEligible: "REWARD ELIGIBLE",
  progress: "Progress",
  rewardLabel: "Reward",
  requiredWatch: "Required for reward",
  viewDashboard: "View your rewards",
  cannotEmbed:
    "This video cannot be embedded here. The video provider does not currently allow this content to be played inside ACADEMY PRIME.",
  openSource: "Open Video Source",
};

export function WatchClient({ video, locale }: { video: CatalogVideo; locale: string }) {
  const copy = locale === "ar" ? AR : EN;
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [result, setResult] = useState<HeartbeatResult | null>(null);
  const [earned, setEarned] = useState(false);

  const playerRef = useRef<YTPlayer | null>(null);
  const fallbackSeconds = useRef(0);

  useEffect(() => setAuthed(Boolean(getAccessToken())), []);

  const sendHeartbeat = useCallback(
    async (position: number, ended = false) => {
      try {
        const res = await api.heartbeat({
          video_id: video.id,
          position_seconds: Math.floor(position),
          state: "playing",
          ended,
        });
        setResult(res);
        if (res.reward_issued) setEarned(true);
      } catch {
        /* transient errors ignored; the next beat retries */
      }
    },
    [video.id],
  );

  // YouTube interactive player — real playback events drive heartbeats.
  useEffect(() => {
    if (!video || video.provider !== "youtube" || !video.providerVideoId || !authed)
      return;

    let interval: number | null = null;
    let cancelled = false;

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      const mount = document.getElementById("ap-yt-player");
      if (!mount) return;
      playerRef.current = new YT.Player(mount, {
        videoId: video.providerVideoId as string,
        playerVars: { modestbranding: 1, rel: 0 },
        events: {
          onStateChange: (event: { data: number }) => {
            const state = event.data;
            if (state === 1 && interval === null) {
              interval = window.setInterval(() => {
                const p = playerRef.current;
                if (p) void sendHeartbeat(p.getCurrentTime());
              }, 10000);
            }
            if (state !== 1 && interval !== null) {
              window.clearInterval(interval);
              interval = null;
            }
            if (state === 0) {
              const p = playerRef.current;
              if (p) void sendHeartbeat(p.getCurrentTime(), true);
            }
          },
        },
      }) as unknown as YTPlayer;
    });

    return () => {
      cancelled = true;
      if (interval !== null) window.clearInterval(interval);
    };
  }, [video, authed, sendHeartbeat]);

  // Fallback for providers without playback APIs: count visible wall-clock
  // seconds while the page is open and beat every 10s.
  useEffect(() => {
    if (!video || video.provider === "youtube" || !authed || authed === null) return;
    fallbackSeconds.current = result?.max_position_seconds ?? 0;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fallbackSeconds.current += 1;
        if (fallbackSeconds.current % 10 === 0) {
          void sendHeartbeat(fallbackSeconds.current);
        }
      }
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.id, authed]);

  const pct = Number(result?.current_percentage ?? 0);
  const required = video.requiredWatchPercentage || 85;
  const completed = earned || Boolean(result?.completed);

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl2 bg-ink-950 shadow-elevated">
        {video.provider === "youtube" && video.providerVideoId ? (
          <div id="ap-yt-player" className="absolute inset-0 h-full w-full" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="max-w-sm text-sm leading-relaxed text-paper-100/70">{copy.cannotEmbed}</p>
            <a
              href={video.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brass-400 px-5 py-2 text-xs font-semibold text-ink-950"
            >
              {copy.openSource} ↗
            </a>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl2 border border-line bg-white p-6 shadow-card md:p-8">
        <h1 className="font-display text-2xl leading-snug md:text-3xl">{video.title}</h1>
        {video.description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500">{video.description}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-ink-500">
          <span className="rounded-full border border-line px-3 py-1 capitalize">{video.difficulty}</span>
          {video.durationSeconds > 0 && (
            <span className="rounded-full border border-line px-3 py-1">
              {Math.round(video.durationSeconds / 60)} min
            </span>
          )}
          <span className="rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-700">
            ⬡ {video.reward} ACAD-P
          </span>
        </div>

        {/* Progress + completion states */}
        <div className="mt-7 border-t border-line pt-6">
          {completed ? (
            <div className="rounded-lg border border-emerald-600/30 bg-emerald-500/10 p-4 text-center">
              <p className="font-display text-lg tracking-wide text-emerald-700">✓ {copy.completed}</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">⬡ {copy.rewardEligible} · {video.reward} ACAD-P</p>
              <Link
                href={`/${locale}/dashboard`}
                className="mt-3 inline-flex rounded-full bg-ink-950 px-5 py-2 text-xs font-semibold text-paper-50"
              >
                {copy.viewDashboard}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between">
                <span className="text-sm font-medium text-ink-500">{copy.progress}</span>
                <span className="font-display text-2xl text-ink-950">{pct.toFixed(0)}%</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-paper-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-brass-400 transition-all duration-500"
                  style={{ width: `${Math.max(pct, 1)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-ink-300">
                {copy.requiredWatch}: {required}%
              </p>
              {authed === false && (
                <p className="mt-4 rounded-lg border border-brass-400/40 bg-brass-400/10 p-3 text-center text-xs font-medium text-brass-600">
                  <Link href={`/${locale}/login`} className="underline">
                    {copy.loginToEarn}
                  </Link>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
