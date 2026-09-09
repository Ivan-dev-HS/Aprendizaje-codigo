import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CasePostmortem } from "@codeforge/types";
import { Alert, Button, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { casesApi } from "./cases.api";

const EMPTY_POSTMORTEM: CasePostmortem = {
  whatHappened: "",
  rootCause: "",
  impact: "",
  timeline: "",
  fix: "",
  prevention: "",
};

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const startedAt = useRef(Date.now());

  const caseQuery = useQuery({
    queryKey: ["case", id],
    queryFn: () => casesApi.getDetail(id as string),
    enabled: !!id,
  });
  const c = caseQuery.data;

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hintsRevealed, setHintsRevealed] = useState<string[]>([]);
  const [postmortem, setPostmortem] = useState<CasePostmortem>(EMPTY_POSTMORTEM);

  const hintMutation = useMutation({
    mutationFn: () => casesApi.getHint(id as string, hintsRevealed.length + 1),
    onSuccess: (hint) => setHintsRevealed((prev) => [...prev, hint]),
  });

  const attemptMutation = useMutation({
    mutationFn: () =>
      casesApi.submitAttempt(
        id as string,
        selectedOption as string,
        hintsRevealed.length,
        Math.round((Date.now() - startedAt.current) / 1000),
        c?.requiresPostmortem ? postmortem : undefined,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cases"] });
      void queryClient.invalidateQueries({ queryKey: ["case", id] });
    },
  });

  const result = attemptMutation.data;

  if (caseQuery.isLoading || !c) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <p className="text-sm">Cargando caso…</p>
        </main>
      </div>
    );
  }

  const canSubmit =
    !!selectedOption && (!c.requiresPostmortem || postmortem.rootCause.trim().length > 0);

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link
          to="/cases"
          className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
        >
          ← Casos reales
        </Link>
        <h1 className="mb-1 mt-2 text-2xl font-bold">{c.title}</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          {c.domain}
          {c.severity && ` · Severidad ${c.severity}`} · {c.points} XP
        </p>

        <Card className="mb-4">
          <h2 className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            SÍNTOMAS
          </h2>
          <p className="mb-3 text-sm">{c.symptoms}</p>

          <h2 className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            ENTORNO
          </h2>
          <p className="mb-3 text-sm">{c.environment}</p>

          {c.code && (
            <>
              <h2 className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                CÓDIGO
              </h2>
              <pre className="mb-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                <code>{c.code}</code>
              </pre>
            </>
          )}

          {c.logs && (
            <>
              <h2 className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                LOGS
              </h2>
              <pre className="mb-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                <code>{c.logs}</code>
              </pre>
            </>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <h2 className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                ESPERADO
              </h2>
              <p className="text-sm">{c.expected}</p>
            </div>
            <div>
              <h2 className="mb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                ACTUAL
              </h2>
              <p className="text-sm">{c.actual}</p>
            </div>
          </div>
        </Card>

        <Card className="mb-4">
          <p className="mb-3 font-medium">¿Cuál es el diagnóstico correcto?</p>
          <div className="grid gap-2">
            {c.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                  selectedOption === opt.id
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <input
                  type="radio"
                  name="diagnosis"
                  checked={selectedOption === opt.id}
                  onChange={() => setSelectedOption(opt.id)}
                  className="mt-0.5"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </Card>

        {c.requiresPostmortem && (
          <Card className="mb-4">
            <h2 className="mb-3 font-semibold">Postmortem</h2>
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
              Los incidentes de producción no tienen una única "solución": documenta lo
              que pasó, como harías en un incidente real.
            </p>
            <div className="space-y-3">
              {(
                [
                  ["whatHappened", "¿Qué pasó?"],
                  ["rootCause", "Causa raíz"],
                  ["impact", "Impacto"],
                  ["timeline", "Cronología"],
                  ["fix", "Solución aplicada"],
                  ["prevention", "Cómo prevenirlo en el futuro"],
                ] as const
              ).map(([field, label]) => (
                <div key={field}>
                  <label className="mb-1 block text-sm font-medium" htmlFor={field}>
                    {label}
                  </label>
                  <textarea
                    id={field}
                    value={postmortem[field]}
                    onChange={(e) =>
                      setPostmortem((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        {hintsRevealed.length > 0 && (
          <div className="mb-4 space-y-2">
            {hintsRevealed.map((hint, i) => (
              <Alert key={i} variant="info">
                Pista {i + 1}: {hint}
              </Alert>
            ))}
          </div>
        )}

        {result && (
          <Alert variant={result.isCorrect ? "success" : "error"} className="mb-4">
            <p className="font-medium">
              {result.isCorrect
                ? "¡Diagnóstico correcto!"
                : "No es el diagnóstico correcto."}{" "}
              {result.xpAwarded > 0 && `+${result.xpAwarded} XP`}
              {result.leveledUp && " · ¡Subiste de nivel!"}
            </p>
            {result.correctOptionId && <p className="mt-1">{result.explanation}</p>}
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => hintMutation.mutate()}
            disabled={hintsRevealed.length >= c.hintsAvailable || hintMutation.isPending}
          >
            💡 Pedir pista ({hintsRevealed.length}/{c.hintsAvailable})
          </Button>
          <Button
            isLoading={attemptMutation.isPending}
            disabled={!canSubmit}
            onClick={() => attemptMutation.mutate()}
          >
            {result && !result.isCorrect ? "Reintentar" : "Enviar diagnóstico"}
          </Button>
        </div>
      </main>
    </div>
  );
}
