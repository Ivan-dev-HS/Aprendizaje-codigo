import pino from "pino";
import { env, isProduction, isTest } from "../config/env.js";

/**
 * Logger estructurado. Nunca debe recibir passwords, tokens ni secretos:
 * los serializadores redactan las claves más habituales por defecto.
 */
export const logger = pino({
  level: isTest ? "silent" : env.LOG_LEVEL,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.passwordHash",
      "*.token",
      "*.accessToken",
      "*.refreshToken",
    ],
    censor: "[REDACTED]",
  },
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
      },
});
