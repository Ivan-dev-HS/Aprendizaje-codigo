import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { lessonsController } from "./lessons.controller.js";

export const lessonsRouter = Router();

lessonsRouter.get("/:id", optionalAuth, asyncHandler(lessonsController.detail));
lessonsRouter.post(
  "/:id/complete",
  requireAuth,
  asyncHandler(lessonsController.complete),
);
