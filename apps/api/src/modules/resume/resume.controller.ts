import type { Request, Response } from "express";
import { updateResumeSchema } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { resumeService } from "./resume.service.js";

export const resumeController = {
  async getMine(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const resume = await resumeService.getMine(req.user.sub);
    res.status(200).json({ resume });
  },

  async updateMine(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = updateResumeSchema.parse(req.body);
    const resume = await resumeService.updateMine(req.user.sub, input);
    res.status(200).json({ resume });
  },
};
