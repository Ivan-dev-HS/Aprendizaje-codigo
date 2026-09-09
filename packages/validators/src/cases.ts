import { z } from "zod";

const CASE_KINDS = [
  "DEBUGGING",
  "IT_SUPPORT",
  "NETWORKING",
  "PRODUCTION_INCIDENT",
] as const;
const CASE_DOMAINS = [
  "HTML",
  "CSS",
  "JAVASCRIPT",
  "REACT",
  "NODE",
  "SQL",
  "API",
  "GIT",
  "LINUX",
  "IT_HARDWARE",
  "IT_WINDOWS",
  "IT_LINUX",
  "IT_NETWORKING",
  "IT_SOFTWARE",
  "IT_SECURITY",
  "IT_PRINTERS",
  "IT_ACCOUNTS",
  "IT_PERFORMANCE",
  "NETWORKING",
  "PRODUCTION",
] as const;

export const caseListQuerySchema = z.object({
  kind: z.enum(CASE_KINDS).optional(),
  domain: z.enum(CASE_DOMAINS).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type CaseListQueryInput = z.infer<typeof caseListQuerySchema>;

export const caseHintLevelParamSchema = z.object({
  level: z.coerce.number().int().min(1).max(3),
});

const postmortemSchema = z.object({
  whatHappened: z.string().trim().max(2000).optional(),
  rootCause: z.string().trim().max(2000).optional(),
  impact: z.string().trim().max(2000).optional(),
  timeline: z.string().trim().max(2000).optional(),
  fix: z.string().trim().max(2000).optional(),
  prevention: z.string().trim().max(2000).optional(),
});

export const submitCaseAttemptSchema = z.object({
  optionId: z.string().min(1),
  hintsUsed: z.coerce.number().int().min(0).max(3).default(0),
  timeSpentSeconds: z.coerce
    .number()
    .int()
    .min(0)
    .max(24 * 60 * 60)
    .default(0),
  postmortem: postmortemSchema.optional(),
});
export type SubmitCaseAttemptInput = z.infer<typeof submitCaseAttemptSchema>;
