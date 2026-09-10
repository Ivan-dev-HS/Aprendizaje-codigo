import express, { type Express, type RequestHandler } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";

// El verificador de tipos que usa Vercel para compilar la función serverless
// no aplica `esModuleInterop` aunque esté declarado en tsconfig.json (no es
// el `tsc` normal del proyecto, sino un paso propio de Vercel) — sin
// interop, TS tipa el import por defecto de un módulo CJS `module.exports =
// fn` (como helmet o express-rate-limit) como el objeto del módulo entero,
// no como función, y el build falla con "This expression is not callable".
// En runtime esto siempre funciona bien (Node interopera esos módulos con
// normalidad); se castea al tipo invocable real en vez de al revés.
const helmetMiddleware = helmet as unknown as (
  options?: Record<string, unknown>,
) => RequestHandler;
const rateLimitMiddleware = rateLimit as unknown as (
  options?: Record<string, unknown>,
) => RequestHandler;

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmetMiddleware({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: "same-site" },
    }),
  );

  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());

  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === "/api/v1/health" },
    }),
  );

  const generalLimiter = rateLimitMiddleware({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: "TOO_MANY_REQUESTS",
        message: "Demasiadas solicitudes. Inténtalo más tarde.",
      },
    },
  });
  app.use("/api", generalLimiter);

  app.use("/api/v1", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
