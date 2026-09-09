import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/.+/.test(v), "Debe ser una URL http(s) válida.")
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const updateUserProjectSchema = z.object({
  githubUrl: optionalUrl,
  demoUrl: optionalUrl,
  readme: z.string().max(20_000).optional(),
  screenshots: z.array(z.string().url()).max(10).optional(),
  technologies: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
});
export type UpdateUserProjectInput = z.infer<typeof updateUserProjectSchema>;
