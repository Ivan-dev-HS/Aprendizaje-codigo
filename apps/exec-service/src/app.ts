import express, { type Express } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger.js";
import { requireInternalToken } from "./middleware/internal-auth.js";
import { execRouter } from "./modules/exec/exec.routes.js";

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(express.json({ limit: "256kb" }));
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/health" } }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", uptimeSeconds: Math.round(process.uptime()) });
  });

  // Único punto de entrada de código de usuario. Nunca se expone al público
  // (ver docker-compose.yml: sin `ports`) y exige el token interno compartido
  // con la API principal en cada request.
  app.use("/exec", requireInternalToken, execRouter);

  app.use((_req, res) => {
    res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Ruta no encontrada." } });
  });

  return app;
}
