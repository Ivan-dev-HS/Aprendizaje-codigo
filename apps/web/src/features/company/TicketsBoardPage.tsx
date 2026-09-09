import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { TicketPriority, TicketStatus } from "@codeforge/types";
import { Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { companyApi } from "./company.api";

const COLUMNS: { status: TicketStatus; label: string }[] = [
  { status: "BACKLOG", label: "Backlog" },
  { status: "TODO", label: "To do" },
  { status: "IN_PROGRESS", label: "En progreso" },
  { status: "BLOCKED", label: "Bloqueado" },
  { status: "CODE_REVIEW", label: "Code review" },
  { status: "QA", label: "QA" },
  { status: "DONE", label: "Hecho" },
];

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  MEDIUM: "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300",
  HIGH: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function TicketsBoardPage() {
  const sprintQuery = useQuery({
    queryKey: ["current-sprint"],
    queryFn: () => companyApi.getCurrentSprint(),
  });
  const ticketsQuery = useQuery({
    queryKey: ["tickets"],
    queryFn: () => companyApi.listTickets(),
  });

  const sprint = sprintQuery.data;
  const tickets = ticketsQuery.data ?? [];

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-1 text-2xl font-bold">Nexora Tech</h1>
        {sprint && (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {sprint.name} — {sprint.goal}
            </p>
            <p className="mb-6 mt-1 text-xs text-slate-500 dark:text-slate-500">
              {sprint.doneTickets}/{sprint.totalTickets} tickets completados
            </p>
          </>
        )}

        <div className="grid grid-flow-col gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const columnTickets = tickets.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="w-64 shrink-0">
                <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {col.label} ({columnTickets.length})
                </h2>
                <div className="space-y-2" data-testid={`column-${col.status}`}>
                  {columnTickets.map((t) => (
                    <Link key={t.id} to={`/company/tickets/${t.id}`}>
                      <Card className="hover:border-brand-400 dark:hover:border-brand-600 p-3 transition">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {t.code}
                        </p>
                        <p className="text-sm font-medium">{t.title}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${PRIORITY_COLORS[t.priority]}`}
                          >
                            {t.priority}
                          </span>
                          {t.assignee && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {t.assignee.displayName}
                            </span>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex gap-4 text-sm">
          <Link
            to="/company/standup"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            Daily standup →
          </Link>
          <Link
            to="/company/code-reviews"
            className="text-brand-600 dark:text-brand-400 hover:underline"
          >
            Practicar code review →
          </Link>
        </div>
      </main>
    </div>
  );
}
