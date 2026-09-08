import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Introduce un email válido.");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "El nombre de usuario debe tener al menos 3 caracteres.")
  .max(24, "El nombre de usuario no puede superar 24 caracteres.")
  .regex(/^[a-z0-9_]+$/, "Solo puede contener minúsculas, números y guiones bajos.");

export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(72, "La contraseña no puede superar 72 caracteres.")
  .regex(/[a-zA-Z]/, "La contraseña debe incluir al menos una letra.")
  .regex(/[0-9]/, "La contraseña debe incluir al menos un número.");

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(2, "Introduce tu nombre.").max(60),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Introduce tu contraseña."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});
export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;

export const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(60).optional(),
  bio: z.string().trim().max(500).optional(),
  avatarUrl: z.string().url().max(500).optional().or(z.literal("")),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const goalEnum = z.enum([
  "FROM_SCRATCH",
  "FRONTEND",
  "BACKEND",
  "FULL_STACK",
  "IT_SUPPORT",
  "INTERVIEW_PREP",
]);

export const experienceLevelEnum = z.enum(["NONE", "BASIC", "INTERMEDIATE", "ADVANCED"]);

export const onboardingSchema = z.object({
  experienceLevel: experienceLevelEnum,
  goal: goalEnum,
  assessmentAnswers: z.array(
    z.object({
      questionId: z.string(),
      optionId: z.string(),
    }),
  ),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;
