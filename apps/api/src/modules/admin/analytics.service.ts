import { prisma } from "@codeforge/database";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Sección 47 de SPEC.md. Todo se calcula en vivo sobre datos reales (nunca
 * simulado): usuarios activos, ejercicios completados, cursos populares,
 * ejercicios con mayor tasa de fallo, skills débiles, tiempo medio por
 * intento y una retención semanal simple (definida explícitamente en la
 * respuesta, para no aparentar ser una métrica más sofisticada de lo que es).
 */
export async function getAnalytics() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * MS_PER_DAY);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * MS_PER_DAY);

  const [
    totalUsers,
    activeLast7Days,
    activeLast30Days,
    exercisesCompleted,
    courses,
    totalExerciseAttempts,
    weakSkills,
    avgTimeSpent,
    retainedCandidates,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.profile.count({ where: { lastActivityAt: { gte: sevenDaysAgo } } }),
    prisma.profile.count({ where: { lastActivityAt: { gte: thirtyDaysAgo } } }),
    prisma.xpEvent.count({ where: { source: "EXERCISE" } }),
    prisma.course.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        modules: {
          select: {
            lessons: {
              select: { lessonProgress: { where: { completedAt: { not: null } } } },
            },
          },
        },
      },
    }),
    prisma.exerciseAttempt.count(),
    prisma.userSkill.groupBy({
      by: ["skillId"],
      where: { isWeak: true },
      _count: { _all: true },
      orderBy: { _count: { skillId: "desc" } },
      take: 5,
    }),
    prisma.exerciseAttempt.aggregate({ _avg: { timeSpentSeconds: true } }),
    prisma.profile.findMany({
      where: { createdAt: { lt: sevenDaysAgo } },
      select: { lastActivityAt: true },
    }),
  ]);

  const popularCourses = courses
    .map((c) => ({
      id: c.id,
      title: c.title,
      completedLessons: c.modules.reduce(
        (sum, m) => sum + m.lessons.reduce((s, l) => s + l.lessonProgress.length, 0),
        0,
      ),
    }))
    .sort((a, b) => b.completedLessons - a.completedLessons)
    .slice(0, 5);

  const failureCounts = await prisma.exerciseAttempt.findMany({
    select: { exerciseId: true, isCorrect: true },
  });
  const failureByExercise = new Map<string, { total: number; failed: number }>();
  for (const a of failureCounts) {
    const entry = failureByExercise.get(a.exerciseId) ?? { total: 0, failed: 0 };
    entry.total += 1;
    if (!a.isCorrect) entry.failed += 1;
    failureByExercise.set(a.exerciseId, entry);
  }
  const MIN_ATTEMPTS_FOR_SIGNAL = 3;
  const exerciseIds = [...failureByExercise.entries()]
    .filter(([, v]) => v.total >= MIN_ATTEMPTS_FOR_SIGNAL)
    .sort((a, b) => b[1].failed / b[1].total - a[1].failed / a[1].total)
    .slice(0, 5)
    .map(([id]) => id);
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
    select: { id: true, title: true },
  });
  const highestFailureRate = exerciseIds.map((id) => {
    const stats = failureByExercise.get(id)!;
    return {
      exerciseId: id,
      title: exercises.find((e) => e.id === id)?.title ?? id,
      failureRate: Math.round((stats.failed / stats.total) * 100),
      attempts: stats.total,
    };
  });

  const skills = await prisma.skill.findMany({
    where: { id: { in: weakSkills.map((w) => w.skillId) } },
    select: { id: true, name: true },
  });
  const weakestSkills = weakSkills.map((w) => ({
    skillId: w.skillId,
    name: skills.find((s) => s.id === w.skillId)?.name ?? w.skillId,
    usersStruggling: w._count._all,
  }));

  const retainedActive = retainedCandidates.filter(
    (p) => p.lastActivityAt && p.lastActivityAt >= sevenDaysAgo,
  ).length;
  const weeklyRetentionRate =
    retainedCandidates.length > 0
      ? Math.round((retainedActive / retainedCandidates.length) * 100)
      : null;

  return {
    totalUsers,
    activeUsers: { last7Days: activeLast7Days, last30Days: activeLast30Days },
    exercisesCompleted,
    popularCourses,
    highestFailureRateExercises: highestFailureRate,
    weakestSkills,
    averageAttemptTimeSeconds: Math.round(avgTimeSpent._avg.timeSpentSeconds ?? 0),
    weeklyRetention: {
      rate: weeklyRetentionRate,
      definition:
        "% de usuarios registrados hace más de 7 días con actividad (lastActivityAt) en los últimos 7 días.",
      cohortSize: retainedCandidates.length,
    },
    totalExerciseAttempts,
  };
}
