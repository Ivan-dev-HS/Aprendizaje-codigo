import type {
  CaseAttemptResult,
  CaseDetail,
  CaseKind,
  CaseSummary,
  CasePostmortem,
  PaginatedResponse,
} from "@codeforge/types";
import { apiClient } from "../../lib/api-client";

export interface CaseListFilters {
  kind?: CaseKind;
  domain?: string;
  page?: number;
  pageSize?: number;
}

export const casesApi = {
  async list(filters: CaseListFilters) {
    const { data } = await apiClient.get<PaginatedResponse<CaseSummary>>("/cases", {
      params: filters,
    });
    return data;
  },

  async getDetail(id: string) {
    const { data } = await apiClient.get<{ case: CaseDetail }>(`/cases/${id}`);
    return data.case;
  },

  async getHint(id: string, level: number) {
    const { data } = await apiClient.get<{ level: number; hint: string }>(
      `/cases/${id}/hints/${level}`,
    );
    return data.hint;
  },

  async submitAttempt(
    id: string,
    optionId: string,
    hintsUsed: number,
    timeSpentSeconds: number,
    postmortem?: Partial<CasePostmortem>,
  ) {
    const { data } = await apiClient.post<CaseAttemptResult>(`/cases/${id}/attempt`, {
      optionId,
      hintsUsed,
      timeSpentSeconds,
      postmortem,
    });
    return data;
  },
};
