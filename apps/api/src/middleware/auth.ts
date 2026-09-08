import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error.js";
import { verifyAccessToken, type AccessTokenPayload } from "../lib/tokens.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

/** Extrae y valida el access token JWT del header Authorization. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    next(HttpError.unauthorized());
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(HttpError.unauthorized("Tu sesión ha expirado. Inicia sesión de nuevo."));
  }
}

/**
 * Autenticación opcional: si hay token válido lo adjunta, si no, continúa sin
 * usuario (para endpoints públicos que personalizan la respuesta si hay sesión).
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Token inválido/expirado: se ignora, el request sigue como anónimo.
    }
  }
  next();
}

/** Nunca confía en el frontend: la autorización por rol se verifica aquí, en backend. */
export function requireRole(...roles: Array<"USER" | "ADMIN">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(HttpError.unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(HttpError.forbidden());
      return;
    }
    next();
  };
}
