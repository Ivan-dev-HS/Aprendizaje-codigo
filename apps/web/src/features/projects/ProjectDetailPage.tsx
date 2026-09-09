import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { projectsApi } from "./projects.api";

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();

  const projectQuery = useQuery({
    queryKey: ["project", slug],
    queryFn: () => projectsApi.getDetail(slug as string),
    enabled: !!slug,
  });
  const project = projectQuery.data;

  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [readme, setReadme] = useState("");
  const [lastTaskResult, setLastTaskResult] = useState<{
    projectCompleted: boolean;
    xpAwarded: number;
  } | null>(null);

  useEffect(() => {
    if (!project?.userProject) return;
    setGithubUrl(project.userProject.githubUrl ?? "");
    setDemoUrl(project.userProject.demoUrl ?? "");
    setTechnologies(project.userProject.technologies.join(", "));
    setReadme(project.userProject.readme ?? "");
  }, [project?.userProject]);

  const startMutation = useMutation({
    mutationFn: () => projectsApi.start(project!.id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["project", slug] }),
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => projectsApi.completeTask(project!.id, taskId),
    onSuccess: (result) => {
      setLastTaskResult(result);
      void queryClient.invalidateQueries({ queryKey: ["project", slug] });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const saveMetadataMutation = useMutation({
    mutationFn: () =>
      projectsApi.updateMetadata(project!.id, {
        githubUrl: githubUrl || undefined,
        demoUrl: demoUrl || undefined,
        readme: readme || undefined,
        technologies: technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["project", slug] }),
  });

  if (projectQuery.isLoading || !project) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-sm">Cargando proyecto…</p>
        </main>
      </div>
    );
  }

  const hasStarted = project.status !== "NOT_STARTED";

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link
          to="/projects"
          className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
        >
          ← Proyectos
        </Link>
        <h1 className="mb-1 mt-2 text-2xl font-bold">{project.title}</h1>
        <p className="mb-6 text-slate-600 dark:text-slate-400">{project.brief}</p>

        {!hasStarted && (
          <Button
            onClick={() => startMutation.mutate()}
            isLoading={startMutation.isPending}
          >
            Empezar proyecto
          </Button>
        )}

        {project.status === "COMPLETED" && (
          <Alert variant="success" className="mb-6">
            ¡Proyecto completado! Aparecerá en tu portfolio si lo publicas.
          </Alert>
        )}

        {lastTaskResult?.projectCompleted && (
          <Alert variant="success" className="mb-6">
            ¡Completaste todas las tareas! +{lastTaskResult.xpAwarded} XP
          </Alert>
        )}

        <Card className="mb-6">
          <h2 className="mb-2 font-semibold">Requisitos</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {project.requirements.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Card>

        <Card className="mb-6">
          <h2 className="mb-2 font-semibold">Historias de usuario</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {project.userStories.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </Card>

        <Card className="mb-6">
          <h2 className="mb-2 font-semibold">Criterios de aceptación</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {project.acceptanceCriteria.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Card>

        {hasStarted && (
          <Card className="mb-6">
            <h2 className="mb-2 font-semibold">
              Tareas ({project.completedTaskCount}/{project.taskCount})
            </h2>
            <ul className="space-y-2">
              {project.tasks.map((task) => (
                <li key={task.id} className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    disabled={task.isCompleted || completeTaskMutation.isPending}
                    onChange={() => completeTaskMutation.mutate(task.id)}
                    className="mt-1"
                    aria-label={task.title}
                  />
                  <div>
                    <p
                      className={
                        task.isCompleted ? "line-through opacity-60" : "font-medium"
                      }
                    >
                      {task.title}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {task.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {project.bonusIdeas.length > 0 && (
          <Card className="mb-6">
            <h2 className="mb-2 font-semibold">Ideas extra</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {project.bonusIdeas.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </Card>
        )}

        {hasStarted && (
          <Card>
            <h2 className="mb-3 font-semibold">Tu implementación</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="githubUrl">
                  URL de GitHub
                </label>
                <input
                  id="githubUrl"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/tu-usuario/tu-proyecto"
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="demoUrl">
                  URL de la demo
                </label>
                <input
                  id="demoUrl"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://tu-proyecto.vercel.app"
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="technologies">
                  Tecnologías (separadas por comas)
                </label>
                <input
                  id="technologies"
                  value={technologies}
                  onChange={(e) => setTechnologies(e.target.value)}
                  placeholder="HTML, CSS, JavaScript"
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium" htmlFor="readme">
                  README / notas
                </label>
                <textarea
                  id="readme"
                  value={readme}
                  onChange={(e) => setReadme(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
              <Button
                onClick={() => saveMetadataMutation.mutate()}
                isLoading={saveMetadataMutation.isPending}
              >
                Guardar
              </Button>
              {saveMetadataMutation.isSuccess && (
                <Alert variant="success">Guardado.</Alert>
              )}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
