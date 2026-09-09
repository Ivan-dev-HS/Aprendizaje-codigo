import type { SearchResultItem } from "@codeforge/types";
import { apiClient } from "../../lib/api-client";

export const searchApi = {
  async search(q: string) {
    const { data } = await apiClient.get<{ items: SearchResultItem[] }>("/search", {
      params: { q },
    });
    return data.items;
  },
};
