import { Link } from "react-router-dom";
import { Button } from "@codeforge/ui";
import { useAuth } from "../features/auth/auth-context";
import { useGamification } from "../features/gamification/gamification-context";
import { NotificationsBell } from "../features/notifications/NotificationsBell";
import { SearchBar } from "../features/search/SearchBar";
import { useTheme } from "./theme-context";

const NAV_LINKS: { to: string; label: string }[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/courses", label: "Cursos" },
  { to: "/exercises", label: "Ejercicios" },
  { to: "/labs", label: "Labs" },
  { to: "/projects", label: "Proyectos" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/resume", label: "CV" },
  { to: "/cases", label: "Casos" },
  { to: "/company", label: "Nexora Tech" },
  { to: "/interviews", label: "Entrevistas" },
  { to: "/achievements", label: "Logros" },
];

export function NavBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { summary } = useGamification();

  return (
    <nav className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6 overflow-x-auto">
          <Link
            to="/dashboard"
            className="text-brand-700 dark:text-brand-400 shrink-0 font-bold"
          >
            CodeForge
          </Link>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="shrink-0 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <SearchBar />
          </div>
          {summary && (
            <Link
              to="/dashboard"
              className="hidden items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1 text-sm sm:flex dark:bg-slate-800"
              title={`Racha de ${summary.streakDays} días`}
            >
              <span
                className={summary.streakDays > 0 ? "animate-flame" : "opacity-40"}
                aria-hidden="true"
              >
                🔥
              </span>
              <span className="font-medium">{summary.streakDays}</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-slate-600 dark:text-slate-400">
                Nivel {summary.level}
              </span>
            </Link>
          )}
          {!summary && user && (
            <span className="hidden text-sm text-slate-600 sm:inline dark:text-slate-400">
              Nivel {user.profile.level} · {user.profile.totalXp} XP
            </span>
          )}
          <NotificationsBell />
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
