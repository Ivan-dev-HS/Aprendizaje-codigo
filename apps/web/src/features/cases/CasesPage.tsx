import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { CaseKind } from "@codeforge/types";
import { NavBar } from "../../app/NavBar";
import { GAME_THEMES, type GameThemeName } from "../../app/game-theme";
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

const THEME_CYCLE: GameThemeName[] = [
  "teal",
  "orange",
  "purple",
  "emerald",
  "rose",
  "indigo",
];

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
        <h1 className="font-display mb-2 text-2xl font-bold">🔍 Casos reales</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Diagnostica problemas reales de debugging, soporte técnico, redes e incidentes
          de producción — como pasaría en un trabajo de verdad.
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {KIND_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setKind(tab.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                kind === tab.id
                  ? "font-display bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {casesQuery.isLoading && <p className="text-sm">Cargando casos…</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {casesQuery.data?.items.map((c, i) => {
            const t = GAME_THEMES[THEME_CYCLE[i % THEME_CYCLE.length] ?? "indigo"];
            return (
              <Link key={c.id} to={`/cases/${c.id}`} className="block h-full">
                <div
                  className={`game-btn animate-pop-in h-full cursor-pointer rounded-3xl border-2 p-5 ${t.card} ${t.shadowVar}`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {c.domain}
                      {c.severity && ` · ${c.severity}`}
                    </span>
                    {c.isCompleted && (
                      <span title="Completado" aria-label="Completado">
                        ✅
                      </span>
                    )}
                  </div>
                  <h2 className="font-display font-bold">{c.title}</h2>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                    {DIFFICULTY_LABELS[c.difficulty]} · {c.points} XP
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
