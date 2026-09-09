import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { gamificationController } from "./gamification.controller.js";

export const gamificationRouter = Router();

gamificationRouter.use(requireAuth);
gamificationRouter.get("/me", asyncHandler(gamificationController.me));
gamificationRouter.post(
  "/achievements/ack",
  asyncHandler(gamificationController.ackAchievements),
);
