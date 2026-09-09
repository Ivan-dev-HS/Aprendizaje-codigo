import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { AdminNav } from "./AdminNav";
import { adminApi } from "./admin.api";

export function AdminFeatureFlagsPage() {
  const queryClient = useQueryClient();
  const flagsQuery = useQuery({
    queryKey: ["admin", "feature-flags"],
    queryFn: adminApi.listFeatureFlags,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ key, isEnabled }: { key: string; isEnabled: boolean }) =>
      adminApi.updateFeatureFlag(key, isEnabled),
    onSuccess: () =>
      void queryClient.invalidateQueries({ queryKey: ["admin", "feature-flags"] }),
  });

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <AdminNav />
        <h1 className="mb-4 text-2xl font-bold">Feature flags</h1>

        <div className="space-y-3">
          {flagsQuery.data?.map((flag) => (
            <Card
              key={flag.id}
              data-testid={`feature-flag-${flag.key}`}
              className="flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{flag.key}</p>
                {flag.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {flag.description}
                  </p>
                )}
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={flag.isEnabled}
                  onChange={(e) =>
                    toggleMutation.mutate({ key: flag.key, isEnabled: e.target.checked })
                  }
                />
                {flag.isEnabled ? "Activada" : "Desactivada"}
              </label>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
