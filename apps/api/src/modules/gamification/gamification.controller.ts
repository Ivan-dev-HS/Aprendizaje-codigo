import type { Request, Response } from "express";
import { ackAchievementsSchema } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { gamificationService } from "./gamification.service.js";

export const gamificationController = {
  async me(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const summary = await gamificationService.getSummary(req.user.sub);
    res.status(200).json(summary);
  },

  async ackAchievements(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = ackAchievementsSchema.parse(req.body);
    await gamificationService.acknowledgeAchievements(req.user.sub, input.achievementIds);
    res.status(204).send();
  },
};
