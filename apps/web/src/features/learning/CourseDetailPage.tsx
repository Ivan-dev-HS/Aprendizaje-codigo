import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { GAME_THEMES, type GameThemeName } from "../../app/game-theme";
import { learningApi } from "./learning.api";

const THEME_CYCLE: GameThemeName[] = [
  "indigo",
  "emerald",
  "purple",
  "orange",
  "teal",
  "rose",
];

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const courseQuery = useQuery({
    queryKey: ["course", slug],
    queryFn: () => learningApi.getCourse(slug as string),
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        {courseQuery.isLoading && <p className="text-sm">Cargando curso…</p>}
        {courseQuery.isError && (
          <Alert variant="error">
            No hemos podido cargar este curso. Inténtalo de nuevo.
          </Alert>
        )}

        {courseQuery.data && (
          <>
            <Link
              to="/courses"
              className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
            >
              ← Volver al roadmap
            </Link>
            <h1 className="font-display mb-2 mt-2 text-2xl font-bold">
              {courseQuery.data.title}
            </h1>
            <p className="mb-8 text-slate-600 dark:text-slate-400">
              {courseQuery.data.description}
            </p>

            <div className="space-y-4">
              {courseQuery.data.modules.map((mod, i) => {
                const t =
                  GAME_THEMES[
                    mod.isLocked
                      ? "slate"
                      : (THEME_CYCLE[i % THEME_CYCLE.length] ?? "indigo")
                  ];
                return (
                  <div
                    key={mod.id}
                    className={`game-panel rounded-3xl border-2 p-5 ${t.card} ${t.shadowVar} ${mod.isLocked ? "opacity-70" : ""}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="font-display font-bold">{mod.title}</h2>
                      {mod.isLocked && (
                        <span
                          aria-label="Módulo bloqueado"
                          title="Completa el módulo anterior primero"
                        >
                          🔒
                        </span>
                      )}
                    </div>
                    <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                      {mod.description}
                    </p>

                    <ul className="space-y-2">
                      {mod.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          {mod.isLocked ? (
                            <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                              {lesson.isCompleted ? "✅" : "○"} {lesson.title}
                            </span>
                          ) : (
                            <Link
                              to={`/lessons/${lesson.id}`}
                              className="flex items-center gap-2 rounded-full bg-white/50 px-3 py-1.5 text-sm text-slate-800 transition-colors hover:bg-white dark:bg-slate-950/30 dark:text-slate-200 dark:hover:bg-slate-950/50"
                            >
                              {lesson.isCompleted ? "✅" : "○"} {lesson.title}
                              <span className="text-xs text-slate-500">
                                {lesson.estimatedMinutes} min
                              </span>
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
