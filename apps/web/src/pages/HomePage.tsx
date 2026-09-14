import { Link } from "react-router-dom";
import { Button } from "@codeforge/ui";
import { useTheme } from "../app/theme-context";
import { useAuth } from "../features/auth/auth-context";

export function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const { status } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-indigo-50 via-white to-white px-4 py-16 text-center dark:from-indigo-950/40 dark:via-slate-950 dark:to-slate-950">
      <span className="font-display bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200 animate-pop-in rounded-full px-4 py-1 text-sm font-bold">
        🚀 CodeForge
      </span>
      <h1 className="font-display max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl">
        Conviértete en desarrollador/a junior, de verdad.
      </h1>
      <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
        Cursos, laboratorios de código, proyectos reales, simulación de empresa y
        entrevistas — todo en una sola plataforma.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {status === "authenticated" ? (
          <Link to="/dashboard">
            <Button className="game-panel font-display !rounded-full !px-7 !py-3 !text-base [--game-shadow:theme(colors.brand.800)]">
              Ir a mi dashboard
            </Button>
          </Link>
        ) : (
          <>
            <Link to="/register">
              <Button className="game-panel font-display !rounded-full !px-7 !py-3 !text-base [--game-shadow:theme(colors.brand.800)]">
                Empezar gratis
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="secondary"
                className="game-panel font-display !rounded-full !px-7 !py-3 !text-base [--game-shadow:theme(colors.slate.400)] dark:[--game-shadow:theme(colors.slate.700)]"
              >
                Iniciar sesión
              </Button>
            </Link>
          </>
        )}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Modo {theme === "light" ? "oscuro" : "claro"}
        </button>
      </div>
    </main>
  );
}
