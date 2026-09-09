import type { XpSource } from "@codeforge/database";
import { checkAndUnlockAchievements } from "./achievements.service.js";
import { recordMissionProgress } from "./missions.service.js";
import { awardXp, type AwardXpResult } from "./xp.service.js";

/**
 * Punto único que envuelve `awardXp` para además comprobar logros y avanzar
 * misiones — así los 7 flujos de finalización (lección/ejercicio/caso/
 * proyecto/ticket/code review/entrevista) no necesitan conocer nada de
 * logros ni misiones, solo llamar aquí en vez de a `awardXp` directamente.
 * Se excluyen los eventos de origen ACHIEVEMENT/MISSION para no encadenar
 * comprobaciones sobre sí mismas indefinidamente.
 */
export async function awardXpAndCheckProgress(
  userId: string,
  amount: number,
  source: XpSource,
  sourceId: string,
): Promise<AwardXpResult> {
  const result = await awardXp(userId, amount, source, sourceId);
  if (!result.alreadyAwarded && source !== "ACHIEVEMENT" && source !== "MISSION") {
    await Promise.all([
      checkAndUnlockAchievements(userId),
      recordMissionProgress(userId, source, amount),
    ]);
  }
  return result;
}
