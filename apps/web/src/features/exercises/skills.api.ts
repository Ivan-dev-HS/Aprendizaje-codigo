import type { SkillSummary, UserSkillSummary } from "@codeforge/types";
import { apiClient } from "../../lib/api-client";

export const skillsApi = {
  async list() {
    const { data } = await apiClient.get<{ skills: SkillSummary[] }>("/skills");
    return data.skills;
  },

  async listMine() {
    const { data } = await apiClient.get<{ skills: UserSkillSummary[] }>("/skills/me");
    return data.skills;
  },
};
