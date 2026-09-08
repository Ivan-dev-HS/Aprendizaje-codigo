import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  EXEC_SERVICE_PORT: z.coerce.number().int().positive().default(4100),
  EXEC_SERVICE_HOST: z.string().default("0.0.0.0"),
  EXEC_SERVICE_INTERNAL_TOKEN: z.string().min(8),
  SANDBOX_DATABASE_URL: z.string().optional(),
  EXEC_JS_TIMEOUT_MS: z.coerce.number().int().positive().default(2000),
  EXEC_JS_MEMORY_MB: z.coerce.number().int().positive().default(64),
  EXEC_SQL_TIMEOUT_MS: z.coerce.number().int().positive().default(2000),
  EXEC_MAX_OUTPUT_BYTES: z.coerce.number().int().positive().default(65536),
  LOG_LEVEL: z.string().default("info"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variables de entorno inválidas:", parsed.error.flatten().fieldErrors);
  throw new Error("Configuración de entorno inválida para exec-service.");
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
