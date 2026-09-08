import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

/**
 * El exec-service nunca se expone públicamente (ver docker-compose.yml: no
 * publica puerto al host). Como defensa en profundidad, además exige un
 * token compartido con la API principal en cada request que no sea /health.
 */
export function requireInternalToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header("x-internal-token");
  if (!token || token !== env.EXEC_SERVICE_INTERNAL_TOKEN) {
    res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Token interno inválido." } });
    return;
  }
  next();
}
