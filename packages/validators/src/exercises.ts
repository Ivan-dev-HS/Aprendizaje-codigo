import { z } from "zod";

export const exerciseAnswerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("MCQ"), optionId: z.string().min(1) }),
  z.object({ type: z.literal("TRUE_FALSE"), value: z.boolean() }),
  z.object({ type: z.literal("ORDERING"), order: z.array(z.string().min(1)).min(2) }),
  z.object({
    type: z.literal("MATCHING"),
    pairs: z
      .array(z.object({ leftId: z.string().min(1), rightId: z.string().min(1) }))
      .min(1),
  }),
  z.object({ type: z.literal("OUTPUT_PREDICTION"), output: z.string() }),
  z.object({ type: z.literal("CODE_COMPLETION"), answer: z.string().min(1) }),
  z.object({ type: z.literal("DEBUGGING"), optionId: z.string().min(1) }),
]);

export const submitExerciseAttemptSchema = z.object({
  answer: exerciseAnswerSchema,
  hintsUsed: z.coerce.number().int().min(0).max(3).default(0),
  timeSpentSeconds: z.coerce
    .number()
    .int()
    .min(0)
    .max(24 * 60 * 60)
    .default(0),
});
export type SubmitExerciseAttemptInput = z.infer<typeof submitExerciseAttemptSchema>;

export const exerciseListQuerySchema = z.object({
  skillSlug: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  type: z
    .enum([
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
    ])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ExerciseListQueryInput = z.infer<typeof exerciseListQuerySchema>;

export const hintLevelParamSchema = z.object({
  level: z.coerce.number().int().min(1).max(3),
});
