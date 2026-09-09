export type NotificationType = "ACHIEVEMENT" | "COURSE" | "TICKET" | "REVIEW" | "SYSTEM";

export interface NotificationSummary {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AchievementSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export type MissionPeriod = "DAILY" | "WEEKLY";

export interface MissionProgress {
  id: string;
  slug: string;
  title: string;
  description: string;
  period: MissionPeriod;
  xpReward: number;
  progress: number;
  target: number;
  isCompleted: boolean;
}

export interface ReadinessBreakdown {
  overall: number;
  knowledge: number;
  practice: number;
  debugging: number;
  projects: number;
  git: number;
  communication: number;
  interview: number;
}

export interface GamificationSummary {
  level: number;
  totalXp: number;
  xpIntoCurrentLevel: number;
  xpPerLevel: number;
  streakDays: number;
  lastActivityAt: string | null;
  readiness: ReadinessBreakdown;
  achievements: AchievementSummary[];
  newlyUnlockedAchievementIds: string[];
  missions: MissionProgress[];
  recentActivity: { name: string; createdAt: string }[];
}

export type SearchResultType =
  "COURSE" | "LESSON" | "EXERCISE" | "CASE" | "PROJECT" | "INTERVIEW";

export interface SearchResultItem {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  link: string;
}
