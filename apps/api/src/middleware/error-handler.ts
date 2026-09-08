import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/http-error.js";
import { logger } from "../lib/logger.js";
import { isProduction } from "../config/env.js";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
};

/** Envuelve handlers async para que sus rechazos lleguen al error middleware. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".") || "_root";
      details[key] = [...(details[key] ?? []), issue.message];
    }
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Los datos enviados no son válidos.",
        details,
      },
    });
    return;
  }

  if (err instanceof HttpError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.originalUrl }, "Error interno");
    }
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  logger.error({ err, path: req.originalUrl }, "Error no controlado");
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Ha ocurrido un error inesperado. Inténtalo de nuevo.",
      ...(isProduction
        ? {}
        : { details: { stack: [(err as Error).stack ?? String(err)] } }),
    },
  });
};
