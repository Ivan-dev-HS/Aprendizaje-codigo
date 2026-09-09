import { prisma } from "@codeforge/database";
import type { AchievementSummary, GamificationSummary } from "@codeforge/types";
import { listMissionsForUser } from "./missions.service.js";
import { computeReadinessScore } from "./readiness.service.js";
import { XP_PER_LEVEL } from "./xp.service.js";

export const gamificationService = {
  async getSummary(userId: string): Promise<GamificationSummary> {
    const [
      profile,
      allAchievements,
      userAchievements,
      missions,
      readiness,
      recentEvents,
    ] = await Promise.all([
      prisma.profile.findUniqueOrThrow({ where: { userId } }),
      prisma.achievement.findMany({ orderBy: { xpReward: "asc" } }),
      prisma.userAchievement.findMany({ where: { userId } }),
      listMissionsForUser(userId),
      computeReadinessScore(userId),
      prisma.progressEvent.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { name: true, createdAt: true },
      }),
    ]);

    const byAchievementId = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));
    const achievements: AchievementSummary[] = allAchievements.map((a) => {
      const unlocked = byAchievementId.get(a.id);
      return {
        id: a.id,
        slug: a.slug,
        title: a.title,
        description: a.description,
        icon: a.icon,
        xpReward: a.xpReward,
        isUnlocked: !!unlocked,
        unlockedAt: unlocked ? unlocked.unlockedAt.toISOString() : null,
      };
    });
    const newlyUnlockedAchievementIds = userAchievements
      .filter((ua) => !ua.seenAt)
      .map((ua) => ua.achievementId);

    return {
      level: profile.level,
      totalXp: profile.totalXp,
      xpIntoCurrentLevel: profile.totalXp % XP_PER_LEVEL,
      xpPerLevel: XP_PER_LEVEL,
      streakDays: profile.streakDays,
      lastActivityAt: profile.lastActivityAt
        ? profile.lastActivityAt.toISOString()
        : null,
      readiness: readiness,
      achievements,
      newlyUnlockedAchievementIds,
      missions,
      recentActivity: recentEvents.map((e) => ({
        name: e.name,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  },

  async acknowledgeAchievements(userId: string, achievementIds: string[]) {
    await prisma.userAchievement.updateMany({
      where: { userId, achievementId: { in: achievementIds }, seenAt: null },
      data: { seenAt: new Date() },
    });
  },
};
