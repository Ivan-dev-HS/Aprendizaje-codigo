import type { Request, Response } from "express";
import {
  addTicketCommentSchema,
  ticketListQuerySchema,
  updateTicketSchema,
} from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { ticketsService } from "./tickets.service.js";

export const ticketsController = {
  async list(req: Request, res: Response) {
    const query = ticketListQuerySchema.parse(req.query);
    const items = await ticketsService.list(query);
    res.status(200).json({ items });
  },

  async detail(req: Request, res: Response) {
    const ticket = await ticketsService.getDetail(req.params.id as string);
    res.status(200).json({ ticket });
  },

  async update(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = updateTicketSchema.parse(req.body);
    const result = await ticketsService.update(
      req.params.id as string,
      req.user.sub,
      input,
    );
    res.status(200).json(result);
  },

  async addComment(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = addTicketCommentSchema.parse(req.body);
    const comment = await ticketsService.addComment(
      req.params.id as string,
      req.user.sub,
      input,
    );
    res.status(201).json({ comment });
  },
};
