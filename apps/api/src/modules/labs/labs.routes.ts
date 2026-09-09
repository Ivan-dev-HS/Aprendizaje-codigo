import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/error-handler.js";
import { labsController } from "./labs.controller.js";

export const labsRouter = Router();

labsRouter.use(requireAuth);

labsRouter.post("/js/run", asyncHandler(labsController.runJs));
labsRouter.post("/sql/run", asyncHandler(labsController.runSql));
labsRouter.get("/sql/datasets", asyncHandler(labsController.listSqlDatasets));

labsRouter.get("/playground", asyncHandler(labsController.listPlaygroundSnapshots));
labsRouter.post("/playground", asyncHandler(labsController.createPlaygroundSnapshot));
labsRouter.get("/playground/:id", asyncHandler(labsController.getPlaygroundSnapshot));
labsRouter.put("/playground/:id", asyncHandler(labsController.updatePlaygroundSnapshot));
labsRouter.delete(
  "/playground/:id",
  asyncHandler(labsController.deletePlaygroundSnapshot),
);

labsRouter.get("/terminal", asyncHandler(labsController.getTerminalState));
labsRouter.post("/terminal", asyncHandler(labsController.runTerminalCommand));

labsRouter.get("/git", asyncHandler(labsController.getGitState));
labsRouter.post("/git", asyncHandler(labsController.runGitCommand));
