import { useEffect, useState, type ReactNode } from "react";
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

/** Franjas de color reutilizadas por las tarjetas "HUD" del dashboard. */
const STAT_THEMES = {
  indigo: {
    card: "border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-100 dark:border-indigo-900 dark:from-indigo-950/40 dark:to-violet-900/20",
    badge: "bg-gradient-to-br from-indigo-400 to-violet-500 text-white",
    bar: "bg-gradient-to-r from-indigo-400 to-violet-500",
  },
  orange: {
    card: "border-orange-200 bg-gradient-to-br from-orange-50 to-red-100 dark:border-orange-900 dark:from-orange-950/40 dark:to-red-900/20",
    badge: "bg-gradient-to-br from-orange-400 to-red-500 text-white",
    bar: "bg-gradient-to-r from-orange-400 to-red-500",
  },
  emerald: {
    card: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-100 dark:border-emerald-900 dark:from-emerald-950/40 dark:to-teal-900/20",
    badge: "bg-gradient-to-br from-emerald-400 to-teal-500 text-white",
    bar: "bg-gradient-to-r from-emerald-400 to-teal-500",
  },
  amber: {
    card: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20",
    badge: "bg-gradient-to-br from-amber-300 to-yellow-500 text-white",
    bar: "bg-gradient-to-r from-amber-400 to-yellow-500",
  },
  purple: {
    card: "border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/20",
    badge: "bg-gradient-to-br from-purple-400 to-fuchsia-500 text-white",
    bar: "bg-gradient-to-r from-purple-400 to-fuchsia-500",
  },
  teal: {
    card: "border-teal-200 bg-teal-50 dark:border-teal-900 dark:bg-teal-950/20",
    badge: "bg-gradient-to-br from-teal-400 to-cyan-500 text-white",
    bar: "bg-gradient-to-r from-teal-400 to-cyan-500",
  },
  rose: {
    card: "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/20",
    badge: "bg-gradient-to-br from-rose-400 to-pink-500 text-white",
    bar: "bg-gradient-to-r from-rose-400 to-pink-500",
  },
} as const;

function mascotGreeting(streakDays: number, name: string): string {
  if (streakDays === 0) return `Hola, ${name}. ¡Vamos a empezar el día con algo nuevo!`;
  if (streakDays === 1) return `¡Bien, ${name}! Llevas 1 día de racha. Sigue así hoy.`;
  if (streakDays < 7) return `¡${streakDays} días de racha, ${name}! No la rompas hoy 🔥`;
  return `¡${streakDays} días seguidos, ${name}! Eres imparable 🔥`;
}

/**
 * Cuenta desde 0 hasta `target` en el primer render (efecto "marcador de
 * juego"). Se salta la animación con `prefers-reduced-motion` — la regla
 * global de index.css ya frena CSS, pero este contador usa
 * requestAnimationFrame, así que se comprueba aparte.
 */
function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}

function StatCard({
  theme,
  icon,
  label,
  value,
  delayMs,
  children,
}: {
  theme: keyof typeof STAT_THEMES;
  icon: ReactNode;
  label: string;
  value: number;
  delayMs: number;
  children?: ReactNode;
}) {
  const shown = useCountUp(value);
  const t = STAT_THEMES[theme];
  return (
    <Card
      className={`hover-lift animate-pop-in ${t.card}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg shadow-sm ${t.badge}`}
          aria-hidden="true"
        >
          {icon}
        </span>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-extrabold tabular-nums">{shown}</p>
      {children}
    </Card>
  );
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
          <StatCard
            theme="indigo"
            icon="🎯"
            label="Nivel"
            value={summary?.level ?? user.profile.level}
            delayMs={0}
          >
            {summary && (
              <>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/60 dark:bg-slate-950/40">
                  <div
                    className={`h-full rounded-full ${STAT_THEMES.indigo.bar} transition-[width] duration-500 ease-out`}
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {summary.xpIntoCurrentLevel}/{summary.xpPerLevel} XP para el siguiente
                  nivel
                </p>
              </>
            )}
          </StatCard>

          <StatCard
            theme="orange"
            icon={
              <span
                className={
                  (summary?.streakDays ?? 0) > 0 ? "animate-flame inline-block" : ""
                }
              >
                🔥
              </span>
            }
            label="Racha"
            value={summary?.streakDays ?? user.profile.streakDays}
            delayMs={80}
          >
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {(summary?.streakDays ?? 0) > 0
                ? "días seguidos — ¡no la rompas hoy!"
                : "días seguidos"}
            </p>
          </StatCard>

          <StatCard
            theme="emerald"
            icon="🧭"
            label="Readiness Score"
            value={summary?.readiness.overall ?? 0}
            delayMs={160}
          >
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              de 100 · indicador interno, no una garantía de empleabilidad
            </p>
          </StatCard>
        </div>

        {dailyMissions.length > 0 && (
          <Card className="animate-pop-in mt-6" style={{ animationDelay: "220ms" }}>
            <p className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
              🎯 META DIARIA
            </p>
            <div className="space-y-3">
              {dailyMissions.map((m, i) => (
                <div
                  key={m.id}
                  className="animate-pop-in"
                  style={{ animationDelay: `${260 + i * 60}ms` }}
                >
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className={m.isCompleted ? "line-through opacity-60" : ""}>
                      {m.isCompleted ? "✅ " : ""}
                      {m.title}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {m.progress}/{m.target}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-[width] duration-500 ease-out ${m.isCompleted ? "bg-gradient-to-r from-emerald-400 to-teal-500" : STAT_THEMES.indigo.bar}`}
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
          <Card className={`hover-lift ${STAT_THEMES.amber.card}`}>
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${STAT_THEMES.amber.badge}`}
                aria-hidden="true"
              >
                ⚡
              </span>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                SKILLS A REFORZAR
              </p>
            </div>
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

          <Card className={`hover-lift ${STAT_THEMES.purple.card}`}>
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${STAT_THEMES.purple.badge}`}
                aria-hidden="true"
              >
                🏗️
              </span>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                PROYECTO ACTUAL
              </p>
            </div>
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

          <Card className={`hover-lift ${STAT_THEMES.teal.card}`}>
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${STAT_THEMES.teal.badge}`}
                aria-hidden="true"
              >
                🏢
              </span>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                NEXORA TECH
              </p>
            </div>
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

          <Card className={`hover-lift ${STAT_THEMES.rose.card}`}>
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${STAT_THEMES.rose.badge}`}
                aria-hidden="true"
              >
                🎙️
              </span>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                PREPARACIÓN DE ENTREVISTAS
              </p>
            </div>
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
                🏆 LOGROS RECIENTES
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
                .map((a, i) => (
                  <span
                    key={a.id}
                    className="hover-lift animate-pop-in flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-3xl shadow-sm"
                    style={{ animationDelay: `${i * 60}ms` }}
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
