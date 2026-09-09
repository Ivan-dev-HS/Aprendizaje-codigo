import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "@codeforge/ui";
import { useAuth } from "../auth/auth-context";
import { NavBar } from "../../app/NavBar";
import { AdminNav } from "./AdminNav";
import { adminApi } from "./admin.api";

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin", "users", q, page],
    queryFn: () => adminApi.listUsers({ q: q || undefined, page, pageSize: 20 }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "USER" | "ADMIN" }) =>
      adminApi.updateUserRole(id, role),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <AdminNav />
        <h1 className="mb-4 text-2xl font-bold">Usuarios</h1>
        <Input
          placeholder="Buscar por email, usuario o nombre…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="mb-4 max-w-xs"
        />

        <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-3 py-2 font-medium">Usuario</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Nivel / XP</th>
                <th className="px-3 py-2 font-medium">Rol</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {usersQuery.data?.items.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="px-3 py-2">
                    {u.displayName} ({u.username})
                  </td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">
                    Nivel {u.level} · {u.totalXp} XP
                  </td>
                  <td className="px-3 py-2">{u.role}</td>
                  <td className="px-3 py-2">
                    {u.id !== currentUser?.id && (
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={roleMutation.isPending}
                        onClick={() =>
                          roleMutation.mutate({
                            id: u.id,
                            role: u.role === "ADMIN" ? "USER" : "ADMIN",
                          })
                        }
                      >
                        {u.role === "ADMIN" ? "Quitar admin" : "Hacer admin"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usersQuery.data && usersQuery.data.meta.totalPages > 1 && (
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
              Página {page} de {usersQuery.data.meta.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= usersQuery.data.meta.totalPages}
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
