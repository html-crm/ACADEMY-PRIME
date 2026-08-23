"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, clearTokens, getAccessToken, type Me } from "@/lib/api";

interface SessionValue {
  me: Me | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
}

const SessionContext = createContext<SessionValue>({
  me: null,
  loading: true,
  refresh: async () => {},
  logout: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getAccessToken()) {
      setMe(null);
      setLoading(false);
      return;
    }
    try {
      setMe(await api.me());
    } catch {
      clearTokens();
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    clearTokens();
    setMe(null);
  }, []);

  return (
    <SessionContext.Provider value={{ me, loading, refresh, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  return useContext(SessionContext);
}
