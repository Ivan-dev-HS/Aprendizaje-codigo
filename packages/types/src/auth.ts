export type Role = "USER" | "ADMIN";
export type Goal =
  | "FROM_SCRATCH"
  | "FRONTEND"
  | "BACKEND"
  | "FULL_STACK"
  | "IT_SUPPORT"
  | "INTERVIEW_PREP";
export type ExperienceLevel = "NONE" | "BASIC" | "INTERMEDIATE" | "ADVANCED";

export interface AuthProfile {
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  goal: Goal;
  experienceLevel: ExperienceLevel;
  level: number;
  totalXp: number;
  streakDays: number;
  readinessScore: number | null;
  onboardingCompletedAt: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: Role;
  createdAt: string;
  profile: AuthProfile;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  accessTokenExpiresAt: string;
}

export interface DiagnosticQuestionOption {
  id: string;
  label: string;
}

export interface DiagnosticQuestion {
  id: string;
  skillSlug: string;
  prompt: string;
  options: DiagnosticQuestionOption[];
}

export interface OnboardingResult {
  profile: AuthProfile;
  learningPath: {
    goal: Goal;
    items: Array<{
      courseSlug: string;
      courseTitle: string;
      order: number;
      isRequired: boolean;
    }>;
  };
  assessment: {
    score: number;
    strengths: string[];
    recommendations: string[];
  };
}
