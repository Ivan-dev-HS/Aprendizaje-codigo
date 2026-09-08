import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser } from "@codeforge/types";
import { setAccessToken, setOnAuthFailure } from "../../lib/token-store";
import { authApi } from "./auth.api";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUserState] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const session = await authApi.refresh();
        if (cancelled) return;
        setAccessToken(session.accessToken);
        setUserState(session.user);
        setStatus("authenticated");
      } catch {
        if (cancelled) return;
        setAccessToken(null);
        setUserState(null);
        setStatus("anonymous");
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setOnAuthFailure(() => {
      setUserState(null);
      setStatus("anonymous");
    });
    return () => setOnAuthFailure(null);
  }, []);

  const login = useCallback<AuthContextValue["login"]>(async (input) => {
    const session = await authApi.login(input);
    setAccessToken(session.accessToken);
    setUserState(session.user);
    setStatus("authenticated");
    return session.user;
  }, []);

  const register = useCallback<AuthContextValue["register"]>(async (input) => {
    const session = await authApi.register(input);
    setAccessToken(session.accessToken);
    setUserState(session.user);
    setStatus("authenticated");
    return session.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUserState(null);
      setStatus("anonymous");
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const fresh = await authApi.me();
    setUserState(fresh);
  }, []);

  const setUser = useCallback((next: AuthUser) => setUserState(next), []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, logout, refreshUser, setUser }),
    [status, user, login, register, logout, refreshUser, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
