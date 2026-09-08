import type { Request, Response } from "express";
import { HttpError } from "../../lib/http-error.js";
import { lessonsService } from "./lessons.service.js";

export const lessonsController = {
  async detail(req: Request, res: Response) {
    const lesson = await lessonsService.getDetail(req.params.id as string, req.user?.sub);
    res.status(200).json({ lesson });
  },

  async complete(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const result = await lessonsService.complete(req.params.id as string, req.user.sub);
    res.status(200).json(result);
  },
};
