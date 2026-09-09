import type {
  Difficulty,
  ExerciseAnswer,
  ExerciseAttemptResult,
  ExerciseDetail,
  ExerciseSummary,
  ExerciseType,
  PaginatedResponse,
} from "@codeforge/types";
import { apiClient } from "../../lib/api-client";

export interface ExerciseListFilters {
  skillSlug?: string;
  difficulty?: Difficulty;
  type?: ExerciseType;
  page?: number;
  pageSize?: number;
}

export const exercisesApi = {
  async list(filters: ExerciseListFilters) {
    const { data } = await apiClient.get<PaginatedResponse<ExerciseSummary>>(
      "/exercises",
      {
        params: filters,
      },
    );
    return data;
  },

  async getDetail(id: string) {
    const { data } = await apiClient.get<{ exercise: ExerciseDetail }>(
      `/exercises/${id}`,
    );
    return data.exercise;
  },

  async getHint(id: string, level: number) {
    const { data } = await apiClient.get<{ level: number; hint: string }>(
      `/exercises/${id}/hints/${level}`,
    );
    return data.hint;
  },

  async submitAttempt(
    id: string,
    answer: ExerciseAnswer,
    hintsUsed: number,
    timeSpentSeconds: number,
  ) {
    const { data } = await apiClient.post<ExerciseAttemptResult>(
      `/exercises/${id}/attempt`,
      {
        answer,
        hintsUsed,
        timeSpentSeconds,
      },
    );
    return data;
  },
};
