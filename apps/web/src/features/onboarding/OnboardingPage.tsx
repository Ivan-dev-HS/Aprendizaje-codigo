import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ExperienceLevel, Goal, OnboardingResult } from "@codeforge/types";
import { Alert, Button, Card } from "@codeforge/ui";
import { authApi } from "../auth/auth.api";
import { useAuth } from "../auth/auth-context";

const EXPERIENCE_OPTIONS: Array<{
  value: ExperienceLevel;
  label: string;
  description: string;
}> = [
  { value: "NONE", label: "Ninguna", description: "Nunca he programado." },
  {
    value: "BASIC",
    label: "Básica",
    description: "He tocado algo de HTML/CSS o un curso suelto.",
  },
  {
    value: "INTERMEDIATE",
    label: "Intermedia",
    description: "Sé programar pero de forma desordenada.",
  },
  {
    value: "ADVANCED",
    label: "Avanzada",
    description: "Ya trabajo con código con cierta soltura.",
  },
];

const GOAL_OPTIONS: Array<{ value: Goal; label: string; description: string }> = [
  {
    value: "FROM_SCRATCH",
    label: "Aprender desde cero",
    description: "Quiero la ruta completa, paso a paso.",
  },
  {
    value: "FRONTEND",
    label: "Frontend Developer",
    description: "HTML, CSS, JavaScript, React.",
  },
  {
    value: "BACKEND",
    label: "Backend Developer",
    description: "Node, APIs, bases de datos.",
  },
  {
    value: "FULL_STACK",
    label: "Full Stack Developer",
    description: "Frontend y backend completos.",
  },
  {
    value: "IT_SUPPORT",
    label: "IT Support",
    description: "Diagnóstico y soporte técnico.",
  },
  {
    value: "INTERVIEW_PREP",
    label: "Prepararme para entrevistas",
    description: "Ya sé programar, quiero practicar entrevistas.",
  },
];

type Step = 1 | 2 | 3 | 4;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<OnboardingResult | null>(null);

  const quizQuery = useQuery({
    queryKey: ["onboarding-quiz"],
    queryFn: () => authApi.getOnboardingQuiz(),
    enabled: step >= 3,
  });

  const completeMutation = useMutation({
    mutationFn: authApi.completeOnboarding,
    onSuccess: (data) => {
      setResult(data);
      setStep(4);
    },
  });

  const allAnswered = useMemo(
    () => (quizQuery.data ? quizQuery.data.every((q) => answers[q.id]) : false),
    [quizQuery.data, answers],
  );

  async function handleFinishQuiz() {
    if (!experienceLevel || !goal || !quizQuery.data) return;
    await completeMutation.mutateAsync({
      experienceLevel,
      goal,
      assessmentAnswers: quizQuery.data.map((q) => ({
        questionId: q.id,
        optionId: answers[q.id] ?? "",
      })),
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-4 py-12">
      <ol
        className="flex items-center justify-center gap-2"
        aria-label="Progreso del onboarding"
      >
        {[1, 2, 3, 4].map((s) => (
          <li
            key={s}
            className={`h-1.5 w-12 rounded-full ${s <= step ? "bg-brand-600" : "bg-slate-200 dark:bg-slate-800"}`}
            aria-current={s === step ? "step" : undefined}
          />
        ))}
      </ol>

      {step === 1 && (
        <Card>
          <h1 className="mb-1 text-xl font-bold">¿Qué experiencia tienes?</h1>
          <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">
            Nos ayuda a no hacerte repetir lo que ya sabes.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {EXPERIENCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setExperienceLevel(option.value)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  experienceLevel === option.value
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-800"
                }`}
              >
                <p className="font-medium">{option.label}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
          <Button
            className="mt-6 w-full"
            disabled={!experienceLevel}
            onClick={() => setStep(2)}
          >
            Continuar
          </Button>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h1 className="mb-1 text-xl font-bold">¿Qué quieres conseguir?</h1>
          <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">
            Generaremos tu roadmap a partir de tu objetivo.
          </p>
          <div className="grid gap-3">
            {GOAL_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGoal(option.value)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  goal === option.value
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
                    : "border-slate-200 hover:border-slate-300 dark:border-slate-800"
                }`}
              >
                <p className="font-medium">{option.label}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Atrás
            </Button>
            <Button className="flex-1" disabled={!goal} onClick={() => setStep(3)}>
              Continuar
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <h1 className="mb-1 text-xl font-bold">Evaluación inicial</h1>
          <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">
            Unas preguntas rápidas para detectar qué ya dominas.
          </p>

          {quizQuery.isLoading && <p className="text-sm">Cargando preguntas…</p>}
          {quizQuery.isError && (
            <Alert variant="error">
              No hemos podido cargar la evaluación. Recarga la página.
            </Alert>
          )}
          {completeMutation.isError && (
            <Alert variant="error" className="mb-4">
              No hemos podido guardar tu progreso. Inténtalo de nuevo.
            </Alert>
          )}

          <div className="space-y-6">
            {quizQuery.data?.map((question, index) => (
              <fieldset key={question.id}>
                <legend className="mb-2 text-sm font-medium">
                  {index + 1}. {question.prompt}
                </legend>
                <div className="grid gap-2">
                  {question.options.map((option) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        answers[question.id] === option.id
                          ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
                          : "border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={answers[question.id] === option.id}
                        onChange={() =>
                          setAnswers((prev) => ({ ...prev, [question.id]: option.id }))
                        }
                        className="h-4 w-4"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Atrás
            </Button>
            <Button
              className="flex-1"
              disabled={!allAnswered}
              isLoading={completeMutation.isPending}
              onClick={handleFinishQuiz}
            >
              Generar mi roadmap
            </Button>
          </div>
        </Card>
      )}

      {step === 4 && result && (
        <Card>
          <h1 className="mb-1 text-xl font-bold">Tu roadmap está listo</h1>
          <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">
            Puntuación de la evaluación inicial: {result.assessment.score}/100
          </p>

          {result.assessment.recommendations.length > 0 && (
            <Alert variant="warning" className="mb-4">
              {result.assessment.recommendations.join(" ")}
            </Alert>
          )}

          <ol className="space-y-2">
            {result.learningPath.items.map((item) => (
              <li
                key={item.courseSlug}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2 text-sm dark:border-slate-800"
              >
                <span>
                  {item.order}. {item.courseTitle}
                </span>
                {!item.isRequired && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Opcional
                  </span>
                )}
              </li>
            ))}
          </ol>

          <Button
            className="mt-6 w-full"
            onClick={async () => {
              // Refresca el usuario con el estado real de backend (evita el
              // parche optimista temporal usado al llegar aquí).
              const fresh = await authApi.me();
              setUser(fresh);
              navigate("/dashboard", { replace: true });
            }}
          >
            Ir a mi dashboard
          </Button>
        </Card>
      )}
    </main>
  );
}
