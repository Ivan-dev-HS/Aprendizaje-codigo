import type { NotificationSummary, PaginatedResponse } from "@codeforge/types";
import { apiClient } from "../../lib/api-client";

export const notificationsApi = {
  async list(page = 1, pageSize = 10) {
    const { data } = await apiClient.get<
      PaginatedResponse<NotificationSummary> & { unreadCount: number }
    >("/notifications", { params: { page, pageSize } });
    return data;
  },

  async markRead(id: string) {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllRead() {
    await apiClient.post("/notifications/read-all");
  },
};
