import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { projectsApi } from "./projects.api";

const LEVEL_LABELS: Record<string, string> = {
  L1_PORTFOLIO: "Nivel 1 · Portfolio",
  L2_LANDING: "Nivel 2 · Landing page",
  L3_TODO: "Nivel 3 · To-do",
  L4_DASHBOARD: "Nivel 4 · Dashboard",
  L5_API_APP: "Nivel 5 · Aplicación con API",
  L6_ECOMMERCE: "Nivel 6 · E-commerce",
  L7_FULL_STACK: "Nivel 7 · Full Stack",
  L8_SAAS: "Nivel 8 · SaaS",
};

const STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Sin empezar",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completado",
};

export function ProjectsPage() {
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list });

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold">Proyectos</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Construye proyectos reales, de nivel principiante a avanzado. Cada uno se puede
          publicar en tu portfolio al completarlo.
        </p>

        {projectsQuery.isLoading && <p className="text-sm">Cargando proyectos…</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {projectsQuery.data?.map((project) => (
            <Link key={project.id} to={`/projects/${project.slug}`}>
              <Card className="hover:border-brand-400 dark:hover:border-brand-600 h-full transition">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {LEVEL_LABELS[project.level] ?? project.level}
                </p>
                <h2 className="mt-1 font-semibold">{project.title}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {project.brief}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>~{project.estimatedHours}h</span>
                  <span>
                    {project.status === "IN_PROGRESS"
                      ? `${project.completedTaskCount}/${project.taskCount} tareas`
                      : STATUS_LABELS[project.status]}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
