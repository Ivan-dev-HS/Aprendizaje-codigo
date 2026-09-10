import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { usersController } from "./users.controller.js";

export const usersRouter = Router();

usersRouter.use(requireAuth);
usersRouter.get("/me", asyncHandler(usersController.me));
usersRouter.patch("/me", asyncHandler(usersController.updateMe));
usersRouter.delete("/me", asyncHandler(usersController.deleteMe));
