import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { prisma } from "@codeforge/database";

const app = createApp();

const server = app.listen(env.API_PORT, env.API_HOST, () => {
  logger.info(`CodeForge API escuchando en http://${env.API_HOST}:${env.API_PORT}`);
});

async function shutdown(signal: string) {
  logger.info(`Recibida señal ${signal}, cerrando servidor...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
