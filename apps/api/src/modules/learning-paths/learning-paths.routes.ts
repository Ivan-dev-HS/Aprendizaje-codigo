import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { learningPathsController } from "./learning-paths.controller.js";

export const learningPathsRouter = Router();

learningPathsRouter.get("/me", requireAuth, asyncHandler(learningPathsController.mine));
