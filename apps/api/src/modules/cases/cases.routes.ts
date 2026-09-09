import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { casesController } from "./cases.controller.js";

export const casesRouter = Router();

casesRouter.use(optionalAuth);
casesRouter.get("/", asyncHandler(casesController.list));
casesRouter.get("/:id", asyncHandler(casesController.detail));
casesRouter.get("/:id/hints/:level", asyncHandler(casesController.hint));
casesRouter.post("/:id/attempt", requireAuth, asyncHandler(casesController.attempt));
