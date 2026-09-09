import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { companyApi } from "./company.api";

export function StandupPage() {
  const queryClient = useQueryClient();
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");

  const historyQuery = useQuery({
    queryKey: ["standups-me"],
    queryFn: () => companyApi.listMyStandups(),
  });

  const submitMutation = useMutation({
    mutationFn: () => companyApi.submitStandup(yesterday, today, blockers),
    onSuccess: () => {
      setYesterday("");
      setToday("");
      setBlockers("");
      void queryClient.invalidateQueries({ queryKey: ["standups-me"] });
    },
  });

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
        <h1 className="mb-1 mt-2 text-2xl font-bold">Daily standup</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Sé específico: menciona tickets concretos y qué hiciste, no solo "trabajé en
          cosas".
        </p>

        <Card className="mb-6">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="yesterday">
                ¿Qué hiciste ayer?
              </label>
              <textarea
                id="yesterday"
                value={yesterday}
                onChange={(e) => setYesterday(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="today">
                ¿Qué harás hoy?
              </label>
              <textarea
                id="today"
                value={today}
                onChange={(e) => setToday(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="blockers">
                ¿Tienes algún bloqueo? (opcional)
              </label>
              <textarea
                id="blockers"
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={!yesterday.trim() || !today.trim()}
              isLoading={submitMutation.isPending}
            >
              Enviar standup
            </Button>
          </div>
        </Card>

        {submitMutation.data && (
          <Alert variant="info" className="mb-6">
            Puntuación de comunicación: {submitMutation.data.communicationScore}/100
            (heurística basada en especificidad y claridad, no es una IA).
          </Alert>
        )}

        <h2 className="mb-3 text-lg font-semibold">Historial</h2>
        <div className="space-y-3">
          {historyQuery.data?.map((entry) => (
            <Card key={entry.id}>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(entry.date).toLocaleString()}
                {entry.communicationScore !== null &&
                  ` · ${entry.communicationScore}/100`}
              </p>
              <p className="mt-1 text-sm">
                <strong>Ayer:</strong> {entry.yesterday}
              </p>
              <p className="text-sm">
                <strong>Hoy:</strong> {entry.today}
              </p>
              {entry.blockers && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  <strong>Bloqueo:</strong> {entry.blockers}
                </p>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
