import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { onboardingController } from "./onboarding.controller.js";

export const onboardingRouter = Router();

onboardingRouter.get("/quiz", onboardingController.getQuiz);
onboardingRouter.post("/", requireAuth, asyncHandler(onboardingController.complete));
