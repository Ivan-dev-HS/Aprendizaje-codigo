import type { Request, Response } from "express";
import {
  exerciseListQuerySchema,
  hintLevelParamSchema,
  submitExerciseAttemptSchema,
} from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { exercisesService } from "./exercises.service.js";

export const exercisesController = {
  async list(req: Request, res: Response) {
    const query = exerciseListQuerySchema.parse(req.query);
    const result = await exercisesService.list(
      { skillSlug: query.skillSlug, difficulty: query.difficulty, type: query.type },
      query,
      req.user?.sub,
    );
    res.status(200).json(result);
  },

  async detail(req: Request, res: Response) {
    const exercise = await exercisesService.getDetail(
      req.params.id as string,
      req.user?.sub,
    );
    res.status(200).json({ exercise });
  },

  async hint(req: Request, res: Response) {
    const { level } = hintLevelParamSchema.parse({ level: req.params.level });
    const hint = await exercisesService.getHint(req.params.id as string, level);
    res.status(200).json({ level, hint });
  },

  async attempt(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = submitExerciseAttemptSchema.parse(req.body);
    const result = await exercisesService.submitAttempt(
      req.params.id as string,
      req.user.sub,
      input,
    );
    res.status(200).json(result);
  },
};
