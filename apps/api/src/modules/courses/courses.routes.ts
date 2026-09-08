import { Router } from "express";
import { optionalAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { coursesController } from "./courses.controller.js";

export const coursesRouter = Router();

coursesRouter.use(optionalAuth);
coursesRouter.get("/", asyncHandler(coursesController.list));
coursesRouter.get("/:slug", asyncHandler(coursesController.detail));
