import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button, Card } from "@codeforge/ui";
import { useAuth } from "../auth/auth-context";
import { NavBar } from "../../app/NavBar";
import { learningApi } from "../learning/learning.api";
import { skillsApi } from "../exercises/skills.api";
import { projectsApi } from "../projects/projects.api";
import { companyApi } from "../company/company.api";
import { interviewsApi } from "../interviews/interviews.api";
import { useGamification } from "../gamification/gamification-context";
import { Mascot } from "../gamification/Mascot";

const GOAL_LABELS: Record<string, string> = {
  FROM_SCRATCH: "Aprender desde cero",
  FRONTEND: "Frontend Developer",
  BACKEND: "Backend Developer",
  FULL_STACK: "Full Stack Developer",
  IT_SUPPORT: "IT Support",
  INTERVIEW_PREP: "Preparación de entrevistas",
};

const ACTIVITY_LABELS: Record<string, { icon: string; label: string }> = {
  lesson_completed: { icon: "📘", label: "Completaste una lección" },
  exercise_completed: { icon: "✍️", label: "Resolviste un ejercicio" },
  case_completed: { icon: "🔍", label: "Resolviste un caso real" },
  project_started: { icon: "🚀", label: "Empezaste un proyecto" },
  project_completed: { icon: "🏗️", label: "Completaste un proyecto" },
  ticket_completed: { icon: "🎫", label: "Completaste un ticket" },
  interview_started: { icon: "🎙️", label: "Empezaste una entrevista" },
  interview_completed: { icon: "💼", label: "Completaste una entrevista" },
  skill_mastered: { icon: "⭐", label: "Dominaste una skill" },
};

function mascotGreeting(streakDays: number, name: string): string {
  if (streakDays === 0) return `Hola, ${name}. ¡Vamos a empezar el día con algo nuevo!`;
  if (streakDays === 1) return `¡Bien, ${name}! Llevas 1 día de racha. Sigue así hoy.`;
  if (streakDays < 7) return `¡${streakDays} días de racha, ${name}! No la rompas hoy 🔥`;
  return `¡${streakDays} días seguidos, ${name}! Eres imparable 🔥`;
}

