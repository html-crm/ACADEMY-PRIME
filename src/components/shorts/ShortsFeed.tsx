"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { videoService } from "@/services/videoService";
import type { CatalogVideo } from "@/types/video";
import { mockShorts } from "@/data/shorts.mock";
import { youTubeEmbedUrl } from "@/lib/videoProviders";
import { api, getAccessToken } from "@/lib/api";
import type { Dictionary } from "@/lib/i18n";

interface ShortsFeedProps {
  copy: Dictionary["catalog"]["shorts"];
  locale: string;
}

/**
 * Vertical snap-scrolling feed. Only the slide intersecting the viewport
 * mounts an iframe (performance + autoplay hygiene). While a short is the
 * active slide and the user is logged in, wall-clock heartbeats are sent
 * so the backend can verify genuine watching.
 */
export function ShortsFeed({ copy, locale }: ShortsFeedProps) {
  const [items, setItems] = useState<CatalogVideo[] | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [elapsed, setElapsed] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const authed = useRef(false);

  useEffect(() => {
    authed.current = Boolean(getAccessToken());
    videoService
      .listShorts()
      .then((page) => setItems(page.items.length > 0 ? page.items : mockShorts))
      .catch(() => setItems(mockShorts));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setActiveIndex(index);
          }
        });
      },
      { threshold: 0.6 },
    );
    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  // Wall-clock heartbeat for the active short (server verifies honestly).
  useEffect(() => {
    if (!authed.current || items === null) return;
    const video = items[activeIndex];
    if (!video || video.provider !== "youtube") return; // embed API-less providers skip
    const handle = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setElapsed((prev) => {
        const next = (prev[video.id] ?? 0) + 10;
        void api
          .heartbeat({ video_id: video.id, position_seconds: Math.min(next, video.durationSeconds), state: "playing", ended: next >= video.durationSeconds })
          .catch(() => undefined);
        return { ...prev, [video.id]: next };
      });
    }, 10000);
    return () => window.clearInterval(handle);
  }, [activeIndex, items]);

  if (items === null) {
    return (
      <div className="mx-auto h-[70vh] w-full max-w-[420px] animate-pulse rounded-xl2 bg-paper-200" />
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl2 border border-dashed border-line bg-white p-12 text-center text-sm text-ink-300">
        {copy.empty}
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-[78vh] snap-y snap-mandatory overflow-y-auto rounded-xl2"
      style={{ scrollbarWidth: "none" }}
    >
      {items.map((video, index) => {
        const active = index === activeIndex;
        const pct = video.durationSeconds
          ? Math.min(100, ((elapsed[video.id] ?? 0) / video.durationSeconds) * 100)
          : 0;
        return (
          <section
            key={video.id}
            data-index={index}
            ref={(el) => {
              slideRefs.current[index] = el;
            }}
            className="relative flex h-full snap-start items-center justify-center py-4"
          >
            <div className="relative mx-auto flex h-full w-full max-w-[420px] flex-col overflow-hidden rounded-xl2 bg-ink-950 shadow-elevated">
              <div className="relative flex-1">
                {video.provider === "youtube" && video.providerVideoId ? (
                  active ? (
                    <iframe
                      src={youTubeEmbedUrl(video.providerVideoId, { autoplay: true, mute: false })}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full"
                    />
                  ) : video.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={video.thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
                  ) : null
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
                    <p className="text-sm text-paper-100/60">
                      This video cannot be embedded inside ACADEMY PRIME.
                    </p>
                  </div>
                )}

                {/* Overlay info */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pb-7 text-start">
                  <p className="font-display text-lg leading-snug text-white">{video.title}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-white/70">
                    <span>{video.durationSeconds}s</span>
                    <span>·</span>
                    <span className="font-semibold text-brass-300">+{video.reward} APT</span>
                  </div>
                  {/* Watch progress */}
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-brass-400 transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {index < items.length - 1 && (
              <p aria-hidden className="pointer-events-none absolute bottom-3 text-xs text-ink-300">
                ↓ {copy.nextHint}
              </p>
            )}
            {active && pct >= video.requiredWatchPercentage && (
              <Link
                href={`/${locale}/dashboard`}
                className="absolute end-4 top-6 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-card"
              >
                ✓ +{video.reward} APT
              </Link>
            )}
          </section>
        );
      })}
    </div>
  );
}
