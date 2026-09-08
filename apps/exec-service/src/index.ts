import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

const app = createApp();

const server = app.listen(env.EXEC_SERVICE_PORT, env.EXEC_SERVICE_HOST, () => {
  logger.info(
    `CodeForge exec-service escuchando en http://${env.EXEC_SERVICE_HOST}:${env.EXEC_SERVICE_PORT} (solo red interna)`,
  );
});

function shutdown(signal: string) {
  logger.info(`Recibida señal ${signal}, cerrando exec-service...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
