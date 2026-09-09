import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { interviewsController } from "./interviews.controller.js";

export const interviewsRouter = Router();

interviewsRouter.use(optionalAuth);
interviewsRouter.get("/", asyncHandler(interviewsController.list));
interviewsRouter.get(
  "/attempts/me",
  requireAuth,
  asyncHandler(interviewsController.myAttempts),
);
interviewsRouter.get(
  "/attempts/:attemptId",
  requireAuth,
  asyncHandler(interviewsController.attemptDetail),
);
interviewsRouter.get("/:slug", asyncHandler(interviewsController.detail));
interviewsRouter.post(
  "/:id/start",
  requireAuth,
  asyncHandler(interviewsController.start),
);
interviewsRouter.post(
  "/:id/answer",
  requireAuth,
  asyncHandler(interviewsController.answer),
);
