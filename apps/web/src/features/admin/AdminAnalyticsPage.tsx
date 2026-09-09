import { useQuery } from "@tanstack/react-query";
import { Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { AdminNav } from "./AdminNav";
import { adminApi } from "./admin.api";

export function AdminAnalyticsPage() {
  const { data } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: adminApi.getAnalytics,
  });

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <AdminNav />
        <h1 className="mb-6 text-2xl font-bold">Analítica</h1>

        {!data && <p className="text-sm">Cargando…</p>}
        {data && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Usuarios totales
                </p>
                <p className="text-2xl font-bold">{data.totalUsers}</p>
              </Card>
              <Card>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Activos 7d / 30d
                </p>
                <p className="text-2xl font-bold">
                  {data.activeUsers.last7Days} / {data.activeUsers.last30Days}
                </p>
              </Card>
              <Card>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tiempo medio por intento
                </p>
                <p className="text-2xl font-bold">{data.averageAttemptTimeSeconds}s</p>
              </Card>
            </div>

            <Card>
              <p className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                CURSOS MÁS POPULARES (por lecciones completadas)
              </p>
              <ol className="space-y-1 text-sm">
                {data.popularCourses.map((c) => (
                  <li key={c.id} className="flex justify-between">
                    <span>{c.title}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {c.completedLessons}
                    </span>
                  </li>
                ))}
                {data.popularCourses.length === 0 && (
                  <li className="text-slate-500 dark:text-slate-400">
                    Sin datos todavía.
                  </li>
                )}
              </ol>
            </Card>

            <Card>
              <p className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                EJERCICIOS CON MAYOR TASA DE FALLO (mínimo 3 intentos)
              </p>
              <ol className="space-y-1 text-sm">
                {data.highestFailureRateExercises.map((e) => (
                  <li key={e.exerciseId} className="flex justify-between">
                    <span>{e.title}</span>
                    <span className="text-amber-600 dark:text-amber-400">
                      {e.failureRate}% ({e.attempts} intentos)
                    </span>
                  </li>
                ))}
                {data.highestFailureRateExercises.length === 0 && (
                  <li className="text-slate-500 dark:text-slate-400">
                    Sin datos todavía.
                  </li>
                )}
              </ol>
            </Card>

            <Card>
              <p className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                SKILLS MÁS DÉBILES (más usuarios marcados isWeak)
              </p>
              <ol className="space-y-1 text-sm">
                {data.weakestSkills.map((s) => (
                  <li key={s.skillId} className="flex justify-between">
                    <span>{s.name}</span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {s.usersStruggling} usuarios
                    </span>
                  </li>
                ))}
                {data.weakestSkills.length === 0 && (
                  <li className="text-slate-500 dark:text-slate-400">
                    Sin datos todavía.
                  </li>
                )}
              </ol>
            </Card>

            <Card>
              <p className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                RETENCIÓN SEMANAL
              </p>
              <p className="text-2xl font-bold">
                {data.weeklyRetention.rate !== null
                  ? `${data.weeklyRetention.rate}%`
                  : "—"}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {data.weeklyRetention.definition} (cohorte:{" "}
                {data.weeklyRetention.cohortSize} usuarios)
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
