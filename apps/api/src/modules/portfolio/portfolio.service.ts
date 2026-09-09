import { prisma } from "@codeforge/database";
import type {
  PortfolioProjectSummary,
  PortfolioSettings,
  PortfolioSkillSummary,
  PortfolioView,
  ResumeEducationItem,
  ResumeLinkItem,
} from "@codeforge/types";
import type { UpdatePortfolioInput } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";

const MASTERY_THRESHOLD_FOR_PORTFOLIO = 40;

async function composeView(userId: string): Promise<PortfolioView> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      portfolio: true,
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
    .filter((us) => us.masteryScore >= MASTERY_THRESHOLD_FOR_PORTFOLIO)
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
    username: user.username,
    displayName: user.profile.displayName,
    avatarUrl: user.profile.avatarUrl,
    bio: user.profile.bio,
    headline: user.portfolio?.headline ?? null,
    theme: user.portfolio?.theme ?? "default",
    level: user.profile.level,
    totalXp: user.profile.totalXp,
    skills,
    projects,
    education: (user.resume?.education as ResumeEducationItem[] | null) ?? [],
    links: (user.resume?.links as ResumeLinkItem[] | null) ?? [],
  };
}

export const portfolioService = {
  async getMine(
    userId: string,
  ): Promise<{ settings: PortfolioSettings; preview: PortfolioView }> {
    const portfolio = await prisma.portfolio.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    const preview = await composeView(userId);
    return {
      settings: {
        isPublic: portfolio.isPublic,
        headline: portfolio.headline,
        theme: portfolio.theme,
      },
      preview,
    };
  },

  async updateMine(
    userId: string,
    input: UpdatePortfolioInput,
  ): Promise<PortfolioSettings> {
    const portfolio = await prisma.portfolio.upsert({
      where: { userId },
      update: {
        isPublic: input.isPublic,
        ...(input.headline !== undefined ? { headline: input.headline } : {}),
        ...(input.theme !== undefined ? { theme: input.theme } : {}),
      },
      create: {
        userId,
        isPublic: input.isPublic,
        headline: input.headline,
        theme: input.theme ?? "default",
      },
    });
    return {
      isPublic: portfolio.isPublic,
      headline: portfolio.headline,
      theme: portfolio.theme,
    };
  },

  async getPublic(username: string): Promise<PortfolioView> {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { portfolio: true },
    });
    if (!user || !user.portfolio?.isPublic) {
      throw HttpError.notFound("Este portfolio no está disponible.");
    }
    return composeView(user.id);
  },
};
