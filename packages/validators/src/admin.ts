import { z } from "zod";

const EXERCISE_TYPES = [
  "MCQ",
  "TRUE_FALSE",
  "CODE_COMPLETION",
  "CODE_WRITING",
  "DEBUGGING",
  "OUTPUT_PREDICTION",
  "ORDERING",
  "MATCHING",
  "SQL",
  "TERMINAL",
  "REAL_CASE",
  "PROJECT_TASK",
] as const;
const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
const PROJECT_LEVELS = [
  "L1_PORTFOLIO",
  "L2_LANDING",
  "L3_TODO",
  "L4_DASHBOARD",
  "L5_API_APP",
  "L6_ECOMMERCE",
  "L7_FULL_STACK",
  "L8_SAAS",
] as const;
const INTERVIEW_CATEGORIES = [
  "TECHNICAL",
  "BEHAVIORAL",
  "FRONTEND",
  "BACKEND",
  "FULL_STACK",
  "IT_SUPPORT",
] as const;
const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const TICKET_TYPES = ["BUG", "FEATURE", "CHORE", "INCIDENT"] as const;
const TICKET_STATUSES = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "BLOCKED",
  "CODE_REVIEW",
  "QA",
  "DONE",
] as const;

export const adminCourseSchema = z.object({
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  order: z.coerce.number().int(),
  icon: z.string().trim().optional(),
  estimatedHours: z.coerce.number().int().positive().optional(),
  isPublished: z.boolean().default(true),
});
export const adminCourseUpdateSchema = adminCourseSchema.partial();

export const adminModuleSchema = z.object({
  courseId: z.string().min(1),
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  order: z.coerce.number().int(),
  requiresModuleId: z.string().optional(),
});
export const adminModuleUpdateSchema = adminModuleSchema.partial();

export const adminLessonSchema = z.object({
  moduleId: z.string().min(1),
  skillId: z.string().optional(),
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  content: z.unknown(),
  order: z.coerce.number().int(),
  estimatedMinutes: z.coerce.number().int().positive().default(10),
});
export const adminLessonUpdateSchema = adminLessonSchema.partial();

export const adminExerciseSchema = z.object({
  lessonId: z.string().optional(),
  skillId: z.string().min(1),
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  type: z.enum(EXERCISE_TYPES),
  difficulty: z.enum(DIFFICULTIES),
  points: z.coerce.number().int().positive(),
  estimatedMinutes: z.coerce.number().int().positive(),
  prompt: z.unknown(),
  hints: z.unknown(),
  solution: z.unknown(),
  explanation: z.string().trim().min(1),
  tests: z.unknown().optional(),
  isPublished: z.boolean().default(true),
});
export const adminExerciseUpdateSchema = adminExerciseSchema.partial();

export const adminProjectSchema = z.object({
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  level: z.enum(PROJECT_LEVELS),
  brief: z.string().trim().min(1),
  requirements: z.unknown(),
  userStories: z.unknown(),
  acceptanceCriteria: z.unknown(),
  bonusIdeas: z.unknown().optional(),
  estimatedHours: z.coerce.number().int().positive(),
});
export const adminProjectUpdateSchema = adminProjectSchema.partial();

export const adminSkillSchema = z.object({
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1),
});
export const adminSkillUpdateSchema = adminSkillSchema.partial();

export const adminAchievementSchema = z.object({
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  icon: z.string().trim().min(1),
  xpReward: z.coerce.number().int().min(0).default(0),
  criteria: z.unknown(),
});
export const adminAchievementUpdateSchema = adminAchievementSchema.partial();

export const adminInterviewQuestionSchema = z.object({
  slug: z.string().trim().min(1),
  category: z.enum(INTERVIEW_CATEGORIES),
  skillId: z.string().optional(),
  difficulty: z.enum(DIFFICULTIES),
  prompt: z.string().trim().min(1),
  expectedAnswer: z.string().trim().min(1),
  concepts: z.unknown(),
  commonMistakes: z.unknown(),
});
export const adminInterviewQuestionUpdateSchema = adminInterviewQuestionSchema.partial();

export const adminTicketSchema = z.object({
  code: z.string().trim().min(1),
  sprintId: z.string().optional(),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  priority: z.enum(TICKET_PRIORITIES),
  type: z.enum(TICKET_TYPES),
  status: z.enum(TICKET_STATUSES).default("BACKLOG"),
  acceptanceCriteria: z.unknown(),
  reporterId: z.string().min(1),
  assigneeId: z.string().optional(),
});
export const adminTicketUpdateSchema = adminTicketSchema.partial();

export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
});

export const adminUserListQuerySchema = adminListQuerySchema.extend({
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export const adminUpdateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

export const adminUpdateFeatureFlagSchema = z.object({
  isEnabled: z.boolean(),
  description: z.string().trim().optional(),
});
