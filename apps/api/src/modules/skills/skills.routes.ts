import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { skillsController } from "./skills.controller.js";

export const skillsRouter = Router();

skillsRouter.get("/me", requireAuth, asyncHandler(skillsController.listMine));
skillsRouter.get("/", asyncHandler(skillsController.list));
