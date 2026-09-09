import { Router } from "express";
import { asyncHandler } from "../../middleware/error-handler.js";
import { sprintsController } from "./sprints.controller.js";

export const sprintsRouter = Router();

sprintsRouter.get("/current", asyncHandler(sprintsController.current));
