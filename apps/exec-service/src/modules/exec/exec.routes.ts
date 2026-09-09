import { Router } from "express";
import { z } from "zod";
import { logger } from "../../lib/logger.js";
import { runJavaScript } from "./js-runner.js";
import { runSql, SqlGuardError } from "./sql-runner.js";

export const execRouter = Router();

const runJsSchema = z.object({
  code: z.string().min(1).max(20_000),
});

execRouter.post("/js", async (req, res) => {
  const parsed = runJsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "Código inválido." } });
    return;
  }

  try {
    const result = await runJavaScript(parsed.data.code);
    res.status(200).json(result);
  } catch (err) {
    logger.error({ err }, "Error ejecutando JavaScript en el exec-service");
    res
      .status(500)
      .json({
        error: { code: "INTERNAL_ERROR", message: "No se pudo ejecutar el código." },
      });
  }
});

const runSqlSchema = z.object({
  sql: z.string().min(1).max(5_000),
});

execRouter.post("/sql", async (req, res) => {
  const parsed = runSqlSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: { code: "BAD_REQUEST", message: "SQL inválido." } });
    return;
  }

  try {
    const result = await runSql(parsed.data.sql);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof SqlGuardError) {
      res.status(400).json({ error: { code: "SQL_NOT_ALLOWED", message: err.message } });
      return;
    }
    logger.error({ err }, "Error ejecutando SQL en el exec-service");
    res
      .status(500)
      .json({
        error: { code: "INTERNAL_ERROR", message: "No se pudo ejecutar la consulta." },
      });
  }
});
