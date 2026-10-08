"use client";

import { useEffect } from "react";

const KEY = "ap_build_version";

// Every deploy bumps public/build-version.json. When a stale copy of the app
// (open tab, browser cache, or leftover DNS route) detects a new version, it
// reloads once to pick up the fresh bundle.
export function RefreshWatcher() {
  useEffect(() => {
    let reloading = false;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/build-version.json?v=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const current = String(data.version ?? "");
        if (!current) return;
        const seen = window.localStorage.getItem(KEY);
        if (seen !== null && seen !== "" && seen !== current && !reloading) {
          reloading = true;
          window.localStorage.setItem(KEY, current);
          window.location.reload();
          return;
        }
        window.localStorage.setItem(KEY, current);
      } catch {
        // transient network hiccup - ignore, try again next load
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}