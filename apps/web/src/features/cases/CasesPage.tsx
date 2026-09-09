import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { CaseKind } from "@codeforge/types";
import { Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { casesApi } from "./cases.api";

const KIND_TABS: { id: CaseKind | "ALL"; label: string }[] = [
  { id: "ALL", label: "Todos" },
  { id: "DEBUGGING", label: "Debugging" },
  { id: "IT_SUPPORT", label: "IT Support" },
  { id: "NETWORKING", label: "Networking" },
  { id: "PRODUCTION_INCIDENT", label: "Producción" },
];

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Fácil",
  MEDIUM: "Media",
  HARD: "Difícil",
};

export function CasesPage() {
  const [kind, setKind] = useState<CaseKind | "ALL">("ALL");

  const casesQuery = useQuery({
    queryKey: ["cases", kind],
    queryFn: () =>
      casesApi.list({ kind: kind === "ALL" ? undefined : kind, pageSize: 50 }),
  });

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold">Casos reales</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Diagnostica problemas reales de debugging, soporte técnico, redes e incidentes
          de producción — como pasaría en un trabajo de verdad.
        </p>

        <div className="mb-6 flex flex-wrap gap-1">
          {KIND_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setKind(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                kind === tab.id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {casesQuery.isLoading && <p className="text-sm">Cargando casos…</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {casesQuery.data?.items.map((c) => (
            <Link key={c.id} to={`/cases/${c.id}`}>
              <Card className="hover:border-brand-400 dark:hover:border-brand-600 h-full transition">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {c.domain}
                    {c.severity && ` · ${c.severity}`}
                  </span>
                  {c.isCompleted && (
                    <span title="Completado" aria-label="Completado">
                      ✅
                    </span>
                  )}
                </div>
                <h2 className="font-semibold">{c.title}</h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {DIFFICULTY_LABELS[c.difficulty]} · {c.points} XP
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
