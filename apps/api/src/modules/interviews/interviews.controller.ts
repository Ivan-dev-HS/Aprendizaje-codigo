import type { Request, Response } from "express";
import {
  interviewListQuerySchema,
  submitInterviewAnswerSchema,
} from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { interviewsService } from "./interviews.service.js";

export const interviewsController = {
  async list(req: Request, res: Response) {
    const query = interviewListQuerySchema.parse(req.query);
    const items = await interviewsService.list(
      { category: query.category },
      req.user?.sub,
    );
    res.status(200).json({ items });
  },

  async detail(req: Request, res: Response) {
    const interview = await interviewsService.getDetail(
      req.params.slug as string,
      req.user?.sub,
    );
    res.status(200).json({ interview });
  },

  async start(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const result = await interviewsService.start(req.params.id as string, req.user.sub);
    res.status(200).json(result);
  },

  async answer(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = submitInterviewAnswerSchema.parse(req.body);
    const result = await interviewsService.submitAnswer(
      req.params.id as string,
      req.user.sub,
      input,
    );
    res.status(200).json(result);
  },

  async myAttempts(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const items = await interviewsService.listAttempts(req.user.sub);
    res.status(200).json({ items });
  },

  async attemptDetail(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const attempt = await interviewsService.getAttemptDetail(
      req.params.attemptId as string,
      req.user.sub,
    );
    res.status(200).json({ attempt });
  },
};
