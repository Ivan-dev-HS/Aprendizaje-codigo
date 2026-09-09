import { Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { useGamification } from "./gamification-context";
import { Mascot } from "./Mascot";

export function AchievementsPage() {
  const { summary } = useGamification();

  const unlockedCount = summary?.achievements.filter((a) => a.isUnlocked).length ?? 0;
  const total = summary?.achievements.length ?? 0;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold">Logros</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          {unlockedCount} de {total} desbloqueados.
        </p>

        {!summary && <p className="text-sm">Cargando logros…</p>}

        {summary && unlockedCount === 0 && (
          <div className="mb-6">
            <Mascot message="¡Todavía no has desbloqueado ningún logro! Completa una lección o un ejercicio para conseguir el primero." />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {summary?.achievements.map((a) => (
            <Card key={a.id} className={a.isUnlocked ? "" : "opacity-50 grayscale"}>
              <p className="mb-2 text-3xl" aria-hidden="true">
                {a.icon}
              </p>
              <p className="font-semibold">{a.title}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {a.description}
              </p>
              {a.xpReward > 0 && (
                <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  +{a.xpReward} XP
                </p>
              )}
              {a.isUnlocked && a.unlockedAt && (
                <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                  Desbloqueado el {new Date(a.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
