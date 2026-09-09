import type {
  CodeReviewResult,
  PullRequestDetail,
  PullRequestSummary,
  SprintSummary,
  StandupEntrySummary,
  TicketComment,
  TicketDetail,
  TicketStatus,
  TicketSummary,
} from "@codeforge/types";
import { apiClient } from "../../lib/api-client";

export const companyApi = {
  async getCurrentSprint() {
    const { data } = await apiClient.get<{ sprint: SprintSummary }>("/sprints/current");
    return data.sprint;
  },

  async listTickets(status?: TicketStatus) {
    const { data } = await apiClient.get<{ items: TicketSummary[] }>("/tickets", {
      params: status ? { status } : undefined,
    });
    return data.items;
  },

  async getTicket(id: string) {
    const { data } = await apiClient.get<{ ticket: TicketDetail }>(`/tickets/${id}`);
    return data.ticket;
  },

  async assignToMe(id: string) {
    const { data } = await apiClient.patch<{ ticket: TicketSummary }>(`/tickets/${id}`, {
      assignToMe: true,
    });
    return data.ticket;
  },

  async setStatus(id: string, status: TicketStatus) {
    const { data } = await apiClient.patch<{
      ticket: TicketSummary;
      xpAwarded: number;
      leveledUp: boolean;
    }>(`/tickets/${id}`, { status });
    return data;
  },

  async addComment(id: string, body: string) {
    const { data } = await apiClient.post<{ comment: TicketComment }>(
      `/tickets/${id}/comments`,
      { body },
    );
    return data.comment;
  },

  async submitStandup(yesterday: string, today: string, blockers: string) {
    const { data } = await apiClient.post<{ entry: StandupEntrySummary }>("/standups", {
      yesterday,
      today,
      blockers: blockers || undefined,
    });
    return data.entry;
  },

  async listMyStandups() {
    const { data } = await apiClient.get<{ items: StandupEntrySummary[] }>(
      "/standups/me",
    );
    return data.items;
  },

  async listPullRequests() {
    const { data } = await apiClient.get<{ items: PullRequestSummary[] }>(
      "/pull-requests",
    );
    return data.items;
  },

  async getPullRequest(id: string) {
    const { data } = await apiClient.get<{ pullRequest: PullRequestDetail }>(
      `/pull-requests/${id}`,
    );
    return data.pullRequest;
  },

  async submitReview(
    id: string,
    selectedIssueIds: string[],
    verdict: "APPROVE" | "REQUEST_CHANGES" | "COMMENT",
    summary: string,
  ) {
    const { data } = await apiClient.post<CodeReviewResult>(
      `/pull-requests/${id}/review`,
      {
        selectedIssueIds,
        verdict,
        summary: summary || undefined,
      },
    );
    return data;
  },
};
