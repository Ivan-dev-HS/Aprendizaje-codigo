import { Link, useLocation } from "react-router-dom";
import { Button } from "@codeforge/ui";
import { useAuth } from "../features/auth/auth-context";
import { useGamification } from "../features/gamification/gamification-context";
import { NotificationsBell } from "../features/notifications/NotificationsBell";
import { SearchBar } from "../features/search/SearchBar";
import { useTheme } from "./theme-context";
import { GAME_THEMES } from "./game-theme";

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

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "font-display bg-brand-600 text-white"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      }`}
    >
      {label}
    </Link>
  );
}

export function NavBar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { summary } = useGamification();
  const { pathname } = useLocation();

  return (
    <nav className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Link
            to="/dashboard"
            className="font-display text-brand-700 dark:text-brand-400 mr-2 shrink-0 text-lg font-bold"
          >
            🚀 CodeForge
          </Link>
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} {...link} active={pathname.startsWith(link.to)} />
          ))}
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" label="Admin" active={pathname.startsWith("/admin")} />
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <SearchBar />
          </div>
          {summary && (
            <Link
              to="/dashboard"
              className={`game-panel flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-sm sm:gap-2 sm:px-3 ${GAME_THEMES.orange.card} ${GAME_THEMES.orange.shadowVar}`}
              title={`Racha de ${summary.streakDays} días · Nivel ${summary.level}`}
            >
              <span
                className={summary.streakDays > 0 ? "animate-flame" : "opacity-40"}
                aria-hidden="true"
              >
                🔥
              </span>
              <span className="font-display font-bold">{summary.streakDays}</span>
              <span className="hidden text-slate-400 sm:inline dark:text-slate-600">
                ·
              </span>
              <span className="hidden text-slate-700 sm:inline dark:text-slate-300">
                Nivel {summary.level}
              </span>
            </Link>
          )}
          {!summary && user && (
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Nivel {user.profile.level}
              <span className="hidden sm:inline"> · {user.profile.totalXp} XP</span>
            </span>
          )}
          <NotificationsBell />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </Button>
          <Link
            to="/settings"
            className="shrink-0 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            Ajustes
          </Link>
          <Button variant="secondary" size="sm" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </nav>
  );
}
