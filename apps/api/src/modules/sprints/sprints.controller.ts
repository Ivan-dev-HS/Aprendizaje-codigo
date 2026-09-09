import type { Request, Response } from "express";
import { sprintsService } from "./sprints.service.js";

export const sprintsController = {
  async current(_req: Request, res: Response) {
    const sprint = await sprintsService.getCurrent();
    res.status(200).json({ sprint });
  },
};
