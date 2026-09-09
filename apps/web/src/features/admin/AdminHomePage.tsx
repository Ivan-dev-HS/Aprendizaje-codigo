import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { AdminNav } from "./AdminNav";
import { adminApi } from "./admin.api";

export function AdminHomePage() {
  const analyticsQuery = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: adminApi.getAnalytics,
  });
  const data = analyticsQuery.data;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <AdminNav />
        <h1 className="mb-6 text-2xl font-bold">Panel de administración</h1>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">Usuarios totales</p>
            <p className="text-3xl font-bold">{data?.totalUsers ?? "—"}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Activos (últimos 7 días)
            </p>
            <p className="text-3xl font-bold">{data?.activeUsers.last7Days ?? "—"}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ejercicios completados
            </p>
            <p className="text-3xl font-bold">{data?.exercisesCompleted ?? "—"}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Retención semanal (definición abajo)
            </p>
            <p className="text-3xl font-bold">
              {data?.weeklyRetention.rate !== null &&
              data?.weeklyRetention.rate !== undefined
                ? `${data.weeklyRetention.rate}%`
                : "—"}
            </p>
          </Card>
        </div>

        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Usa la navegación superior para gestionar contenido (cursos, ejercicios,
          proyectos...), usuarios, feature flags y ver el detalle de{" "}
          <Link
            to="/admin/analytics"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            analítica
          </Link>{" "}
          o el{" "}
          <Link
            to="/admin/audit-log"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            registro de auditoría
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
