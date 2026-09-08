import express, { type Express } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger.js";

// NOTA: el router `/exec` (ejecución aislada de JS y SQL, ver
// IMPLEMENTATION_PLAN.md §7) se añade en la Fase 5, junto con los labs de
// código que lo consumen. `requireInternalToken` ya está implementado y se
// aplicará a ese router cuando se monte.

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(express.json({ limit: "256kb" }));
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/health" } }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptimeSeconds: Math.round(process.uptime()) });
  });

  app.use((_req, res) => {
    res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Ruta no encontrada." } });
  });

  return app;
}
