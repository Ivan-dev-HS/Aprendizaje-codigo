import type { Request, Response } from "express";
import { HttpError } from "../../lib/http-error.js";
import { learningPathsService } from "./learning-paths.service.js";

export const learningPathsController = {
  async mine(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const learningPath = await learningPathsService.getForUser(req.user.sub);
    res.status(200).json({ learningPath });
  },
};
