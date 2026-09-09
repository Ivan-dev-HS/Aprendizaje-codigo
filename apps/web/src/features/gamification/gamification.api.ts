import type { GamificationSummary } from "@codeforge/types";
import { apiClient } from "../../lib/api-client";

export const gamificationApi = {
  async getSummary() {
    const { data } = await apiClient.get<GamificationSummary>("/gamification/me");
    return data;
  },

  async ackAchievements(achievementIds: string[]) {
    await apiClient.post("/gamification/achievements/ack", { achievementIds });
  },
};
