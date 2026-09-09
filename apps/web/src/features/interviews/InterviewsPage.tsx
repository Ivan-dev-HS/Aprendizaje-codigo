import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { InterviewCategory } from "@codeforge/types";
import { Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { interviewsApi } from "./interviews.api";

const CATEGORY_TABS: { id: InterviewCategory | "ALL"; label: string }[] = [
  { id: "ALL", label: "Todas" },
  { id: "TECHNICAL", label: "Técnica" },
  { id: "BEHAVIORAL", label: "Comportamiento" },
  { id: "FRONTEND", label: "Frontend" },
  { id: "BACKEND", label: "Backend" },
  { id: "FULL_STACK", label: "Full Stack" },
  { id: "IT_SUPPORT", label: "IT Support" },
];

export function InterviewsPage() {
  const [category, setCategory] = useState<InterviewCategory | "ALL">("ALL");

  const interviewsQuery = useQuery({
    queryKey: ["interviews", category],
    queryFn: () => interviewsApi.list(category === "ALL" ? undefined : category),
  });

  const attemptsQuery = useQuery({
    queryKey: ["interview-attempts"],
    queryFn: () => interviewsApi.myAttempts(),
  });

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-2 text-2xl font-bold">Simulación de entrevistas</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Practica preguntas técnicas y de comportamiento en un entorno cronometrado.
          Recibirás feedback por pregunta y un desglose de Technical, Problem Solving,
          Communication y Confidence al terminar.
        </p>

        <div className="mb-6 flex flex-wrap gap-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategory(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                category === tab.id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {interviewsQuery.isLoading && <p className="text-sm">Cargando entrevistas…</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {interviewsQuery.data?.map((i) => (
            <Link key={i.id} to={`/interviews/${i.slug}`}>
              <Card className="hover:border-brand-400 dark:hover:border-brand-600 h-full transition">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {i.category} · {i.durationMinutes} min
                  </span>
                  {i.lastAttempt && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Última: {i.lastAttempt.overallScore}/100
                    </span>
                  )}
                </div>
                <h2 className="font-semibold">{i.title}</h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {i.questionCount} preguntas
                </p>
              </Card>
            </Link>
          ))}
        </div>

        {!!attemptsQuery.data?.length && (
          <div className="mt-10">
            <h2 className="mb-3 text-lg font-semibold">Historial reciente</h2>
            <div className="space-y-2">
              {attemptsQuery.data.slice(0, 5).map((a) => (
                <Link key={a.id} to={`/interviews/attempts/${a.id}`}>
                  <Card className="hover:border-brand-400 dark:hover:border-brand-600 flex items-center justify-between transition">
                    <div>
                      <p className="text-sm font-medium">{a.interviewTitle}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {a.finishedAt
                          ? new Date(a.finishedAt).toLocaleDateString()
                          : "En curso"}
                      </p>
                    </div>
                    {a.scores && (
                      <span className="text-sm font-semibold">
                        {a.scores.overallScore}/100
                      </span>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
