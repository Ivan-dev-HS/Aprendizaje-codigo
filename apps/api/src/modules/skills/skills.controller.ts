import type { Request, Response } from "express";
import { HttpError } from "../../lib/http-error.js";
import { skillsService } from "./skills.service.js";

export const skillsController = {
  async list(_req: Request, res: Response) {
    const skills = await skillsService.list();
    res.status(200).json({ skills });
  },

  async listMine(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const skills = await skillsService.listForUser(req.user.sub);
    res.status(200).json({ skills });
  },
};
