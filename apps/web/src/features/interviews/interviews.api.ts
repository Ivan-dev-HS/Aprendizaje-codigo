import type {
  InterviewAttemptDetail,
  InterviewAttemptSummary,
  InterviewCategory,
  InterviewDetail,
  InterviewSummary,
  StartInterviewResult,
  SubmitInterviewAnswerResult,
} from "@codeforge/types";
import { apiClient } from "../../lib/api-client";

export const interviewsApi = {
  async list(category?: InterviewCategory) {
    const { data } = await apiClient.get<{ items: InterviewSummary[] }>("/interviews", {
      params: category ? { category } : undefined,
    });
    return data.items;
  },

  async getDetail(slug: string) {
    const { data } = await apiClient.get<{ interview: InterviewDetail }>(
      `/interviews/${slug}`,
    );
    return data.interview;
  },

  async start(interviewId: string) {
    const { data } = await apiClient.post<StartInterviewResult>(
      `/interviews/${interviewId}/start`,
    );
    return data;
  },

  async answer(
    interviewId: string,
    input: {
      attemptId: string;
      questionId: string;
      answerText: string;
      timeSpentSeconds: number;
    },
  ) {
    const { data } = await apiClient.post<SubmitInterviewAnswerResult>(
      `/interviews/${interviewId}/answer`,
      input,
    );
    return data;
  },

  async myAttempts() {
    const { data } = await apiClient.get<{ items: InterviewAttemptSummary[] }>(
      "/interviews/attempts/me",
    );
    return data.items;
  },

  async getAttempt(attemptId: string) {
    const { data } = await apiClient.get<{ attempt: InterviewAttemptDetail }>(
      `/interviews/attempts/${attemptId}`,
    );
    return data.attempt;
  },
};
