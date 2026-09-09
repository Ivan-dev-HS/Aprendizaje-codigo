import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { resumeController } from "./resume.controller.js";

export const resumeRouter = Router();

resumeRouter.use(requireAuth);
resumeRouter.get("/me", asyncHandler(resumeController.getMine));
resumeRouter.patch("/me", asyncHandler(resumeController.updateMine));
