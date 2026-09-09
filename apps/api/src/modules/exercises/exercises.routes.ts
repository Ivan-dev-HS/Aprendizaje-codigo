import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { exercisesController } from "./exercises.controller.js";

export const exercisesRouter = Router();

exercisesRouter.use(optionalAuth);
exercisesRouter.get("/", asyncHandler(exercisesController.list));
exercisesRouter.get("/:id", asyncHandler(exercisesController.detail));
exercisesRouter.get("/:id/hints/:level", asyncHandler(exercisesController.hint));
exercisesRouter.post(
  "/:id/attempt",
  requireAuth,
  asyncHandler(exercisesController.attempt),
);
