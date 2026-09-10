import { Router, type RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { authController } from "./auth.controller.js";

export const authRouter = Router();

// Ver el mismo cast documentado en apps/api/src/app.ts: el verificador de
// tipos que usa Vercel para el build no aplica esModuleInterop.
const rateLimitMiddleware = rateLimit as unknown as (
  options?: Record<string, unknown>,
) => RequestHandler;

/** Límite estricto en rutas de autenticación: mitiga fuerza bruta y credential stuffing. */
const authLimiter = rateLimitMiddleware({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Demasiados intentos. Inténtalo más tarde.",
    },
  },
});

authRouter.use(authLimiter);

authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/login", asyncHandler(authController.login));
authRouter.post("/refresh", asyncHandler(authController.refresh));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.post(
  "/password-reset/request",
  asyncHandler(authController.requestPasswordReset),
);
authRouter.post(
  "/password-reset/confirm",
  asyncHandler(authController.confirmPasswordReset),
);
