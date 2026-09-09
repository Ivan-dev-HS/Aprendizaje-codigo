import { prisma } from "@codeforge/database";

/**
 * Professional Readiness Score (sección 44 de SPEC.md): "indicador interno
 * de preparación", nunca una garantía de empleabilidad — se muestra siempre
 * con ese matiz en el frontend. Se compone en vivo a partir de datos reales
 * de la plataforma (mismo principio que Portfolio/CV en la Fase 6), nunca se
 * inventa ni se cachea de forma que pueda quedar desactualizado: se
 * recalcula en cada lectura y el resultado se persiste en
 * `Profile.readinessScore` solo como snapshot informativo.
 *
 * Dimensiones (KNOWLEDGE/PRACTICE/DEBUGGING/PROJECTS/GIT/COMMUNICATION/
 * INTERVIEW): cada una 0-100, el overall es su media.
 */
async function ratio(completed: number, total: number): Promise<number> {
  if (total === 0) return 0;
  return Math.round(Math.min(1, completed / total) * 100);
}

export async function computeReadinessScore(userId: string) {
  const [
    skills,
    totalExercises,
    completedExercises,
    totalCases,
    completedCases,
    totalProjects,
    completedProjects,
    gitSkill,
    recentStandups,
    finishedInterviews,
  ] = await Promise.all([
    prisma.skill.findMany({ include: { userSkills: { where: { userId } } } }),
    prisma.exercise.count({ where: { isPublished: true } }),
    prisma.xpEvent.count({ where: { userId, source: "EXERCISE" } }),
    prisma.case.count({ where: { isPublished: true } }),
    prisma.xpEvent.count({ where: { userId, source: "CASE" } }),
    prisma.project.count(),
    prisma.xpEvent.count({ where: { userId, source: "PROJECT" } }),
    prisma.skill.findFirst({
      where: { slug: "git" },
      include: { userSkills: { where: { userId } } },
    }),
    prisma.standupEntry.findMany({
      where: { userId, communicationScore: { not: null } },
      orderBy: { date: "desc" },
      take: 10,
      select: { communicationScore: true },
    }),
    prisma.interviewAttempt.findMany({
      where: { userId, finishedAt: { not: null } },
      select: { overallScore: true },
    }),
  ]);

  const knowledge = skills.length
    ? Math.round(
        skills.reduce((sum, s) => sum + (s.userSkills[0]?.masteryScore ?? 0), 0) /
          skills.length,
      )
    : 0;
  const practice = await ratio(completedExercises, totalExercises);
  const debuggingCaseRatio = await ratio(completedCases, totalCases);
  const debuggingSkill =
    skills.find((s) => s.slug === "debugging")?.userSkills[0]?.masteryScore ?? 0;
  const debugging = Math.round((debuggingCaseRatio + debuggingSkill) / 2);
  const projects = await ratio(completedProjects, totalProjects);
  const git = gitSkill?.userSkills[0]?.masteryScore ?? 0;
  const communication = recentStandups.length
    ? Math.round(
        recentStandups.reduce((sum, s) => sum + (s.communicationScore ?? 0), 0) /
          recentStandups.length,
      )
    : 0;
  const interview = finishedInterviews.length
    ? Math.round(
        finishedInterviews.reduce((sum, a) => sum + (a.overallScore ?? 0), 0) /
          finishedInterviews.length,
      )
    : 0;

  const overall = Math.round(
    (knowledge + practice + debugging + projects + git + communication + interview) / 7,
  );

  await prisma.profile.update({ where: { userId }, data: { readinessScore: overall } });

  return {
    overall,
    knowledge,
    practice,
    debugging,
    projects,
    git,
    communication,
    interview,
  };
}
