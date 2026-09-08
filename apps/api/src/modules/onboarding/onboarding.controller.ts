import type { Request, Response } from "express";
import { onboardingSchema } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { onboardingService } from "./onboarding.service.js";

export const onboardingController = {
  getQuiz(_req: Request, res: Response) {
    res.status(200).json({ questions: onboardingService.getQuiz() });
  },

  async complete(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = onboardingSchema.parse(req.body);
    const result = await onboardingService.complete(req.user.sub, input);
    res.status(200).json(result);
  },
};
