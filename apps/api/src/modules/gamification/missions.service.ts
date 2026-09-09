import { prisma, type MissionPeriod, type XpSource } from "@codeforge/database";
import type { MissionProgress } from "@codeforge/types";
import { notificationsService } from "../notifications/notifications.service.js";
import { awardXp } from "./xp.service.js";

/**
 * Retos diarios/semanales (sección 41-43 de SPEC.md). `XP_EARNED` progresa
 * con cualquier XP real ganado; `XP_SOURCE_COUNT` progresa en +1 cada vez
 * que se otorga XP de ese `source` concreto (una lección, un ejercicio...).
 */
export type MissionCriteria =
  | { kind: "XP_EARNED"; target: number }
  | { kind: "XP_SOURCE_COUNT"; source: XpSource; target: number };

/** YYYY-MM-DD (UTC) para DAILY, YYYY-Www (semana ISO, UTC) para WEEKLY. */
function periodKeyFor(period: MissionPeriod, date = new Date()): string {
  if (period === "DAILY") return date.toISOString().slice(0, 10);

  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

/**
 * Actualiza el progreso de todas las misiones afectadas por un evento de XP
 * real. Se llama desde `progress.service.ts`, nunca para XP de origen
 * ACHIEVEMENT/MISSION (evita encadenar misiones sobre sí mismas).
 */
export async function recordMissionProgress(
  userId: string,
  source: XpSource,
  amount: number,
) {
  const missions = await prisma.mission.findMany();

  for (const mission of missions) {
    const criteria = mission.criteria as unknown as MissionCriteria;
    const increment =
      criteria.kind === "XP_EARNED" ? amount : criteria.source === source ? 1 : 0;
    if (increment === 0) continue;

    const periodKey = periodKeyFor(mission.period);
    const key = {
      userId_missionId_periodKey: { userId, missionId: mission.id, periodKey },
    };
    const existing = await prisma.userMission.findUnique({ where: key });
    if (existing?.completedAt) continue; // ya completada este periodo

    const target = criteria.target;
    const newProgress = Math.min(target, (existing?.progress ?? 0) + increment);
    const nowCompleted = newProgress >= target;

    await prisma.userMission.upsert({
      where: key,
      create: {
        userId,
        missionId: mission.id,
        periodKey,
        progress: newProgress,
        target,
        completedAt: nowCompleted ? new Date() : null,
      },
      update: { progress: newProgress, completedAt: nowCompleted ? new Date() : null },
    });

    if (nowCompleted) {
      await awardXp(userId, mission.xpReward, "MISSION", `${mission.id}:${periodKey}`);
      await notificationsService.create(
        userId,
        "ACHIEVEMENT",
        `¡Misión completada! ${mission.title}`,
        mission.description,
        "/dashboard",
      );
    }
  }
}

export async function listMissionsForUser(userId: string): Promise<MissionProgress[]> {
  const missions = await prisma.mission.findMany({
    orderBy: [{ period: "asc" }, { title: "asc" }],
  });

  return Promise.all(
    missions.map(async (mission) => {
      const criteria = mission.criteria as unknown as MissionCriteria;
      const periodKey = periodKeyFor(mission.period);
      const existing = await prisma.userMission.findUnique({
        where: {
          userId_missionId_periodKey: { userId, missionId: mission.id, periodKey },
        },
      });
      return {
        id: mission.id,
        slug: mission.slug,
        title: mission.title,
        description: mission.description,
        period: mission.period,
        xpReward: mission.xpReward,
        progress: existing?.progress ?? 0,
        target: criteria.target,
        isCompleted: !!existing?.completedAt,
      };
    }),
  );
}
