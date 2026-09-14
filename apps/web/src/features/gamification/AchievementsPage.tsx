import { NavBar } from "../../app/NavBar";
import { GAME_THEMES, type GameThemeName } from "../../app/game-theme";
import { useGamification } from "./gamification-context";
import { Mascot } from "./Mascot";

const THEME_CYCLE: GameThemeName[] = [
  "amber",
  "indigo",
  "emerald",
  "rose",
  "purple",
  "teal",
  "orange",
];

export function AchievementsPage() {
  const { summary } = useGamification();

  const unlockedCount = summary?.achievements.filter((a) => a.isUnlocked).length ?? 0;
  const total = summary?.achievements.length ?? 0;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="font-display mb-2 text-2xl font-bold">🏆 Logros</h1>
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
          {summary?.achievements.map((a, i) => {
            const t =
              GAME_THEMES[
                a.isUnlocked ? (THEME_CYCLE[i % THEME_CYCLE.length] ?? "indigo") : "slate"
              ];
            return (
              <div
                key={a.id}
                className={`game-panel animate-pop-in rounded-3xl border-2 p-5 ${t.card} ${t.shadowVar} ${a.isUnlocked ? "" : "opacity-60 grayscale"}`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span
                  className={`mb-2 flex h-14 w-14 items-center justify-center rounded-full text-3xl ${t.badge}`}
                  aria-hidden="true"
                >
                  {a.icon}
                </span>
                <p className="font-display mt-2 font-bold">{a.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {a.description}
                </p>
                {a.xpReward > 0 && (
                  <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                    +{a.xpReward} XP
                  </p>
                )}
                {a.isUnlocked && a.unlockedAt && (
                  <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                    Desbloqueado el {new Date(a.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
