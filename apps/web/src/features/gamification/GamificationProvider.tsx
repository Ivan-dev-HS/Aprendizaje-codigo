import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../auth/auth-context";
import { gamificationApi } from "./gamification.api";
import { GamificationContext } from "./gamification-context";
import { LevelUpModal } from "./LevelUpModal";
import { AchievementUnlockModal } from "./AchievementUnlockModal";

/**
 * Mantiene el resumen de gamificación fresco y muestra las celebraciones
 * (subida de nivel, logro desbloqueado) sin importar qué página/mutación las
 * disparó: en vez de tocar cada mutación de la app una por una, se escucha
 * el `MutationCache` global de React Query y se refresca el resumen tras
 * cualquier mutación exitosa. El refresco se debounce (no se dispara una
 * petición por cada mutación individual): varias mutaciones seguidas (p.ej.
 * varios comandos en la Terminal/Git Lab) colapsan en una sola lectura de
 * `GET /gamification/me` tras la última, evitando inflar el volumen de
 * peticiones (y el rate limit) sin perder la sensación de "casi instantáneo".
 */
export function GamificationProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ["gamification", "me"],
    queryFn: gamificationApi.getSummary,
    enabled: status === "authenticated",
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === "updated" && event.mutation.state.status === "success") {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          void queryClient.invalidateQueries({ queryKey: ["gamification"] });
        }, 800);
      }
    });
    return () => {
      unsubscribe();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [queryClient]);

  const previousLevel = useRef<number | null>(null);
  const [levelUpTarget, setLevelUpTarget] = useState<number | null>(null);

  const level = summaryQuery.data?.level;
  useEffect(() => {
    if (level === undefined) return;
    if (previousLevel.current !== null && level > previousLevel.current) {
      setLevelUpTarget(level);
    }
    previousLevel.current = level;
  }, [level]);

  const ackMutation = useMutation({
    mutationFn: (ids: string[]) => gamificationApi.ackAchievements(ids),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["gamification"] }),
  });

  const pendingAchievement = summaryQuery.data?.achievements.find((a) =>
    summaryQuery.data?.newlyUnlockedAchievementIds.includes(a.id),
  );

  return (
    <GamificationContext.Provider value={{ summary: summaryQuery.data }}>
      {children}
      {levelUpTarget !== null && (
        <LevelUpModal level={levelUpTarget} onClose={() => setLevelUpTarget(null)} />
      )}
      {levelUpTarget === null && pendingAchievement && (
        <AchievementUnlockModal
          achievement={pendingAchievement}
          onClose={() => ackMutation.mutate([pendingAchievement.id])}
        />
      )}
    </GamificationContext.Provider>
  );
}
