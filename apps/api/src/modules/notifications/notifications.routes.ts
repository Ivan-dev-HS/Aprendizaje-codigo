import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { notificationsController } from "./notifications.controller.js";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);
notificationsRouter.get("/", asyncHandler(notificationsController.list));
notificationsRouter.post("/read-all", asyncHandler(notificationsController.markAllRead));
notificationsRouter.patch("/:id/read", asyncHandler(notificationsController.markRead));
