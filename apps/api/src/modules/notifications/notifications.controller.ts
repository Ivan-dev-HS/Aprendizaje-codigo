import type { Request, Response } from "express";
import { paginationQuerySchema } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { notificationsService } from "./notifications.service.js";

export const notificationsController = {
  async list(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const query = paginationQuerySchema.parse(req.query);
    const result = await notificationsService.listForUser(
      req.user.sub,
      query.page,
      query.pageSize,
    );
    res.status(200).json(result);
  },

  async markRead(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    await notificationsService.markRead(req.params.id as string, req.user.sub);
    res.status(204).send();
  },

  async markAllRead(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    await notificationsService.markAllRead(req.user.sub);
    res.status(204).send();
  },
};
