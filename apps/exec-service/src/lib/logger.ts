import pino from "pino";
import { env, isProduction, isTest } from "../config/env.js";

export const logger = pino({
  level: isTest ? "silent" : env.LOG_LEVEL,
  redact: { paths: ["req.headers.authorization", "*.token"], censor: "[REDACTED]" },
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
      },
});
