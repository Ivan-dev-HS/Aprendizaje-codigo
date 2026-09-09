import { z } from "zod";

export const updatePortfolioSchema = z.object({
  isPublic: z.boolean(),
  headline: z.string().trim().max(160).optional(),
  theme: z.enum(["default", "minimal", "dark"]).optional(),
});
export type UpdatePortfolioInput = z.infer<typeof updatePortfolioSchema>;

const experienceItemSchema = z.object({
  company: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  startDate: z.string().trim().min(1).max(20),
  endDate: z.string().trim().max(20).nullable(),
  description: z.string().trim().max(2000),
});

const educationItemSchema = z.object({
  institution: z.string().trim().min(1).max(160),
  degree: z.string().trim().min(1).max(160),
  startDate: z.string().trim().min(1).max(20),
  endDate: z.string().trim().max(20).nullable(),
});

const linkItemSchema = z.object({
  label: z.string().trim().min(1).max(60),
  url: z.string().trim().min(1).max(500),
});

export const updateResumeSchema = z.object({
  summary: z.string().trim().max(2000).optional(),
  experience: z.array(experienceItemSchema).max(20).optional(),
  education: z.array(educationItemSchema).max(20).optional(),
  links: z.array(linkItemSchema).max(20).optional(),
});
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
