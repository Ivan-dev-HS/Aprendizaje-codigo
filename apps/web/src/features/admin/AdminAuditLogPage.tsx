import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { AdminNav } from "./AdminNav";
import { adminApi } from "./admin.api";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "text-emerald-600 dark:text-emerald-400",
  UPDATE: "text-amber-600 dark:text-amber-400",
  DELETE: "text-red-600 dark:text-red-400",
};

export function AdminAuditLogPage() {
  const [page, setPage] = useState(1);
  const logQuery = useQuery({
    queryKey: ["admin", "audit-log", page],
    queryFn: () => adminApi.listAuditLog({ page, pageSize: 30 }),
  });

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <AdminNav />
        <h1 className="mb-4 text-2xl font-bold">Audit log</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Toda mutación de administración (crear/editar/borrar contenido, cambiar roles,
          feature flags) queda registrada aquí.
        </p>

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-3 py-2 font-medium">Fecha</th>
                <th className="px-3 py-2 font-medium">Admin</th>
                <th className="px-3 py-2 font-medium">Acción</th>
                <th className="px-3 py-2 font-medium">Entidad</th>
              </tr>
            </thead>
            <tbody>
              {logQuery.data?.items.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="px-3 py-2">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{entry.actorName}</td>
                  <td
                    className={`px-3 py-2 font-medium ${ACTION_COLORS[entry.action] ?? ""}`}
                  >
                    {entry.action}
                  </td>
                  <td className="px-3 py-2">
                    {entry.entityType} · {entry.entityId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logQuery.data && logQuery.data.meta.totalPages > 1 && (
          <div className="mt-4 flex items-center gap-3 text-sm">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Anterior
            </Button>
            <span>
              Página {page} de {logQuery.data.meta.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= logQuery.data.meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente →
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
