import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { InterviewAttemptScores } from "@codeforge/types";
import { Alert, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { interviewsApi } from "./interviews.api";

const SCORE_LABELS: { key: keyof InterviewAttemptScores; label: string }[] = [
  { key: "technicalScore", label: "Technical" },
  { key: "problemSolvingScore", label: "Problem Solving" },
  { key: "communicationScore", label: "Communication" },
  { key: "confidenceScore", label: "Confidence" },
  { key: "overallScore", label: "Overall" },
];

export function InterviewAttemptDetailPage() {
  const { attemptId } = useParams<{ attemptId: string }>();

  const attemptQuery = useQuery({
    queryKey: ["interview-attempt", attemptId],
    queryFn: () => interviewsApi.getAttempt(attemptId as string),
    enabled: !!attemptId,
  });
  const attempt = attemptQuery.data;

  if (attemptQuery.isLoading || !attempt) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <p className="text-sm">Cargando intento…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link
          to="/interviews"
          className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
        >
          ← Entrevistas
        </Link>
        <h1 className="mb-1 mt-2 text-2xl font-bold">{attempt.interviewTitle}</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          {attempt.category} ·{" "}
          {attempt.finishedAt
            ? new Date(attempt.finishedAt).toLocaleString()
            : "En curso"}
        </p>

        {attempt.scores && (
          <Card className="mb-6">
            <p className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
              RESULTADO
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {SCORE_LABELS.map(({ key, label }) => (
                <div key={key} className="text-center">
                  <p className="text-2xl font-bold">{attempt.scores![key]}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {attempt.answers.map((a, i) => (
            <Card key={a.questionId}>
              <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Pregunta {i + 1}
              </p>
              <p className="mb-3 font-medium">{a.prompt}</p>
              <p className="mb-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900">
                {a.answerText}
              </p>
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                Overall: {a.scores.overall}/100 · Technical {a.scores.technical} · Problem
                Solving {a.scores.problemSolving} · Communication {a.scores.communication}{" "}
                · Confidence {a.scores.confidence}
              </p>
              <Alert variant="info">
                <p className="mb-1 font-medium">Respuesta modelo</p>
                <p>{a.expectedAnswer}</p>
              </Alert>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
