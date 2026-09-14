import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { NavBar } from "../../app/NavBar";
import { GAME_THEMES, type GameThemeName } from "../../app/game-theme";
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

const THEME_CYCLE: GameThemeName[] = [
  "indigo",
  "emerald",
  "purple",
  "orange",
  "teal",
  "rose",
  "amber",
  "indigo",
];

export function ProjectsPage() {
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list });

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="font-display mb-2 text-2xl font-bold">Proyectos</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Construye proyectos reales, de nivel principiante a avanzado. Cada uno se puede
          publicar en tu portfolio al completarlo.
        </p>

        {projectsQuery.isLoading && <p className="text-sm">Cargando proyectos…</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {projectsQuery.data?.map((project, i) => {
            const t = GAME_THEMES[THEME_CYCLE[i % THEME_CYCLE.length] ?? "indigo"];
            const pct =
              project.status === "IN_PROGRESS" && project.taskCount > 0
                ? Math.round((project.completedTaskCount / project.taskCount) * 100)
                : 0;
            return (
              <Link
                key={project.id}
                to={`/projects/${project.slug}`}
                className="block h-full"
              >
                <div
                  className={`game-btn animate-pop-in h-full cursor-pointer rounded-3xl border-2 p-5 ${t.card} ${t.shadowVar}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {LEVEL_LABELS[project.level] ?? project.level}
                    </p>
                    {project.status === "COMPLETED" && (
                      <span title="Completado" aria-label="Completado">
                        ✅
                      </span>
                    )}
                  </div>
                  <h2 className="font-display mt-1 font-bold">{project.title}</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {project.brief}
                  </p>
                  {project.status === "IN_PROGRESS" && (
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/60 shadow-inner dark:bg-slate-950/40">
                      <div
                        className={`h-full rounded-full ${t.bar} transition-[width] duration-500 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>~{project.estimatedHours}h</span>
                    <span>
                      {project.status === "IN_PROGRESS"
                        ? `${project.completedTaskCount}/${project.taskCount} tareas`
                        : STATUS_LABELS[project.status]}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
