import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { portfolioController } from "./portfolio.controller.js";

export const portfolioRouter = Router();

portfolioRouter.get("/me", requireAuth, asyncHandler(portfolioController.getMine));
portfolioRouter.patch("/me", requireAuth, asyncHandler(portfolioController.updateMine));
portfolioRouter.get("/:username", asyncHandler(portfolioController.getPublic));
