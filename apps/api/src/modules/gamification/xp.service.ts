import { prisma, Prisma, type XpSource } from "@codeforge/database";

/**
 * XP por nivel. Fórmula simple y explícita (sección 106: decisión documentada
 * en vez de un TODO) — 100 XP por nivel, sin curva de dificultad creciente por
 * ahora. Se puede sofisticar en la Fase 9 (gamificación completa) sin tocar el
 * resto del sistema, ya que todo el mundo pasa por `computeLevel`.
 */
const XP_PER_LEVEL = 100;

export function computeLevel(totalXp: number): number {
  return Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1);
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Racha diaria (sección 41 de SPEC.md): actividad el mismo día no cambia la
 * racha, actividad al día siguiente la incrementa, un hueco de más de un día
 * la reinicia a 1.
 */
export function nextStreakDays(
  lastActivityAt: Date | null,
  currentStreak: number,
): number {
  if (!lastActivityAt) return 1;
  const todayMidnight = new Date().setHours(0, 0, 0, 0);
  const lastMidnight = new Date(lastActivityAt).setHours(0, 0, 0, 0);
  const dayDiff = Math.round((todayMidnight - lastMidnight) / MS_PER_DAY);
  if (dayDiff <= 0) return currentStreak || 1;
  if (dayDiff === 1) return (currentStreak || 0) + 1;
  return 1;
}

export interface AwardXpResult {
  awarded: number;
  alreadyAwarded: boolean;
  totalXp: number;
  level: number;
  leveledUp: boolean;
}

/**
 * Otorga XP de forma idempotente: la combinación (userId, source, sourceId)
 * solo puede otorgar XP una vez, para que repetir el mismo ejercicio/lección
 * indefinidamente no permita explotar el sistema (sección 42 de SPEC.md).
 */
export async function awardXp(
  userId: string,
  amount: number,
  source: XpSource,
  sourceId: string,
): Promise<AwardXpResult> {
  const existing = await prisma.xpEvent.findFirst({
    where: { userId, source, sourceId },
  });
  const profileBefore = await prisma.profile.findUniqueOrThrow({ where: { userId } });

  if (existing) {
    return {
      awarded: 0,
      alreadyAwarded: true,
      totalXp: profileBefore.totalXp,
      level: profileBefore.level,
      leveledUp: false,
    };
  }

  await prisma.xpEvent.create({ data: { userId, amount, source, sourceId } });

  const newTotalXp = profileBefore.totalXp + amount;
  const newLevel = computeLevel(newTotalXp);
  const profileAfter = await prisma.profile.update({
    where: { userId },
    data: {
      totalXp: newTotalXp,
      level: newLevel,
      lastActivityAt: new Date(),
      streakDays: nextStreakDays(profileBefore.lastActivityAt, profileBefore.streakDays),
    },
  });

  return {
    awarded: amount,
    alreadyAwarded: false,
    totalXp: profileAfter.totalXp,
    level: profileAfter.level,
    leveledUp: newLevel > profileBefore.level,
  };
}

export async function recordProgressEvent(
  userId: string,
  name: string,
  payload?: Record<string, unknown>,
) {
  await prisma.progressEvent.create({
    data: { userId, name, payload: payload as Prisma.InputJsonValue | undefined },
  });
}
