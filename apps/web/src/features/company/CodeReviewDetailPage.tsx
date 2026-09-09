import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Alert, Button, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { companyApi } from "./company.api";

type Verdict = "APPROVE" | "REQUEST_CHANGES" | "COMMENT";

export function CodeReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const prQuery = useQuery({
    queryKey: ["pull-request", id],
    queryFn: () => companyApi.getPullRequest(id as string),
    enabled: !!id,
  });
  const pr = prQuery.data;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [verdict, setVerdict] = useState<Verdict>("COMMENT");
  const [summary, setSummary] = useState("");

  const reviewMutation = useMutation({
    mutationFn: () =>
      companyApi.submitReview(id as string, [...selected], verdict, summary),
  });

  const result = reviewMutation.data;

  function toggle(issueId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(issueId)) next.delete(issueId);
      else next.add(issueId);
      return next;
    });
  }

  if (prQuery.isLoading || !pr) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-sm">Cargando pull request…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link
          to="/company/code-reviews"
          className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
        >
          ← Code reviews
        </Link>
        <p className="mb-1 mt-2 text-sm text-slate-500 dark:text-slate-400">
          {pr.ticketCode}
        </p>
        <h1 className="mb-1 text-2xl font-bold">{pr.title}</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          por {pr.author.displayName} · {pr.description}
        </p>

        <Card className="mb-4 overflow-x-auto">
          <pre className="text-xs">
            <code>{pr.diff}</code>
          </pre>
        </Card>

        <Card className="mb-4">
          <p className="mb-3 font-medium">
            Marca los problemas reales que encuentres (puede haber distractores):
          </p>
          <div className="grid gap-2">
            {pr.candidateIssues.map((issue) => (
              <label
                key={issue.id}
                className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                  selected.has(issue.id)
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(issue.id)}
                  onChange={() => toggle(issue.id)}
                  className="mt-0.5"
                />
                {issue.label}
              </label>
            ))}
          </div>
        </Card>

        <Card className="mb-4">
          <label className="mb-1 block text-sm font-medium" htmlFor="verdict">
            Veredicto
          </label>
          <select
            id="verdict"
            value={verdict}
            onChange={(e) => setVerdict(e.target.value as Verdict)}
            className="mb-3 rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="APPROVE">Approve</option>
            <option value="REQUEST_CHANGES">Request changes</option>
            <option value="COMMENT">Comment</option>
          </select>
          <label className="mb-1 block text-sm font-medium" htmlFor="summary">
            Comentario de resumen (opcional)
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </Card>

        {result && (
          <Alert variant={result.score >= 70 ? "success" : "warning"} className="mb-4">
            <p className="font-medium">
              Puntuación: {result.score}/100 · +{result.xpAwarded} XP
              {result.leveledUp && " · ¡Subiste de nivel!"}
            </p>
            {result.missedIssues.length > 0 && (
              <p className="mt-2">
                <strong>Se te escaparon:</strong> {result.missedIssues.join("; ")}
              </p>
            )}
            {result.incorrectlyFlagged.length > 0 && (
              <p className="mt-1">
                <strong>Falsos positivos:</strong> {result.incorrectlyFlagged.join("; ")}
              </p>
            )}
          </Alert>
        )}

        <Button
          isLoading={reviewMutation.isPending}
          onClick={() => reviewMutation.mutate()}
        >
          Enviar review
        </Button>
      </main>
    </div>
  );
}
