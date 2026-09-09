import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "./notifications.api";

const TYPE_ICONS: Record<string, string> = {
  ACHIEVEMENT: "🏆",
  COURSE: "📘",
  TICKET: "🎫",
  REVIEW: "🧐",
  SYSTEM: "🔔",
};

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.list(1, 10),
    refetchOnWindowFocus: true,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2 dark:border-slate-800">
              <p className="text-sm font-semibold">Notificaciones</p>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-brand-600 dark:text-brand-400 text-xs hover:underline"
                >
                  Marcar todas leídas
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notificationsQuery.data?.items.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  Nada por aquí todavía.
                </p>
              )}
              {notificationsQuery.data?.items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
                  className={`flex w-full items-start gap-2 border-b border-slate-50 px-4 py-3 text-left text-sm last:border-0 hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/50 ${
                    n.isRead ? "" : "bg-brand-50 dark:bg-brand-950/40"
                  }`}
                >
                  <span aria-hidden="true">{TYPE_ICONS[n.type] ?? "🔔"}</span>
                  <span>
                    <span className="block font-medium">{n.title}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      {n.body}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
