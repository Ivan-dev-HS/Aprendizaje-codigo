import { useNavigate } from "react-router-dom";
import { Button, Card } from "@codeforge/ui";
import { useAuth } from "../auth/auth-context";
import { useTheme } from "../../app/theme-context";

const GOAL_LABELS: Record<string, string> = {
  FROM_SCRATCH: "Aprender desde cero",
  FRONTEND: "Frontend Developer",
  BACKEND: "Backend Developer",
  FULL_STACK: "Full Stack Developer",
  IT_SUPPORT: "IT Support",
  INTERVIEW_PREP: "Preparación de entrevistas",
};

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!user) return null;

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Hola de nuevo,</p>
          <h1 className="text-2xl font-bold">{user.profile.displayName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={toggleTheme}>
            {theme === "light" ? "Modo oscuro" : "Modo claro"}
          </Button>
          <Button variant="secondary" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
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
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          El resto del dashboard (progreso, cursos, laboratorios, proyectos, empresa,
          entrevistas y logros) se construye en las siguientes fases — ver{" "}
          <code>IMPLEMENTATION_PLAN.md</code>.
        </p>
      </Card>
    </main>
  );
}
