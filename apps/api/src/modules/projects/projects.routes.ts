import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { projectsController } from "./projects.controller.js";

export const projectsRouter = Router();

projectsRouter.use(optionalAuth);
projectsRouter.get("/", asyncHandler(projectsController.list));
projectsRouter.get("/:slug", asyncHandler(projectsController.detail));
projectsRouter.post("/:id/start", requireAuth, asyncHandler(projectsController.start));
projectsRouter.patch(
  "/:id",
  requireAuth,
  asyncHandler(projectsController.updateMetadata),
);
projectsRouter.post(
  "/:id/tasks/:taskId/complete",
  requireAuth,
  asyncHandler(projectsController.completeTask),
);
