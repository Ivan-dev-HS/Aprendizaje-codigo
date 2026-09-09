import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  InterviewAnswerFeedback,
  InterviewAttemptScores,
  InterviewQuestionPrompt,
} from "@codeforge/types";
import { Alert, Button, Card } from "@codeforge/ui";
import { NavBar } from "../../app/NavBar";
import { interviewsApi } from "./interviews.api";

type Phase = "intro" | "question" | "feedback" | "finished";

const SCORE_LABELS: { key: keyof InterviewAttemptScores; label: string }[] = [
  { key: "technicalScore", label: "Technical" },
  { key: "problemSolvingScore", label: "Problem Solving" },
  { key: "communicationScore", label: "Communication" },
  { key: "confidenceScore", label: "Confidence" },
  { key: "overallScore", label: "Overall" },
];

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">{value}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="bg-brand-500 h-full rounded-full transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function InterviewSimulationPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const interviewQuery = useQuery({
    queryKey: ["interview", slug],
    queryFn: () => interviewsApi.getDetail(slug as string),
    enabled: !!slug,
  });
  const interview = interviewQuery.data;

  const [phase, setPhase] = useState<Phase>("intro");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestionPrompt[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [feedback, setFeedback] = useState<InterviewAnswerFeedback | null>(null);
  const [finalScores, setFinalScores] = useState<InterviewAttemptScores | null>(null);
  const [xpAwarded, setXpAwarded] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const questionStartedAt = useRef(Date.now());

  const startMutation = useMutation({
    mutationFn: () => interviewsApi.start(interview!.id),
    onSuccess: (result) => {
      setAttemptId(result.attemptId);
      setQuestions(result.questions);
      setCurrentIndex(0);
      setPhase("question");
      questionStartedAt.current = Date.now();
    },
  });

  const answerMutation = useMutation({
    mutationFn: () =>
      interviewsApi.answer(interview!.id, {
        attemptId: attemptId as string,
        questionId: questions[currentIndex]!.id,
        answerText,
        timeSpentSeconds: Math.round((Date.now() - questionStartedAt.current) / 1000),
      }),
    onSuccess: (result) => {
      setFeedback(result.feedback);
      if (result.attemptFinished && result.scores) {
        setFinalScores(result.scores);
        setXpAwarded(result.xpAwarded);
        setLeveledUp(result.leveledUp);
      }
      setPhase("feedback");
      void queryClient.invalidateQueries({ queryKey: ["interviews"] });
      void queryClient.invalidateQueries({ queryKey: ["interview-attempts"] });
    },
  });

  if (interviewQuery.isLoading || !interview) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <p className="text-sm">Cargando entrevista…</p>
        </main>
      </div>
    );
  }

  const isLastQuestion = currentIndex >= questions.length - 1;

  function goToNextQuestion() {
    setCurrentIndex((i) => i + 1);
    setAnswerText("");
    setFeedback(null);
    setPhase("question");
    questionStartedAt.current = Date.now();
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
        <h1 className="mb-1 mt-2 text-2xl font-bold">{interview.title}</h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          {interview.category} · {interview.durationMinutes} min ·{" "}
          {interview.questionCount} preguntas
        </p>

        {phase === "intro" && (
          <Card>
            <p className="mb-4 text-sm">
              Vas a responder {interview.questionCount} preguntas, una a una, con tus
              propias palabras. Al final verás un desglose de Technical, Problem Solving,
              Communication y Confidence, además del modelo de respuesta de cada pregunta.
            </p>
            <Button
              isLoading={startMutation.isPending}
              onClick={() => startMutation.mutate()}
            >
              Empezar entrevista
            </Button>
          </Card>
        )}

        {phase === "question" && questions[currentIndex] && (
          <Card>
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Pregunta {currentIndex + 1} de {questions.length}
            </p>
            <p className="mb-4 font-medium">{questions[currentIndex].prompt}</p>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              rows={6}
              placeholder="Escribe tu respuesta con tus propias palabras…"
              className="mb-4 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
            <Button
              isLoading={answerMutation.isPending}
              disabled={answerText.trim().length === 0}
              onClick={() => answerMutation.mutate()}
            >
              Enviar respuesta
            </Button>
          </Card>
        )}

        {phase === "feedback" && feedback && (
          <Card>
            <p className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
              FEEDBACK
            </p>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <ScoreBar label="Technical" value={feedback.scores.technical} />
              <ScoreBar label="Problem Solving" value={feedback.scores.problemSolving} />
              <ScoreBar label="Communication" value={feedback.scores.communication} />
              <ScoreBar label="Confidence" value={feedback.scores.confidence} />
            </div>

            {feedback.conceptsMentioned.length > 0 && (
              <p className="mb-2 text-sm">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Mencionaste:
                </span>{" "}
                {feedback.conceptsMentioned.join(", ")}
              </p>
            )}
            {feedback.conceptsMissing.length > 0 && (
              <p className="mb-3 text-sm">
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  Te faltó mencionar:
                </span>{" "}
                {feedback.conceptsMissing.join(", ")}
              </p>
            )}

            <Alert variant="info" className="mb-3">
              <p className="mb-1 font-medium">Respuesta modelo</p>
              <p>{feedback.expectedAnswer}</p>
            </Alert>

            {feedback.commonMistakes.length > 0 && (
              <Alert variant="warning" className="mb-4">
                <p className="mb-1 font-medium">Errores frecuentes en este tema</p>
                <ul className="list-inside list-disc">
                  {feedback.commonMistakes.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {isLastQuestion ? (
              <Button onClick={() => setPhase("finished")}>Ver resultados</Button>
            ) : (
              <Button onClick={goToNextQuestion}>Siguiente pregunta</Button>
            )}
          </Card>
        )}

        {phase === "finished" && finalScores && (
          <Card>
            <p className="mb-4 text-lg font-semibold">¡Entrevista completada!</p>
            <div className="mb-4 space-y-3">
              {SCORE_LABELS.map(({ key, label }) => (
                <ScoreBar key={key} label={label} value={finalScores[key]} />
              ))}
            </div>
            {xpAwarded > 0 && (
              <Alert variant="success" className="mb-4">
                +{xpAwarded} XP{leveledUp && " · ¡Subiste de nivel!"}
              </Alert>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => navigate("/interviews")}>
                Volver a entrevistas
              </Button>
              {attemptId && (
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/interviews/attempts/${attemptId}`)}
                >
                  Ver detalle completo
                </Button>
              )}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
