import type { Request, Response } from "express";
import { updatePortfolioSchema } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { portfolioService } from "./portfolio.service.js";

export const portfolioController = {
  async getMine(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const result = await portfolioService.getMine(req.user.sub);
    res.status(200).json(result);
  },

  async updateMine(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = updatePortfolioSchema.parse(req.body);
    const settings = await portfolioService.updateMine(req.user.sub, input);
    res.status(200).json({ settings });
  },

  async getPublic(req: Request, res: Response) {
    const portfolio = await portfolioService.getPublic(req.params.username as string);
    res.status(200).json({ portfolio });
  },
};
