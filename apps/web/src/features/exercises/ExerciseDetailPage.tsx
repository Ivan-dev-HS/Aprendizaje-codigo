import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExerciseAnswer } from "@codeforge/types";
import { Alert, Button, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { exercisesApi } from "./exercises.api";

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const startedAt = useRef(Date.now());

  const exerciseQuery = useQuery({
    queryKey: ["exercise", id],
    queryFn: () => exercisesApi.getDetail(id as string),
    enabled: !!id,
  });

  const [mcqOption, setMcqOption] = useState<string | null>(null);
  const [trueFalseValue, setTrueFalseValue] = useState<boolean | null>(null);
  const [orderIds, setOrderIds] = useState<string[]>([]);
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [outputText, setOutputText] = useState("");
  const [completionText, setCompletionText] = useState("");

  const [hintsRevealed, setHintsRevealed] = useState<string[]>([]);

  useEffect(() => {
    if (exerciseQuery.data?.prompt.type === "ORDERING") {
      setOrderIds(exerciseQuery.data.prompt.items.map((i) => i.id));
    }
  }, [exerciseQuery.data]);

  const hintMutation = useMutation({
    mutationFn: () => exercisesApi.getHint(id as string, hintsRevealed.length + 1),
    onSuccess: (hint) => setHintsRevealed((prev) => [...prev, hint]),
  });

  const attemptMutation = useMutation({
    mutationFn: (answer: ExerciseAnswer) =>
      exercisesApi.submitAttempt(
        id as string,
        answer,
        hintsRevealed.length,
        Math.round((Date.now() - startedAt.current) / 1000),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["exercises"] });
      void queryClient.invalidateQueries({ queryKey: ["exercise", id] });
    },
  });

  const exercise = exerciseQuery.data;
  const result = attemptMutation.data;

  function moveItem(index: number, direction: -1 | 1) {
    setOrderIds((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target] as string, next[index] as string];
      return next;
    });
  }

  function buildAnswer(): ExerciseAnswer | null {
    if (!exercise) return null;
    switch (exercise.prompt.type) {
      case "MCQ":
        return mcqOption ? { type: "MCQ", optionId: mcqOption } : null;
      case "TRUE_FALSE":
        return trueFalseValue !== null
          ? { type: "TRUE_FALSE", value: trueFalseValue }
          : null;
      case "ORDERING":
        return orderIds.length > 0 ? { type: "ORDERING", order: orderIds } : null;
      case "MATCHING": {
        const entries = Object.entries(pairs);
        if (entries.length !== exercise.prompt.left.length) return null;
        return {
          type: "MATCHING",
          pairs: entries.map(([leftId, rightId]) => ({ leftId, rightId })),
        };
      }
      case "OUTPUT_PREDICTION":
        return outputText.trim()
          ? { type: "OUTPUT_PREDICTION", output: outputText }
          : null;
      case "CODE_COMPLETION":
        return completionText.trim()
          ? { type: "CODE_COMPLETION", answer: completionText }
          : null;
      case "DEBUGGING":
        return mcqOption ? { type: "DEBUGGING", optionId: mcqOption } : null;
      default:
        return null;
    }
  }

  const answer = buildAnswer();

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        {exerciseQuery.isLoading && <p className="text-sm">Cargando ejercicio…</p>}

        {exercise && (
          <>
            <Link
              to="/exercises"
              className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
            >
              ← Ejercicios
            </Link>
            <h1 className="mb-1 mt-2 text-2xl font-bold">{exercise.title}</h1>
            <p className="mb-6 text-slate-600 dark:text-slate-400">
              {exercise.description}
            </p>

            <Card>
              {exercise.prompt.type === "MCQ" && (
                <>
                  <p className="mb-3 font-medium">{exercise.prompt.question}</p>
                  <div className="grid gap-2">
                    {exercise.prompt.options.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${mcqOption === opt.id ? "border-brand-500 bg-brand-50 dark:bg-brand-950" : "border-slate-200 dark:border-slate-800"}`}
                      >
                        <input
                          type="radio"
                          name="mcq"
                          checked={mcqOption === opt.id}
                          onChange={() => setMcqOption(opt.id)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </>
              )}

              {exercise.prompt.type === "TRUE_FALSE" && (
                <>
                  <p className="mb-3 font-medium">{exercise.prompt.statement}</p>
                  <div className="flex gap-3">
                    <Button
                      variant={trueFalseValue === true ? "primary" : "secondary"}
                      onClick={() => setTrueFalseValue(true)}
                    >
                      Verdadero
                    </Button>
                    <Button
                      variant={trueFalseValue === false ? "primary" : "secondary"}
                      onClick={() => setTrueFalseValue(false)}
                    >
                      Falso
                    </Button>
                  </div>
                </>
              )}

              {exercise.prompt.type === "ORDERING" && (
                <>
                  <p className="mb-3 font-medium">{exercise.prompt.instruction}</p>
                  <ol className="space-y-2">
                    {orderIds.map((itemId, index) => {
                      const item =
                        exercise.prompt.type === "ORDERING"
                          ? exercise.prompt.items.find((i) => i.id === itemId)
                          : undefined;
                      return (
                        <li
                          key={itemId}
                          className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
                        >
                          <span>
                            {index + 1}. {item?.label}
                          </span>
                          <span className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveItem(index, -1)}
                              disabled={index === 0}
                              aria-label="Subir"
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => moveItem(index, 1)}
                              disabled={index === orderIds.length - 1}
                              aria-label="Bajar"
                            >
                              ↓
                            </Button>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}

              {exercise.prompt.type === "MATCHING" && (
                <>
                  <p className="mb-3 font-medium">{exercise.prompt.instruction}</p>
                  <div className="space-y-2">
                    {exercise.prompt.left.map((leftItem) => (
                      <div key={leftItem.id} className="flex items-center gap-2 text-sm">
                        <span className="w-1/2">{leftItem.label}</span>
                        <select
                          value={pairs[leftItem.id] ?? ""}
                          onChange={(e) =>
                            setPairs((prev) => ({
                              ...prev,
                              [leftItem.id]: e.target.value,
                            }))
                          }
                          className="w-1/2 rounded-lg border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
                        >
                          <option value="">Selecciona…</option>
                          {exercise.prompt.type === "MATCHING" &&
                            exercise.prompt.right.map((rightItem) => (
                              <option key={rightItem.id} value={rightItem.id}>
                                {rightItem.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {exercise.prompt.type === "OUTPUT_PREDICTION" && (
                <>
                  <p className="mb-2 font-medium">{exercise.prompt.question}</p>
                  <pre className="mb-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
                    <code>{exercise.prompt.code}</code>
                  </pre>
                  <textarea
                    value={outputText}
                    onChange={(e) => setOutputText(e.target.value)}
                    rows={3}
                    placeholder="Escribe lo que crees que imprime la consola…"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </>
              )}

              {exercise.prompt.type === "CODE_COMPLETION" && (
                <>
                  <p className="mb-2 font-medium">{exercise.prompt.instruction}</p>
                  <pre className="mb-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
                    <code>{exercise.prompt.code}</code>
                  </pre>
                  <input
                    type="text"
                    value={completionText}
                    onChange={(e) => setCompletionText(e.target.value)}
                    placeholder="Tu respuesta…"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </>
              )}

              {exercise.prompt.type === "DEBUGGING" && (
                <>
                  <p className="mb-2 font-medium">{exercise.prompt.question}</p>
                  <pre className="mb-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
                    <code>{exercise.prompt.code}</code>
                  </pre>
                  <div className="grid gap-2">
                    {exercise.prompt.options.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${mcqOption === opt.id ? "border-brand-500 bg-brand-50 dark:bg-brand-950" : "border-slate-200 dark:border-slate-800"}`}
                      >
                        <input
                          type="radio"
                          name="debugging"
                          checked={mcqOption === opt.id}
                          onChange={() => setMcqOption(opt.id)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {hintsRevealed.length > 0 && (
              <div className="mt-4 space-y-2">
                {hintsRevealed.map((hint, i) => (
                  <Alert key={i} variant="info">
                    Pista {i + 1}: {hint}
                  </Alert>
                ))}
              </div>
            )}

            {result && (
              <Alert variant={result.isCorrect ? "success" : "error"} className="mt-4">
                <p className="font-medium">
                  {result.isCorrect ? "¡Correcto!" : "No es correcto todavía."}{" "}
                  {result.xpAwarded > 0 && `+${result.xpAwarded} XP`}
                  {result.leveledUp && " · ¡Subiste de nivel!"}
                </p>
                <p className="mt-1">{result.explanation}</p>
                {result.skill.isWeak && (
                  <p className="mt-1 text-sm">
                    Hemos marcado esta skill para repaso — te la recomendaremos más
                    adelante.
                  </p>
                )}
              </Alert>
            )}

            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => hintMutation.mutate()}
                disabled={
                  hintsRevealed.length >= exercise.hintsAvailable ||
                  hintMutation.isPending
                }
              >
                💡 Pedir pista ({hintsRevealed.length}/{exercise.hintsAvailable})
              </Button>
              <Button
                isLoading={attemptMutation.isPending}
                disabled={!answer}
                onClick={() => answer && attemptMutation.mutate(answer)}
              >
                {result && !result.isCorrect ? "Reintentar" : "Enviar respuesta"}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
