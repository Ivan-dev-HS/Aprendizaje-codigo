import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { pullRequestsController } from "./pull-requests.controller.js";

export const pullRequestsRouter = Router();

pullRequestsRouter.use(optionalAuth);
pullRequestsRouter.get("/", asyncHandler(pullRequestsController.list));
pullRequestsRouter.get("/:id", asyncHandler(pullRequestsController.detail));
pullRequestsRouter.post(
  "/:id/review",
  requireAuth,
  asyncHandler(pullRequestsController.review),
);
