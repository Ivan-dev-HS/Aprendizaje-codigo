import type { Request, Response } from "express";
import {
  caseHintLevelParamSchema,
  caseListQuerySchema,
  submitCaseAttemptSchema,
} from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { casesService } from "./cases.service.js";

export const casesController = {
  async list(req: Request, res: Response) {
    const query = caseListQuerySchema.parse(req.query);
    const result = await casesService.list(
      { kind: query.kind, domain: query.domain, difficulty: query.difficulty },
      query,
      req.user?.sub,
    );
    res.status(200).json(result);
  },

  async detail(req: Request, res: Response) {
    const c = await casesService.getDetail(req.params.id as string, req.user?.sub);
    res.status(200).json({ case: c });
  },

  async hint(req: Request, res: Response) {
    const { level } = caseHintLevelParamSchema.parse({ level: req.params.level });
    const hint = await casesService.getHint(req.params.id as string, level);
    res.status(200).json({ level, hint });
  },

  async attempt(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = submitCaseAttemptSchema.parse(req.body);
    const result = await casesService.submitAttempt(
      req.params.id as string,
      req.user.sub,
      input,
    );
    res.status(200).json(result);
  },
};
