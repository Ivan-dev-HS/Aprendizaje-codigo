import type { Request, Response } from "express";
import { submitCodeReviewSchema } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { pullRequestsService } from "./pull-requests.service.js";

export const pullRequestsController = {
  async list(_req: Request, res: Response) {
    const items = await pullRequestsService.list();
    res.status(200).json({ items });
  },

  async detail(req: Request, res: Response) {
    const pullRequest = await pullRequestsService.getDetail(req.params.id as string);
    res.status(200).json({ pullRequest });
  },

  async review(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = submitCodeReviewSchema.parse(req.body);
    const result = await pullRequestsService.submitReview(
      req.params.id as string,
      req.user.sub,
      input,
    );
    res.status(200).json(result);
  },
};
