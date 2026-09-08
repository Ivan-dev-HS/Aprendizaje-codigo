import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LessonBlock } from "@codeforge/types";
import { Alert, Button, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { learningApi } from "./learning.api";

const BLOCK_LABELS: Record<LessonBlock["type"], string> = {
  theory: "Explicación",
  technical: "En detalle",
  example: "Ejemplo",
  common_mistake: "Error típico",
  challenge: "Reto",
  real_application: "Aplicación real",
};

function LessonBlockView({ block }: { block: LessonBlock }) {
  return (
    <section className="mb-6">
      <h3 className="text-brand-600 dark:text-brand-400 mb-2 text-xs font-semibold uppercase tracking-wide">
        {BLOCK_LABELS[block.type]}
        {block.title ? ` · ${block.title}` : ""}
      </h3>
      {"body" in block && block.body && (
        <p className="whitespace-pre-line text-slate-700 dark:text-slate-300">
          {block.body}
        </p>
      )}
      {"code" in block && block.code && (
        <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
          <code>{block.code}</code>
        </pre>
      )}
    </section>
  );
}

export function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const lessonQuery = useQuery({
    queryKey: ["lesson", id],
    queryFn: () => learningApi.getLesson(id as string),
    enabled: !!id,
  });

  const completeMutation = useMutation({
    mutationFn: () => learningApi.completeLesson(id as string),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["lesson", id] });
      void queryClient.invalidateQueries({ queryKey: ["course"] });
      void queryClient.invalidateQueries({ queryKey: ["learning-path"] });
    },
  });

  const lesson = lessonQuery.data;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        {lessonQuery.isLoading && <p className="text-sm">Cargando lección…</p>}
        {lessonQuery.isError && (
          <Alert variant="error">
            No hemos podido cargar esta lección. Puede que el módulo esté bloqueado.
            Inténtalo de nuevo o vuelve al curso.
          </Alert>
        )}

        {lesson && (
          <>
            <Link
              to={`/courses/${lesson.courseSlug}`}
              className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
            >
              ← {lesson.courseTitle}
            </Link>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {lesson.moduleTitle}
            </p>
            <h1 className="mb-1 text-2xl font-bold">{lesson.title}</h1>
            <p className="mb-6 text-slate-600 dark:text-slate-400">{lesson.summary}</p>

            <Card>
              {lesson.content.map((block, i) => (
                <LessonBlockView key={i} block={block} />
              ))}
            </Card>

            {completeMutation.isSuccess && completeMutation.data.xpAwarded > 0 && (
              <Alert variant="success" className="mt-4">
                +{completeMutation.data.xpAwarded} XP
                {completeMutation.data.leveledUp &&
                  ` · ¡Has subido a nivel ${completeMutation.data.level}!`}
              </Alert>
            )}
            {completeMutation.isError && (
              <Alert variant="error" className="mt-4">
                No hemos podido guardar tu progreso. Inténtalo de nuevo.
              </Alert>
            )}

            <div className="mt-6 flex items-center justify-between">
              <div>
                {lesson.previousLessonId && (
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/lessons/${lesson.previousLessonId}`)}
                  >
                    ← Anterior
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {!lesson.isCompleted && !completeMutation.isSuccess && (
                  <Button
                    isLoading={completeMutation.isPending}
                    onClick={() => completeMutation.mutate()}
                  >
                    Marcar como completada
                  </Button>
                )}
                {(lesson.isCompleted || completeMutation.isSuccess) &&
                  lesson.nextLessonId && (
                    <Button onClick={() => navigate(`/lessons/${lesson.nextLessonId}`)}>
                      Siguiente →
                    </Button>
                  )}
                {(lesson.isCompleted || completeMutation.isSuccess) &&
                  !lesson.nextLessonId && (
                    <Link to={`/courses/${lesson.courseSlug}`}>
                      <Button>Volver al curso</Button>
                    </Link>
                  )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
