import type { Request, Response } from "express";
import { coursesService } from "./courses.service.js";

export const coursesController = {
  async list(req: Request, res: Response) {
    const courses = await coursesService.list(req.user?.sub);
    res.status(200).json({ courses });
  },

  async detail(req: Request, res: Response) {
    const course = await coursesService.getDetail(
      req.params.slug as string,
      req.user?.sub,
    );
    res.status(200).json({ course });
  },
};
