import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button, Card } from "@codeforge/ui";
import { useAuth } from "../auth/auth-context";
import { NavBar } from "../../app/NavBar";
import { learningApi } from "../learning/learning.api";

const GOAL_LABELS: Record<string, string> = {
  FROM_SCRATCH: "Aprender desde cero",
  FRONTEND: "Frontend Developer",
  BACKEND: "Backend Developer",
  FULL_STACK: "Full Stack Developer",
  IT_SUPPORT: "IT Support",
  INTERVIEW_PREP: "Preparación de entrevistas",
};

export function DashboardPage() {
  const { user } = useAuth();
  const pathQuery = useQuery({
    queryKey: ["learning-path"],
    queryFn: learningApi.getLearningPath,
  });

  if (!user) return null;

  const nextCourse = pathQuery.data?.items.find(
    (item) => item.isUnlocked && !item.isCompleted && item.lessonCount > 0,
  );

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">Hola de nuevo,</p>
          <h1 className="text-2xl font-bold">{user.profile.displayName}</h1>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Nivel</p>
            <p className="text-3xl font-bold">{user.profile.level}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">XP total</p>
            <p className="text-3xl font-bold">{user.profile.totalXp}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Racha</p>
            <p className="text-3xl font-bold">{user.profile.streakDays} días</p>
          </Card>
        </div>

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

        <Card className="mt-6">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Laboratorios de código, proyectos, simulación de empresa, entrevistas, logros
            y búsqueda global se construyen en las siguientes fases — ver{" "}
            <code>IMPLEMENTATION_PLAN.md</code>.
          </p>
        </Card>
      </main>
    </div>
  );
}
