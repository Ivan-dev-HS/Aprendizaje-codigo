import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { learningApi } from "./learning.api";

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div
        className="bg-brand-600 h-full rounded-full transition-all"
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
        <h1 className="mb-2 text-2xl font-bold">Tu roadmap</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          El orden en el que te recomendamos avanzar según tu objetivo.
        </p>

        {pathQuery.isLoading && <p className="text-sm">Cargando tu roadmap…</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {pathQuery.data?.items.map((item) => (
            <Card key={item.courseSlug} className={item.isUnlocked ? "" : "opacity-60"}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {item.order}. {!item.isRequired && "Opcional"}
                  </p>
                  <h2 className="font-semibold">{item.courseTitle}</h2>
                </div>
                {!item.isUnlocked && (
                  <span aria-label="Bloqueado" title="Completa el curso anterior primero">
                    🔒
                  </span>
                )}
              </div>

              {item.lessonCount > 0 ? (
                <>
                  <ProgressBar
                    completed={item.completedLessonCount}
                    total={item.lessonCount}
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {item.completedLessonCount}/{item.lessonCount} lecciones
                  </p>
                </>
              ) : (
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Contenido en preparación
                </p>
              )}

              {item.isUnlocked && item.lessonCount > 0 && (
                <Link
                  to={`/courses/${item.courseSlug}`}
                  className="text-brand-600 dark:text-brand-400 mt-3 inline-block text-sm font-medium hover:underline"
                >
                  {item.isCompleted ? "Repasar curso" : "Continuar"} →
                </Link>
              )}
            </Card>
          ))}
        </div>

        {otherCourses.length > 0 && (
          <>
            <h2 className="mb-4 mt-10 text-xl font-bold">Otros cursos del catálogo</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {otherCourses.map((course) => (
                <Card key={course.slug}>
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
