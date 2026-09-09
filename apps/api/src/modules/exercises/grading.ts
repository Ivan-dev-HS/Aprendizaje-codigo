import type { ExerciseType } from "@codeforge/database";
import type { SubmitExerciseAttemptInput } from "@codeforge/validators";

type Answer = SubmitExerciseAttemptInput["answer"];

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Corrige un intento comparando la respuesta enviada contra `solution`
 * (nunca expuesto al frontend antes de este punto). Solo cubre los tipos que
 * no requieren el exec-service — ver packages/types/src/exercises.ts.
 */
export function gradeAttempt(
  type: ExerciseType,
  solution: unknown,
  answer: Answer,
): boolean {
  switch (type) {
    case "MCQ": {
      if (answer.type !== "MCQ") return false;
      const sol = solution as { correctOptionId: string };
      return answer.optionId === sol.correctOptionId;
    }
    case "TRUE_FALSE": {
      if (answer.type !== "TRUE_FALSE") return false;
      const sol = solution as { correct: boolean };
      return answer.value === sol.correct;
    }
    case "ORDERING": {
      if (answer.type !== "ORDERING") return false;
      const sol = solution as { correctOrder: string[] };
      return (
        answer.order.length === sol.correctOrder.length &&
        answer.order.every((id, i) => id === sol.correctOrder[i])
      );
    }
    case "MATCHING": {
      if (answer.type !== "MATCHING") return false;
      const sol = solution as {
        correctPairs: Array<{ leftId: string; rightId: string }>;
      };
      if (answer.pairs.length !== sol.correctPairs.length) return false;
      const expected = new Map(sol.correctPairs.map((p) => [p.leftId, p.rightId]));
      return answer.pairs.every((p) => expected.get(p.leftId) === p.rightId);
    }
    case "OUTPUT_PREDICTION": {
      if (answer.type !== "OUTPUT_PREDICTION") return false;
      const sol = solution as { expectedOutput: string };
      return normalize(answer.output) === normalize(sol.expectedOutput);
    }
    case "CODE_COMPLETION": {
      if (answer.type !== "CODE_COMPLETION") return false;
      const sol = solution as { expectedAnswer: string; acceptableAnswers?: string[] };
      const candidates = [sol.expectedAnswer, ...(sol.acceptableAnswers ?? [])].map(
        normalize,
      );
      return candidates.includes(normalize(answer.answer));
    }
    case "DEBUGGING": {
      if (answer.type !== "DEBUGGING") return false;
      const sol = solution as { correctOptionId: string };
      return answer.optionId === sol.correctOptionId;
    }
    default:
      throw new Error(
        `El tipo de ejercicio "${type}" todavía no tiene motor de corrección (pendiente de Fase 5/6/7).`,
      );
  }
}

const HINT_PENALTY_PER_LEVEL = 0.15;
const MIN_XP_RATIO = 0.4;

/** Sección 24: usar pistas penaliza el XP otorgado, pero nunca por debajo del 40% de los puntos. */
export function calculateXpForAttempt(
  points: number,
  hintsUsed: number,
  isCorrect: boolean,
): number {
  if (!isCorrect) return 0;
  const ratio = Math.max(1 - HINT_PENALTY_PER_LEVEL * hintsUsed, MIN_XP_RATIO);
  return Math.round(points * ratio);
}
