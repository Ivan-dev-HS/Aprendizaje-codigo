import type {
  ExerciseAttemptResult,
  ExerciseDetail,
  ExerciseOption,
  ExercisePrompt,
  ExerciseSummary,
} from "@codeforge/types";
import type {
  ExerciseListQueryInput,
  SubmitExerciseAttemptInput,
} from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { awardXp, recordProgressEvent } from "../gamification/xp.service.js";
import { updateMasteryOnAttempt } from "../skills/mastery-update.js";
import { calculateXpForAttempt, gradeAttempt } from "./grading.js";
import { exercisesRepository, type ExerciseFilters } from "./exercises.repository.js";

const SOLUTION_REVEAL_AFTER_ATTEMPTS = 3; // sección 24: nunca al primer error
const SOLUTION_REVEAL_AFTER_HINTS = 3;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

/**
 * El orden de presentación de ORDERING/MATCHING nunca debe coincidir con el
 * orden en que se autoró el contenido (podría filtrar la respuesta
 * involuntariamente si por casualidad coincide con la solución). Se
 * reordena en cada lectura, independientemente de cómo esté guardado.
 */
function randomizePrompt(prompt: ExercisePrompt): ExercisePrompt {
  if (prompt.type === "ORDERING") {
    return { ...prompt, items: shuffle<ExerciseOption>(prompt.items) };
  }
  if (prompt.type === "MATCHING") {
    return { ...prompt, right: shuffle<ExerciseOption>(prompt.right) };
  }
  return prompt;
}

export const exercisesService = {
  async list(filters: ExerciseFilters, query: ExerciseListQueryInput, userId?: string) {
    const { items, total } = await exercisesRepository.listPaginated(
      filters,
      query.page,
      query.pageSize,
    );

    const stats = userId
      ? await exercisesRepository.attemptStatsForUser(
          userId,
          items.map((e) => e.id),
        )
      : {
          attemptCountByExercise: new Map<string, number>(),
          completedSet: new Set<string>(),
        };

    const summaries: ExerciseSummary[] = items.map((ex) => ({
      id: ex.id,
      slug: ex.slug,
      title: ex.title,
      description: ex.description,
      type: ex.type,
      difficulty: ex.difficulty,
      points: ex.points,
      estimatedMinutes: ex.estimatedMinutes,
      skill: { id: ex.skill.id, slug: ex.skill.slug, name: ex.skill.name },
      isCompleted: stats.completedSet.has(ex.id),
      attemptCount: stats.attemptCountByExercise.get(ex.id) ?? 0,
    }));

    return {
      items: summaries,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
    };
  },

  async getDetail(exerciseId: string, userId?: string): Promise<ExerciseDetail> {
    const exercise = await exercisesRepository.findById(exerciseId);
    if (!exercise || !exercise.isPublished)
      throw HttpError.notFound("Ejercicio no encontrado.");

    const attemptCount = userId
      ? await exercisesRepository.countAttempts(userId, exerciseId)
      : 0;
    const stats = userId
      ? await exercisesRepository.attemptStatsForUser(userId, [exerciseId])
      : { completedSet: new Set<string>() };

    const hints = exercise.hints as string[];

    return {
      id: exercise.id,
      slug: exercise.slug,
      title: exercise.title,
      description: exercise.description,
      type: exercise.type,
      difficulty: exercise.difficulty,
      points: exercise.points,
      estimatedMinutes: exercise.estimatedMinutes,
      skill: {
        id: exercise.skill.id,
        slug: exercise.skill.slug,
        name: exercise.skill.name,
      },
      isCompleted: stats.completedSet.has(exerciseId),
      attemptCount,
      prompt: randomizePrompt(exercise.prompt as unknown as ExercisePrompt),
      hintsAvailable: hints.length,
    };
  },

  async getHint(exerciseId: string, level: number): Promise<string> {
    const exercise = await exercisesRepository.findById(exerciseId);
    if (!exercise || !exercise.isPublished)
      throw HttpError.notFound("Ejercicio no encontrado.");

    const hints = exercise.hints as string[];
    if (level > hints.length) {
      throw HttpError.badRequest("Este ejercicio no tiene esa pista.");
    }
    return hints[level - 1] as string;
  },

  async submitAttempt(
    exerciseId: string,
    userId: string,
    input: SubmitExerciseAttemptInput,
  ): Promise<ExerciseAttemptResult> {
    const exercise = await exercisesRepository.findById(exerciseId);
    if (!exercise || !exercise.isPublished)
      throw HttpError.notFound("Ejercicio no encontrado.");

    if (input.answer.type !== exercise.type) {
      throw HttpError.badRequest(
        "El tipo de respuesta no coincide con el tipo de ejercicio.",
      );
    }

    const isCorrect = gradeAttempt(exercise.type, exercise.solution, input.answer);
    const score = isCorrect ? exercise.points : 0;
    const xpForAttempt = calculateXpForAttempt(
      exercise.points,
      input.hintsUsed,
      isCorrect,
    );

    const previousAttempts = await exercisesRepository.countAttempts(userId, exerciseId);
    const attemptNumber = previousAttempts + 1;

    await exercisesRepository.createAttempt({
      userId,
      exerciseId,
      answer: input.answer,
      isCorrect,
      score,
      xpAwarded: xpForAttempt,
      hintsUsed: input.hintsUsed,
      timeSpentSeconds: input.timeSpentSeconds,
      attemptNumber,
    });

    const xpResult = isCorrect
      ? await awardXp(userId, xpForAttempt, "EXERCISE", exerciseId)
      : { awarded: 0, alreadyAwarded: false, leveledUp: false };

    const skillUpdate = await updateMasteryOnAttempt(userId, exercise.skillId, isCorrect);

    await recordProgressEvent(
      userId,
      isCorrect ? "exercise_completed" : "exercise_failed",
      {
        exerciseId,
        attemptNumber,
      },
    );

    const revealSolution =
      isCorrect ||
      input.hintsUsed >= SOLUTION_REVEAL_AFTER_HINTS ||
      attemptNumber >= SOLUTION_REVEAL_AFTER_ATTEMPTS;

    return {
      isCorrect,
      score,
      xpAwarded: xpResult.awarded,
      alreadyAwarded: xpResult.alreadyAwarded,
      attemptNumber,
      explanation: exercise.explanation,
      solution: revealSolution ? exercise.solution : null,
      skill: skillUpdate,
      leveledUp: xpResult.leveledUp,
    };
  },
};
