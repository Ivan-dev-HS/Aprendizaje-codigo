import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@codeforge/ui";
import { apiClient } from "../lib/api-client";
import { useTheme } from "../app/theme-context";
import { useAuth } from "../features/auth/auth-context";

interface HealthResponse {
  status: string;
  database: "up" | "down";
}

export function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const { status } = useAuth();
  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => (await apiClient.get<HealthResponse>("/health")).data,
    retry: 1,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-4 text-center">
      <span className="bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200 rounded-full px-4 py-1 text-sm font-medium">
        CodeForge
      </span>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Conviértete en desarrollador/a junior, de verdad.
      </h1>
      <p className="max-w-xl text-lg text-slate-600 dark:text-slate-400">
        Cursos, laboratorios de código, proyectos reales, simulación de empresa y
        entrevistas — todo en una sola plataforma.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {status === "authenticated" ? (
          <Link to="/dashboard">
            <Button>Ir a mi dashboard</Button>
          </Link>
        ) : (
          <>
            <Link to="/register">
              <Button>Empezar gratis</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary">Iniciar sesión</Button>
            </Link>
          </>
        )}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Modo {theme === "light" ? "oscuro" : "claro"}
        </button>
      </div>

      <div
        className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900"
        role="status"
      >
        {health.isLoading && "Comprobando estado de la API…"}
        {health.isError && (
          <span className="text-red-600 dark:text-red-400">
            No hemos podido conectar con la API. Inténtalo de nuevo.
          </span>
        )}
        {health.data && (
          <span className="text-emerald-600 dark:text-emerald-400">
            API: {health.data.status} · Base de datos: {health.data.database}
          </span>
        )}
      </div>
    </main>
  );
}
