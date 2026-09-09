import { prisma } from "@codeforge/database";
import type {
  PortfolioProjectSummary,
  PortfolioSkillSummary,
  ResumeEducationItem,
  ResumeExperienceItem,
  ResumeLinkItem,
  ResumeView,
} from "@codeforge/types";
import type { UpdateResumeInput } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";

const MASTERY_THRESHOLD_FOR_RESUME = 40;

async function composeView(userId: string): Promise<ResumeView> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      resume: true,
      userSkills: { include: { skill: true }, orderBy: { masteryScore: "desc" } },
      userProjects: {
        where: { status: "COMPLETED" },
        include: { project: true },
        orderBy: { completedAt: "desc" },
      },
    },
  });
  if (!user || !user.profile) throw HttpError.notFound("Usuario no encontrado.");

  const skills: PortfolioSkillSummary[] = user.userSkills
    .filter((us) => us.masteryScore >= MASTERY_THRESHOLD_FOR_RESUME)
    .map((us) => ({
      slug: us.skill.slug,
      name: us.skill.name,
      masteryScore: us.masteryScore,
    }));

  const projects: PortfolioProjectSummary[] = user.userProjects.map((up) => ({
    slug: up.project.slug,
    title: up.project.title,
    level: up.project.level,
    brief: up.project.brief,
    githubUrl: up.githubUrl,
    demoUrl: up.demoUrl,
    technologies: (up.technologies as string[] | null) ?? [],
    completedAt: up.completedAt?.toISOString() ?? null,
  }));

  return {
    summary: user.resume?.summary ?? null,
    experience: (user.resume?.experience as ResumeExperienceItem[] | null) ?? [],
    education: (user.resume?.education as ResumeEducationItem[] | null) ?? [],
    links: (user.resume?.links as ResumeLinkItem[] | null) ?? [],
    displayName: user.profile.displayName,
    bio: user.profile.bio,
    skills,
    projects,
  };
}

export const resumeService = {
  getMine(userId: string): Promise<ResumeView> {
    return composeView(userId);
  },

  async updateMine(userId: string, input: UpdateResumeInput): Promise<ResumeView> {
    await prisma.resume.upsert({
      where: { userId },
      update: {
        ...(input.summary !== undefined ? { summary: input.summary } : {}),
        ...(input.experience !== undefined
          ? { experience: input.experience as never }
          : {}),
        ...(input.education !== undefined ? { education: input.education as never } : {}),
        ...(input.links !== undefined ? { links: input.links as never } : {}),
      },
      create: {
        userId,
        summary: input.summary,
        experience: input.experience as never,
        education: input.education as never,
        links: input.links as never,
      },
    });
    return composeView(userId);
  },
};
