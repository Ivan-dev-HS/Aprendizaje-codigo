import type { Request, Response } from "express";
import { updateUserProjectSchema } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { projectsService } from "./projects.service.js";

export const projectsController = {
  async list(req: Request, res: Response) {
    const items = await projectsService.list(req.user?.sub);
    res.status(200).json({ items });
  },

  async detail(req: Request, res: Response) {
    const project = await projectsService.getDetail(
      req.params.slug as string,
      req.user?.sub,
    );
    res.status(200).json({ project });
  },

  async start(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const userProject = await projectsService.start(
      req.params.id as string,
      req.user.sub,
    );
    res.status(200).json({ userProject });
  },

  async updateMetadata(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = updateUserProjectSchema.parse(req.body);
    const userProject = await projectsService.updateMetadata(
      req.params.id as string,
      req.user.sub,
      input,
    );
    res.status(200).json({ userProject });
  },

  async completeTask(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const result = await projectsService.completeTask(
      req.params.id as string,
      req.params.taskId as string,
      req.user.sub,
    );
    res.status(200).json(result);
  },
};
