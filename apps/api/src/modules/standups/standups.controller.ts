import type { Request, Response } from "express";
import { submitStandupSchema } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { standupsService } from "./standups.service.js";

export const standupsController = {
  async submit(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = submitStandupSchema.parse(req.body);
    const entry = await standupsService.submit(req.user.sub, input);
    res.status(201).json({ entry });
  },

  async listMine(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const items = await standupsService.listMine(req.user.sub);
    res.status(200).json({ items });
  },
};
