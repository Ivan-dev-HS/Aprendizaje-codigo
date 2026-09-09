import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AuthUser } from "@codeforge/types";
import { setAccessToken, setOnAuthFailure } from "../../lib/token-store";
import { authApi } from "./auth.api";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUserState] = useState<AuthUser | null>(null);
  // Evita que React 18 StrictMode (que en desarrollo invoca los efectos dos
  // veces) dispare dos POST /auth/refresh en paralelo: al ser el refresh
  // token de un solo uso (se rota en cada canje), la segunda petición
  // consumiría un token ya invalidado por la primera y forzaría un
  // logout falso. AuthProvider vive una sola vez para toda la app, así
  // que un guard por instancia (no un cleanup) es la solución correcta.
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    async function bootstrap() {
      try {
        const session = await authApi.refresh();
        setAccessToken(session.accessToken);
        setUserState(session.user);
        setStatus("authenticated");
      } catch {
        setAccessToken(null);
        setUserState(null);
        setStatus("anonymous");
      }
    }

    void bootstrap();
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