export function DashboardPage() {
  const { user } = useAuth();
  const { summary } = useGamification();

  const pathQuery = useQuery({
    queryKey: ["learning-path"],
    queryFn: learningApi.getLearningPath,
  });
  const skillsQuery = useQuery({
    queryKey: ["skills", "me"],
    queryFn: skillsApi.listMine,
  });
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list });
  const sprintQuery = useQuery({
    queryKey: ["sprint", "current"],
    queryFn: companyApi.getCurrentSprint,
  });
  const attemptsQuery = useQuery({
    queryKey: ["interview-attempts"],
    queryFn: interviewsApi.myAttempts,
  });

  if (!user) return null;

  const nextCourse = pathQuery.data?.items.find(
    (item) => item.isUnlocked && !item.isCompleted && item.lessonCount > 0,
  );
  const weakSkills = (skillsQuery.data ?? []).filter((s) => s.isWeak).slice(0, 4);
  const currentProject = projectsQuery.data?.find((p) => p.status === "IN_PROGRESS");
  const finishedAttempts = (attemptsQuery.data ?? []).filter((a) => a.scores);
  const bestInterview = finishedAttempts.reduce<
    (typeof finishedAttempts)[number] | undefined
  >(
    (best, a) =>
      !best || (a.scores?.overallScore ?? 0) > (best.scores?.overallScore ?? 0)
        ? a
        : best,
    undefined,
  );

  const xpProgress = summary
    ? Math.round((summary.xpIntoCurrentLevel / summary.xpPerLevel) * 100)
    : 0;
  const dailyMissions = summary?.missions.filter((m) => m.period === "DAILY") ?? [];

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8">
          <Mascot
            message={mascotGreeting(summary?.streakDays ?? 0, user.profile.displayName)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Nivel</p>
            <p className="text-3xl font-bold">{summary?.level ?? user.profile.level}</p>
            {summary && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            )}
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {summary?.xpIntoCurrentLevel ?? 0}/{summary?.xpPerLevel ?? 100} XP para el
              siguiente nivel
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Racha</p>
            <p className="text-3xl font-bold">
              <span
                className={
                  (summary?.streakDays ?? 0) > 0 ? "animate-flame inline-block" : ""
                }
              >
                🔥
              </span>{" "}
              {summary?.streakDays ?? user.profile.streakDays} días
            </p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Readiness Score
              <span title="Indicador interno de preparación, no una garantía de empleabilidad.">
                {" "}
                ⓘ
              </span>
            </p>
            <p className="text-3xl font-bold">{summary?.readiness.overall ?? 0}/100</p>
          </Card>
        </div>

        {dailyMissions.length > 0 && (
          <Card className="mt-6">
            <p className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
              META DIARIA
            </p>
            <div className="space-y-3">
              {dailyMissions.map((m) => (
                <div key={m.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className={m.isCompleted ? "line-through opacity-60" : ""}>
                      {m.isCompleted ? "✅ " : ""}
                      {m.title}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {m.progress}/{m.target}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${m.isCompleted ? "bg-emerald-500" : "bg-brand-500"}`}
                      style={{ width: `${Math.round((m.progress / m.target) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">Tu objetivo</p>
          <p className="text-lg font-medium">
            {GOAL_LABELS[user.profile.goal] ?? user.profile.goal}
          </p>
        </Card>

        <Card className="mt-6">
          <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
            Continuar aprendiendo
          </p>
          {nextCourse ? (
            <>
              <p className="mb-3 text-lg font-medium">{nextCourse.courseTitle}</p>
              <Link to={`/courses/${nextCourse.courseSlug}`}>
                <Button>Continuar →</Button>
              </Link>
            </>
          ) : (
            <Link to="/courses">
              <Button variant="secondary">Ver mi roadmap</Button>
            </Link>
          )}
        </Card>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <p className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              SKILLS A REFORZAR
            </p>
            {weakSkills.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nada débil por ahora — ¡buen trabajo!
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {weakSkills.map((s) => (
                  <li key={s.id} className="flex justify-between">
                    <span>{s.name}</span>
                    <span className="text-amber-600 dark:text-amber-400">
                      {s.masteryScore}/100
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <p className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              PROYECTO ACTUAL
            </p>
            {currentProject ? (
              <>
                <p className="mb-2 font-medium">{currentProject.title}</p>
                <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                  {currentProject.completedTaskCount}/{currentProject.taskCount} tareas
                </p>
                <Link
                  to={`/projects/${currentProject.slug}`}
                  className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
                >
                  Continuar proyecto →
                </Link>
              </>
            ) : (
              <Link
                to="/projects"
                className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
              >
                Empezar un proyecto →
              </Link>
            )}
          </Card>

          <Card>
            <p className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              NEXORA TECH
            </p>
            {sprintQuery.data ? (
              <>
                <p className="mb-2 text-sm">
                  {sprintQuery.data.doneTickets}/{sprintQuery.data.totalTickets} tickets
                  completados en {sprintQuery.data.name}
                </p>
                <Link
                  to="/company"
                  className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
                >
                  Ir al tablero →
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Sin datos.</p>
            )}
          </Card>

          <Card>
            <p className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              PREPARACIÓN DE ENTREVISTAS
            </p>
            {bestInterview?.scores ? (
              <>
                <p className="mb-2 text-sm">
                  Mejor resultado: {bestInterview.scores.overallScore}/100 (
                  {bestInterview.interviewTitle})
                </p>
                <Link
                  to="/interviews"
                  className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
                >
                  Practicar más →
                </Link>
              </>
            ) : (
              <Link
                to="/interviews"
                className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
              >
                Hacer tu primera entrevista →
              </Link>
            )}
          </Card>
        </div>

        {summary && summary.achievements.some((a) => a.isUnlocked) && (
          <Card className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                LOGROS RECIENTES
              </p>
              <Link
                to="/achievements"
                className="text-brand-600 dark:text-brand-400 text-xs hover:underline"
              >
                Ver todos →
              </Link>
            </div>
            <div className="flex gap-4">
              {summary.achievements
                .filter((a) => a.isUnlocked)
                .sort((a, b) => (b.unlockedAt ?? "").localeCompare(a.unlockedAt ?? ""))
                .slice(0, 5)
                .map((a) => (
                  <span
                    key={a.id}
                    className="text-3xl"
                    title={a.title}
                    aria-label={a.title}
                  >
                    {a.icon}
                  </span>
                ))}
            </div>
          </Card>
        )}

        {summary && summary.recentActivity.length > 0 && (
          <Card className="mt-6">
            <p className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
              ACTIVIDAD RECIENTE
            </p>
            <ul className="space-y-2 text-sm">
              {summary.recentActivity.map((e, i) => {
                const meta = ACTIVITY_LABELS[e.name] ?? { icon: "•", label: e.name };
                return (
                  <li key={i} className="flex items-center justify-between">
                    <span>
                      {meta.icon} {meta.label}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </main>
    </div>
  );
}
