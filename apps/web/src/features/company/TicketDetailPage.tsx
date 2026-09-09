import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TicketStatus } from "@codeforge/types";
import { Alert, Button, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { useAuth } from "../auth/auth-context";
import { companyApi } from "./company.api";

const STATUS_OPTIONS: TicketStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "CODE_REVIEW",
  "QA",
  "DONE",
];

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentBody, setCommentBody] = useState("");

  const ticketQuery = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => companyApi.getTicket(id as string),
    enabled: !!id,
  });
  const ticket = ticketQuery.data;

  const assignMutation = useMutation({
    mutationFn: () => companyApi.assignToMe(id as string),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["ticket", id] }),
  });

  const statusMutation = useMutation({
    mutationFn: (status: TicketStatus) => companyApi.setStatus(id as string, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      void queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => companyApi.addComment(id as string, commentBody),
    onSuccess: () => {
      setCommentBody("");
      void queryClient.invalidateQueries({ queryKey: ["ticket", id] });
    },
  });

  if (ticketQuery.isLoading || !ticket) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <p className="text-sm">Cargando ticket…</p>
        </main>
      </div>
    );
  }

  const isMine = ticket.assignee?.id === user?.id;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link
          to="/company"
          className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
        >
          ← Tablero
        </Link>
        <p className="mb-1 mt-2 text-sm text-slate-500 dark:text-slate-400">
          {ticket.code}
        </p>
        <h1 className="mb-4 text-2xl font-bold">{ticket.title}</h1>

        <Card className="mb-4">
          <p className="mb-3 text-sm">{ticket.description}</p>
          <h2 className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            CRITERIOS DE ACEPTACIÓN
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {ticket.acceptanceCriteria.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Reportado por {ticket.reporter.displayName}
            {ticket.assignee && ` · Asignado a ${ticket.assignee.displayName}`}
          </p>
        </Card>

        <Card className="mb-4">
          {!ticket.assignee && (
            <Button
              onClick={() => assignMutation.mutate()}
              isLoading={assignMutation.isPending}
            >
              Autoasignarme este ticket
            </Button>
          )}
          {isMine && (
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="status">
                Cambiar status
              </label>
              <select
                id="status"
                value={ticket.status}
                onChange={(e) => statusMutation.mutate(e.target.value as TicketStatus)}
                disabled={statusMutation.isPending}
                className="rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
          {statusMutation.data?.xpAwarded ? (
            <Alert variant="success" className="mt-3">
              +{statusMutation.data.xpAwarded} XP
              {statusMutation.data.leveledUp && " · ¡Subiste de nivel!"}
            </Alert>
          ) : null}
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Comentarios</h2>
          <div className="mb-4 space-y-3">
            {ticket.comments.map((c) => (
              <div key={c.id} className="text-sm">
                <p className="font-medium">{c.author.displayName}</p>
                <p className="text-slate-600 dark:text-slate-400">{c.body}</p>
              </div>
            ))}
            {ticket.comments.length === 0 && (
              <p className="text-sm text-slate-500">Todavía no hay comentarios.</p>
            )}
          </div>
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            rows={2}
            placeholder="Añade un comentario…"
            className="mb-2 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <Button
            size="sm"
            onClick={() => commentMutation.mutate()}
            disabled={!commentBody.trim()}
            isLoading={commentMutation.isPending}
          >
            Comentar
          </Button>
        </Card>
      </main>
    </div>
  );
}
