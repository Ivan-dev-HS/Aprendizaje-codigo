import { z } from "zod";

/** Límites espejo de apps/exec-service/src/modules/exec/exec.routes.ts. */
export const runJsSchema = z.object({
  code: z.string().min(1, "El código no puede estar vacío.").max(20_000),
});
export type RunJsInput = z.infer<typeof runJsSchema>;

export const runSqlSchema = z.object({
  sql: z.string().min(1, "La consulta no puede estar vacía.").max(5_000),
});
export type RunSqlInput = z.infer<typeof runSqlSchema>;

export const savePlaygroundSnapshotSchema = z.object({
  title: z.string().min(1).max(120).default("Sin título"),
  html: z.string().max(50_000).default(""),
  css: z.string().max(50_000).default(""),
  js: z.string().max(50_000).default(""),
});
export type SavePlaygroundSnapshotInput = z.infer<typeof savePlaygroundSnapshotSchema>;

export const terminalCommandSchema = z.object({
  command: z.string().min(1).max(500),
});
export type TerminalCommandInput = z.infer<typeof terminalCommandSchema>;

export const gitCommandSchema = z.object({
  command: z.string().min(1).max(500),
});
export type GitCommandInput = z.infer<typeof gitCommandSchema>;
