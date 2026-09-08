import { PrismaClient } from "../generated/client/index.js";

declare global {
  var __codeforgePrisma: PrismaClient | undefined;
}

/**
 * Singleton de PrismaClient. En desarrollo se reutiliza en `global` para
 * evitar agotar el pool de conexiones con cada hot-reload.
 */
export const prisma =
  global.__codeforgePrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV === "development") {
  global.__codeforgePrisma = prisma;
}

export * from "../generated/client/index.js";
