import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { standupsController } from "./standups.controller.js";

export const standupsRouter = Router();

standupsRouter.use(requireAuth);
standupsRouter.post("/", asyncHandler(standupsController.submit));
standupsRouter.get("/me", asyncHandler(standupsController.listMine));
