export type ExerciseType =
  | "MCQ"
  | "TRUE_FALSE"
  | "CODE_COMPLETION"
  | "CODE_WRITING"
  | "DEBUGGING"
  | "OUTPUT_PREDICTION"
  | "ORDERING"
  | "MATCHING"
  | "SQL"
  | "TERMINAL"
  | "REAL_CASE"
  | "PROJECT_TASK";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface ExerciseOption {
  id: string;
  label: string;
}

/**
 * Payload específico por tipo (sección 15 de SPEC.md). Solo se implementa el
 * grading de los tipos que no requieren el exec-service (Fase 5): MCQ,
 * TRUE_FALSE, ORDERING, MATCHING, OUTPUT_PREDICTION, CODE_COMPLETION (relleno
 * de texto corto) y DEBUGGING (identificar la causa entre opciones). El resto
 * de tipos existen en el esquema y se activan cuando su laboratorio
 * correspondiente esté listo (CODE_WRITING/SQL/TERMINAL en la Fase 5,
 * REAL_CASE en la Fase 7 vía el modelo `Case`, PROJECT_TASK en la Fase 6).
 */
export type ExercisePrompt =
  | { type: "MCQ"; question: string; options: ExerciseOption[] }
  | { type: "TRUE_FALSE"; statement: string }
  | {
      type: "ORDERING";
      instruction: string;
      items: ExerciseOption[];
    }
  | {
      type: "MATCHING";
      instruction: string;
      left: ExerciseOption[];
      right: ExerciseOption[];
    }
  | { type: "OUTPUT_PREDICTION"; question: string; code: string; language: string }
  | {
      type: "CODE_COMPLETION";
      instruction: string;
      code: string;
      language: string;
    }
  | {
      type: "DEBUGGING";
      question: string;
      code: string;
      language: string;
      options: ExerciseOption[];
    };

export interface ExerciseSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: ExerciseType;
  difficulty: Difficulty;
  points: number;
  estimatedMinutes: number;
  skill: { id: string; slug: string; name: string };
  isCompleted: boolean;
  attemptCount: number;
}

export interface ExerciseDetail extends ExerciseSummary {
  prompt: ExercisePrompt;
  hintsAvailable: number;
}

export type ExerciseAnswer =
  | { type: "MCQ"; optionId: string }
  | { type: "TRUE_FALSE"; value: boolean }
  | { type: "ORDERING"; order: string[] }
  | { type: "MATCHING"; pairs: Array<{ leftId: string; rightId: string }> }
  | { type: "OUTPUT_PREDICTION"; output: string }
  | { type: "CODE_COMPLETION"; answer: string }
  | { type: "DEBUGGING"; optionId: string };

export interface ExerciseAttemptResult {
  isCorrect: boolean;
  score: number;
  xpAwarded: number;
  alreadyAwarded: boolean;
  attemptNumber: number;
  explanation: string;
  solution: unknown | null;
  skill: { masteryScore: number; isWeak: boolean };
  leveledUp: boolean;
}
