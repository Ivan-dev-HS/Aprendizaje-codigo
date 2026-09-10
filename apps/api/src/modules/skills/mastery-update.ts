import { prisma } from "@codeforge/database";
import { recordProgressEvent } from "../gamification/xp.service.js";

const CONSECUTIVE_FAILURES_FOR_WEAK = 3; // sección 70 de SPEC.md
const MASTERY_GAIN_ON_SUCCESS = 5;
const MASTERY_LOSS_ON_FAILURE = 2;
const MASTERY_THRESHOLD_FOR_MASTERED = 90;

export interface MasteryUpdateResult {
  masteryScore: number;
  isWeak: boolean;
}

/**
 * Aprendizaje adaptativo (sección 70): tres fallos consecutivos en la misma
 * skill la marcan como "weak" (se prioriza en recomendaciones). Un acierto
 * reinicia el contador de fallos y aumenta la maestría; nunca se considera
 * una skill dominada solo por ejercicios (sección 71) — esto es una señal
 * más, combinada con debugging/proyectos/repetición en fases posteriores.
 */
export async function updateMasteryOnAttempt(
  userId: string,
  skillId: string,
  isCorrect: boolean,
): Promise<MasteryUpdateResult> {
  const existing = await prisma.userSkill.findUnique({
    where: { userId_skillId: { userId, skillId } },
  });

  const currentScore = existing?.masteryScore ?? 0;
  const currentFailures = existing?.consecutiveFailures ?? 0;

  const masteryScore = isCorrect
    ? Math.min(100, currentScore + MASTERY_GAIN_ON_SUCCESS)
    : Math.max(0, currentScore - MASTERY_LOSS_ON_FAILURE);
  const consecutiveFailures = isCorrect ? 0 : currentFailures + 1;
  const isWeak = isCorrect ? false : consecutiveFailures >= CONSECUTIVE_FAILURES_FOR_WEAK;

  await prisma.userSkill.upsert({
    where: { userId_skillId: { userId, skillId } },
    update: { masteryScore, consecutiveFailures, isWeak, lastPracticedAt: new Date() },
    create: {
      userId,
      skillId,
      masteryScore,
      consecutiveFailures,
      isWeak,
      lastPracticedAt: new Date(),
    },
  });

  if (
    currentScore < MASTERY_THRESHOLD_FOR_MASTERED &&
    masteryScore >= MASTERY_THRESHOLD_FOR_MASTERED
  ) {
    await recordProgressEvent(userId, "skill_mastered", { skillId, masteryScore });
  }

  return { masteryScore, isWeak };
}
