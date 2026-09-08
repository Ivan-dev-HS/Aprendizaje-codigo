import { Router } from "express";
import { prisma } from "@codeforge/database";
import { asyncHandler } from "../../middleware/error-handler.js";

export const healthRouter = Router();

/**
 * GET /api/v1/health
 * Comprueba el estado de la API y de la base de datos (sección 89).
 * No requiere autenticación: es usado por Docker healthchecks y monitorización.
 */
healthRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const startedAt = Date.now();
    let database: "up" | "down" = "down";

    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "up";
    } catch {
      database = "down";
    }

    const status = database === "up" ? "ok" : "degraded";
    res.status(database === "up" ? 200 : 503).json({
      status,
      database,
      uptimeSeconds: Math.round(process.uptime()),
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  }),
);
