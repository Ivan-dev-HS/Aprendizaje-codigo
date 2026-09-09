import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { ticketsController } from "./tickets.controller.js";

export const ticketsRouter = Router();

ticketsRouter.use(optionalAuth);
ticketsRouter.get("/", asyncHandler(ticketsController.list));
ticketsRouter.get("/:id", asyncHandler(ticketsController.detail));
ticketsRouter.patch("/:id", requireAuth, asyncHandler(ticketsController.update));
ticketsRouter.post(
  "/:id/comments",
  requireAuth,
  asyncHandler(ticketsController.addComment),
);
