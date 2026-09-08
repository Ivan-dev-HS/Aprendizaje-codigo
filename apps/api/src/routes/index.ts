import { Router } from "express";
import { healthRouter } from "../modules/health/health.routes.js";

/**
 * Router raíz de la API, montado bajo /api/v1 en app.ts.
 * Cada fase añade aquí el router de su módulo correspondiente.
 */
export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
