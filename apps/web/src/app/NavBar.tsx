import { Link } from "react-router-dom";
import { Button } from "@codeforge/ui";
import { useAuth } from "../features/auth/auth-context";
import { useTheme } from "./theme-context";

export function NavBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6 overflow-x-auto">
          <Link
            to="/dashboard"
            className="text-brand-700 dark:text-brand-400 shrink-0 font-bold"
          >
            CodeForge
          </Link>
          <Link
            to="/dashboard"
            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Dashboard
          </Link>
          <Link
            to="/courses"
            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Cursos
          </Link>
          <Link
            to="/exercises"
            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Ejercicios
          </Link>
          <Link
            to="/labs"
            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Labs
          </Link>
          <Link
            to="/projects"
            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Proyectos
          </Link>
          <Link
            to="/portfolio"
            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Portfolio
          </Link>
          <Link
            to="/resume"
            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            CV
          </Link>
          <Link
            to="/cases"
            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Casos
          </Link>
          <Link
            to="/company"
            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Nexora Tech
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-slate-600 sm:inline dark:text-slate-400">
              Nivel {user.profile.level} · {user.profile.totalXp} XP
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </Button>
          <Button variant="secondary" size="sm" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </nav>
  );
}
