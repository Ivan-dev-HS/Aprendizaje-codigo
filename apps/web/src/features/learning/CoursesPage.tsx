import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { GAME_THEMES, type GameThemeName } from "../../app/game-theme";
import { learningApi } from "./learning.api";

/** Colores del roadmap en orden — se repiten en bucle si hay más cursos. */
const ROADMAP_COLORS: GameThemeName[] = [
  "indigo",
  "emerald",
  "purple",
  "orange",
  "teal",
  "rose",
  "amber",
];

function ProgressBar({
  completed,
  total,
  theme,
}: {
  completed: number;
  total: number;
  theme: GameThemeName;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/60 shadow-inner dark:bg-slate-950/40">
      <div
        className={`h-full rounded-full ${GAME_THEMES[theme].bar} transition-[width] duration-500 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function CoursesPage() {
  const pathQuery = useQuery({
    queryKey: ["learning-path"],
    queryFn: learningApi.getLearningPath,
  });
  const catalogQuery = useQuery({
    queryKey: ["courses"],
    queryFn: learningApi.listCourses,
  });

  const pathSlugs = new Set(pathQuery.data?.items.map((i) => i.courseSlug) ?? []);
  const otherCourses = catalogQuery.data?.filter((c) => !pathSlugs.has(c.slug)) ?? [];

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display mb-2 text-2xl font-bold">Tu roadmap</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          El orden en el que te recomendamos avanzar según tu objetivo.
        </p>

        {pathQuery.isLoading && <p className="text-sm">Cargando tu roadmap…</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {pathQuery.data?.items.map((item, i) => {
            const theme = item.isUnlocked
              ? (ROADMAP_COLORS[i % ROADMAP_COLORS.length] ?? "indigo")
              : "slate";
            const t = GAME_THEMES[theme];
            const clickable = item.isUnlocked && item.lessonCount > 0;
            const body = (
              <div
                className={`animate-pop-in h-full rounded-3xl border-2 p-5 ${t.card} ${t.shadowVar} ${
                  clickable ? "game-btn cursor-pointer" : "game-panel"
                } ${item.isUnlocked ? "" : "opacity-70"}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span
                      className={`font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${t.badge}`}
                      aria-hidden="true"
                    >
                      {item.order}
                    </span>
                    <div>
                      {!item.isRequired && (
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Opcional
                        </p>
                      )}
                      <h2 className="font-display font-bold">{item.courseTitle}</h2>
                    </div>
                  </div>
                  {!item.isUnlocked && (
                    <span
                      aria-label="Bloqueado"
                      title="Completa el curso anterior primero"
                      className="text-lg"
                    >
                      🔒
                    </span>
                  )}
                </div>

                {item.lessonCount > 0 ? (
                  <>
                    <ProgressBar
                      completed={item.completedLessonCount}
                      total={item.lessonCount}
                      theme={theme}
                    />
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                      {item.completedLessonCount}/{item.lessonCount} lecciones
                      {clickable && ` · ${item.isCompleted ? "repasar" : "continuar"} →`}
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    Contenido en preparación
                  </p>
                )}
              </div>
            );
            return (
              <div key={item.courseSlug}>
                {clickable ? (
                  <Link to={`/courses/${item.courseSlug}`} className="block h-full">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </div>
            );
          })}
        </div>

        {otherCourses.length > 0 && (
          <>
            <h2 className="font-display mb-4 mt-10 text-xl font-bold">
              Otros cursos del catálogo
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {otherCourses.map((course) => (
                <Card key={course.slug} className="hover-lift">
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {course.description}
                  </p>
                  {course.lessonCount > 0 && (
                    <Link
                      to={`/courses/${course.slug}`}
                      className="text-brand-600 dark:text-brand-400 mt-3 inline-block text-sm font-medium hover:underline"
                    >
                      Ver curso →
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
