import type { Request, Response } from "express";
import { deleteAccountSchema, updateProfileSchema } from "@codeforge/validators";
import { HttpError } from "../../lib/http-error.js";
import { clearRefreshCookie } from "../auth/auth.controller.js";
import { usersService } from "./users.service.js";

export const usersController = {
  async me(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const user = await usersService.getById(req.user.sub);
    res.status(200).json({ user });
  },

  async updateMe(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = updateProfileSchema.parse(req.body);
    const user = await usersService.updateProfile(req.user.sub, input);
    res.status(200).json({ user });
  },

  async deleteMe(req: Request, res: Response) {
    if (!req.user) throw HttpError.unauthorized();
    const input = deleteAccountSchema.parse(req.body);
    await usersService.deleteAccount(req.user.sub, input.password);
    clearRefreshCookie(res);
    res.status(204).send();
  },
};
