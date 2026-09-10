import express, { type Express, type RequestHandler } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger.js";
import { requireInternalToken } from "./middleware/internal-auth.js";
import { execRouter } from "./modules/exec/exec.routes.js";

// El verificador de tipos que usa Vercel para compilar la función serverless
// no aplica `esModuleInterop` aunque esté declarado en tsconfig.json (no es
// el `tsc` normal del proyecto, sino un paso propio de Vercel) — sin
// interop, TS tipa el import por defecto de un módulo CJS `module.exports =
// fn` (como helmet) como el objeto del módulo entero, no como función, y el
// build falla con "This expression is not callable". En runtime esto
// siempre funciona bien (Node interopera esos módulos con normalidad); se
// castea al tipo invocable real en vez de al revés.
const helmetMiddleware = helmet as unknown as (
  options?: Record<string, unknown>,
) => RequestHandler;

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");

  app.use(helmetMiddleware());
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
