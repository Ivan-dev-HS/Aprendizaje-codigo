import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { learningApi } from "./learning.api";

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
            <h1 className="mb-2 mt-2 text-2xl font-bold">{courseQuery.data.title}</h1>
            <p className="mb-8 text-slate-600 dark:text-slate-400">
              {courseQuery.data.description}
            </p>

            <div className="space-y-6">
              {courseQuery.data.modules.map((mod) => (
                <Card key={mod.id} className={mod.isLocked ? "opacity-60" : ""}>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-semibold">{mod.title}</h2>
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
                          <span className="flex items-center gap-2 text-sm text-slate-400">
                            {lesson.isCompleted ? "✅" : "○"} {lesson.title}
                          </span>
                        ) : (
                          <Link
                            to={`/lessons/${lesson.id}`}
                            className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-2 text-sm text-slate-800 dark:text-slate-200"
                          >
                            {lesson.isCompleted ? "✅" : "○"} {lesson.title}
                            <span className="text-xs text-slate-400">
                              {lesson.estimatedMinutes} min
                            </span>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
