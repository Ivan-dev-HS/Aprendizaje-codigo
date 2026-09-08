import { prisma } from "@codeforge/database";
import type { SkillSummary, UserSkillSummary } from "@codeforge/types";
import { masteryBand } from "./mastery.js";

export const skillsService = {
  async list(): Promise<SkillSummary[]> {
    const skills = await prisma.skill.findMany({ orderBy: { name: "asc" } });
    return skills.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      category: s.category,
    }));
  },

  async listForUser(userId: string): Promise<UserSkillSummary[]> {
    const skills = await prisma.skill.findMany({
      orderBy: { name: "asc" },
      include: { userSkills: { where: { userId } } },
    });
    return skills.map((s) => {
      const userSkill = s.userSkills[0];
      const score = userSkill?.masteryScore ?? 0;
      return {
        id: s.id,
        slug: s.slug,
        name: s.name,
        category: s.category,
        masteryScore: score,
        isWeak: userSkill?.isWeak ?? false,
        masteryBand: masteryBand(score),
      };
    });
  },
};
