import type {
  CaseAttemptResult,
  CaseDetail,
  CaseOption,
  CaseSummary,
} from "@codeforge/types";
import type { CaseListQueryInput, SubmitCaseAttemptInput } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { recordProgressEvent } from "../gamification/xp.service.js";
import { awardXpAndCheckProgress } from "../gamification/progress.service.js";
import { casesRepository, type CaseFilters } from "./cases.repository.js";

const SOLUTION_REVEAL_AFTER_ATTEMPTS = 3;
const SOLUTION_REVEAL_AFTER_HINTS = 3;
const HINT_PENALTY_PER_LEVEL = 0.15;
const MIN_XP_RATIO = 0.4;

function calculateXp(points: number, hintsUsed: number, isCorrect: boolean): number {
  if (!isCorrect) return 0;
  const ratio = Math.max(1 - HINT_PENALTY_PER_LEVEL * hintsUsed, MIN_XP_RATIO);
  return Math.round(points * ratio);
}

/**
 * El orden de las opciones nunca debe filtrar la respuesta (mismo motivo que
 * el shuffle de ORDERING/MATCHING en exercises.service.ts): si la opción
 * correcta estuviera siempre en la misma posición al autorarla, "elegir
 * siempre la primera" sería una estrategia ganadora.
 */
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

export const casesService = {
  async list(filters: CaseFilters, query: CaseListQueryInput, userId?: string) {
    const { items, total } = await casesRepository.listPaginated(
      filters,
      query.page,
      query.pageSize,
    );
    const completedSet = userId
      ? await casesRepository.completedSetForUser(
          userId,
          items.map((c) => c.id),
        )
      : new Set<string>();

    const summaries: CaseSummary[] = items.map((c) => ({
      id: c.id,
      slug: c.slug,
      kind: c.kind,
      domain: c.domain,
      severity: c.severity,
      title: c.title,
      points: c.points,
      difficulty: c.difficulty,
      isCompleted: completedSet.has(c.id),
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

  async getDetail(caseId: string, userId?: string): Promise<CaseDetail> {
    const c = await casesRepository.findById(caseId);
    if (!c || !c.isPublished) throw HttpError.notFound("Caso no encontrado.");

    const completedSet = userId
      ? await casesRepository.completedSetForUser(userId, [caseId])
      : new Set<string>();
    const hints = c.hints as string[];

    return {
      id: c.id,
      slug: c.slug,
      kind: c.kind,
      domain: c.domain,
      severity: c.severity,
      title: c.title,
      points: c.points,
      difficulty: c.difficulty,
      isCompleted: completedSet.has(c.id),
      symptoms: c.symptoms,
      environment: c.environment,
      code: c.code,
      logs: c.logs,
      expected: c.expected,
      actual: c.actual,
      options: shuffle(c.options as unknown as CaseOption[]),
      hintsAvailable: hints.length,
      requiresPostmortem: c.kind === "PRODUCTION_INCIDENT",
    };
  },

  async getHint(caseId: string, level: number): Promise<string> {
    const c = await casesRepository.findById(caseId);
    if (!c || !c.isPublished) throw HttpError.notFound("Caso no encontrado.");

    const hints = c.hints as string[];
    if (level > hints.length) throw HttpError.badRequest("Este caso no tiene esa pista.");
    return hints[level - 1] as string;
  },

  async submitAttempt(
    caseId: string,
    userId: string,
    input: SubmitCaseAttemptInput,
  ): Promise<CaseAttemptResult> {
    const c = await casesRepository.findById(caseId);
    if (!c || !c.isPublished) throw HttpError.notFound("Caso no encontrado.");

    const isCorrect = input.optionId === c.solution;
    const xpForAttempt = calculateXp(c.points, input.hintsUsed, isCorrect);
    const previousAttempts = await casesRepository.countAttempts(userId, caseId);

    await casesRepository.createAttempt({
      userId,
      caseId,
      diagnosis: input.optionId,
      isCorrect,
      hintsUsed: input.hintsUsed,
      xpAwarded: xpForAttempt,
      postmortem: input.postmortem,
    });

    const xpResult = isCorrect
      ? await awardXpAndCheckProgress(userId, xpForAttempt, "CASE", caseId)
      : { awarded: 0, alreadyAwarded: false, leveledUp: false };

    await recordProgressEvent(userId, isCorrect ? "case_completed" : "case_failed", {
      caseId,
      kind: c.kind,
    });

    const attemptNumber = previousAttempts + 1;
    const revealSolution =
      isCorrect ||
      input.hintsUsed >= SOLUTION_REVEAL_AFTER_HINTS ||
      attemptNumber >= SOLUTION_REVEAL_AFTER_ATTEMPTS;

    return {
      isCorrect,
      xpAwarded: xpResult.awarded,
      alreadyAwarded: xpResult.alreadyAwarded,
      explanation: c.explanation,
      correctOptionId: revealSolution ? c.solution : null,
      leveledUp: xpResult.leveledUp,
    };
  },
};
