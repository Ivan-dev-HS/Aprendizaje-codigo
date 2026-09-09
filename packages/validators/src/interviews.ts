import { z } from "zod";

const INTERVIEW_CATEGORIES = [
  "TECHNICAL",
  "BEHAVIORAL",
  "FRONTEND",
  "BACKEND",
  "FULL_STACK",
  "IT_SUPPORT",
] as const;

export const interviewListQuerySchema = z.object({
  category: z.enum(INTERVIEW_CATEGORIES).optional(),
});
export type InterviewListQueryInput = z.infer<typeof interviewListQuerySchema>;

export const submitInterviewAnswerSchema = z.object({
  attemptId: z.string().min(1),
  questionId: z.string().min(1),
  answerText: z.string().trim().min(1).max(4000),
  timeSpentSeconds: z.coerce
    .number()
    .int()
    .min(0)
    .max(60 * 60)
    .default(0),
});
export type SubmitInterviewAnswerInput = z.infer<typeof submitInterviewAnswerSchema>;
