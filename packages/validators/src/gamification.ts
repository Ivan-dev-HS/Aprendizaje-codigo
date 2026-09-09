import { z } from "zod";

export const ackAchievementsSchema = z.object({
  achievementIds: z.array(z.string()).min(1).max(50),
});
export type AckAchievementsInput = z.infer<typeof ackAchievementsSchema>;

export const searchQuerySchema = z.object({ q: z.string().default("") });
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
