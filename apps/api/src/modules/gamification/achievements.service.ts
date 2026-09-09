import { prisma, type Profile, type XpSource } from "@codeforge/database";
import { notificationsService } from "../notifications/notifications.service.js";
import { awardXp } from "./xp.service.js";

/**
 * Criterios de logro (sección 41-43 de SPEC.md). `XP_SOURCE_COUNT` cubre
 * lecciones/ejercicios/casos/proyectos/tickets/code reviews/entrevistas de
 * forma uniforme: como `awardXp` ya otorga XP de forma idempotente por
 * (userId, source, sourceId), contar filas de `XpEvent` para un `source` es
 * exactamente "cuántas veces completó esto de verdad" — sin tener que
 * consultar 7 tablas distintas.
 */
export type AchievementCriteria =
  | { kind: "XP_SOURCE_COUNT"; source: XpSource; count: number }
  | { kind: "STREAK_DAYS"; days: number }
  | { kind: "LEVEL"; level: number }
  | { kind: "XP_TOTAL"; amount: number };

async function meetsCriteria(
  userId: string,
  profile: Profile,
  criteria: AchievementCriteria,
): Promise<boolean> {
  switch (criteria.kind) {
    case "XP_SOURCE_COUNT": {
      const count = await prisma.xpEvent.count({
        where: { userId, source: criteria.source },
      });
      return count >= criteria.count;
    }
    case "STREAK_DAYS":
      return profile.streakDays >= criteria.days;
    case "LEVEL":
      return profile.level >= criteria.level;
    case "XP_TOTAL":
      return profile.totalXp >= criteria.amount;
  }
}

/**
 * Comprueba todos los logros todavía no desbloqueados y desbloquea los que
 * ya se cumplen, otorgando su XP de recompensa y creando una notificación.
 * Se llama desde `progress.service.ts` tras cada XP real (nunca desde un
 * evento de tipo ACHIEVEMENT, para no encadenar indefinidamente).
 */
export async function checkAndUnlockAchievements(userId: string) {
  const profile = await prisma.profile.findUniqueOrThrow({ where: { userId } });
  const [all, unlocked] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    }),
  ]);
  const unlockedIds = new Set(unlocked.map((u) => u.achievementId));
  const locked = all.filter((a) => !unlockedIds.has(a.id));

  const newlyUnlocked = [];
  for (const achievement of locked) {
    const criteria = achievement.criteria as unknown as AchievementCriteria;
    if (!(await meetsCriteria(userId, profile, criteria))) continue;

    await prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });
    if (achievement.xpReward > 0) {
      await awardXp(userId, achievement.xpReward, "ACHIEVEMENT", achievement.id);
    }
    await notificationsService.create(
      userId,
      "ACHIEVEMENT",
      `¡Logro desbloqueado! ${achievement.icon} ${achievement.title}`,
      achievement.description,
      "/achievements",
    );
    newlyUnlocked.push(achievement);
  }
  return newlyUnlocked;
}
