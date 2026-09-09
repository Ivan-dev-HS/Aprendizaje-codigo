import { Router } from "express";
import { asyncHandler } from "../../middleware/error-handler.js";
import { searchController } from "./search.controller.js";

export const searchRouter = Router();

searchRouter.get("/", asyncHandler(searchController.search));
