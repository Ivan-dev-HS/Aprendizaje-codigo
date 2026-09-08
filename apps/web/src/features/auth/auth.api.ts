import type { AuthUser, OnboardingResult } from "@codeforge/types";
import type {
  LoginInput,
  OnboardingInput,
  PasswordResetConfirmInput,
  PasswordResetRequestInput,
  RegisterInput,
} from "@codeforge/validators";
import { apiClient } from "../../lib/api-client";

interface AuthSessionResponse {
  user: AuthUser;
  accessToken: string;
  accessTokenExpiresAt: string;
}

export const authApi = {
  async register(input: RegisterInput) {
    const { data } = await apiClient.post<AuthSessionResponse>("/auth/register", input);
    return data;
  },

  async login(input: LoginInput) {
    const { data } = await apiClient.post<AuthSessionResponse>("/auth/login", input);
    return data;
  },

  async refresh() {
    const { data } = await apiClient.post<AuthSessionResponse>("/auth/refresh");
    return data;
  },

  async logout() {
    await apiClient.post("/auth/logout");
  },

  async requestPasswordReset(input: PasswordResetRequestInput) {
    const { data } = await apiClient.post<{ message: string }>(
      "/auth/password-reset/request",
      input,
    );
    return data;
  },

  async confirmPasswordReset(input: PasswordResetConfirmInput) {
    const { data } = await apiClient.post<{ message: string }>(
      "/auth/password-reset/confirm",
      input,
    );
    return data;
  },

  async me() {
    const { data } = await apiClient.get<{ user: AuthUser }>("/users/me");
    return data.user;
  },

  async getOnboardingQuiz() {
    const { data } = await apiClient.get<{
      questions: Array<{
        id: string;
        skillSlug: string;
        prompt: string;
        options: Array<{ id: string; label: string }>;
      }>;
    }>("/onboarding/quiz");
    return data.questions;
  },

  async completeOnboarding(input: OnboardingInput) {
    const { data } = await apiClient.post<OnboardingResult>("/onboarding", input);
    return data;
  },
};
