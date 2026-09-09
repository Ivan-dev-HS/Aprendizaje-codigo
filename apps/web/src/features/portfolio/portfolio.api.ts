import type { PortfolioSettings, PortfolioView } from "@codeforge/types";
import { apiClient } from "../../lib/api-client";

export interface UpdatePortfolioInput {
  isPublic: boolean;
  headline?: string;
  theme?: "default" | "minimal" | "dark";
}

export const portfolioApi = {
  async getMine() {
    const { data } = await apiClient.get<{
      settings: PortfolioSettings;
      preview: PortfolioView;
    }>("/portfolio/me");
    return data;
  },

  async updateMine(input: UpdatePortfolioInput) {
    const { data } = await apiClient.patch<{ settings: PortfolioSettings }>(
      "/portfolio/me",
      input,
    );
    return data.settings;
  },

  async getPublic(username: string) {
    const { data } = await apiClient.get<{ portfolio: PortfolioView }>(
      `/portfolio/${username}`,
    );
    return data.portfolio;
  },
};
