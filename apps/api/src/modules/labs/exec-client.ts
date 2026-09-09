import type { JsRunResult, SqlRunResult } from "@codeforge/types";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";

/**
 * Cliente HTTP interno hacia apps/exec-service. La API NUNCA ejecuta código
 * de usuario en su propio proceso (ver docs/SECURITY.md): siempre delega en
 * el servicio de ejecución aislado, autenticado con un token interno que
 * jamás se expone al frontend.
 */
async function callExecService<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${env.EXEC_SERVICE_URL}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-token": env.EXEC_SERVICE_INTERNAL_TOKEN,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw HttpError.internal(
      "El servicio de ejecución de código no está disponible ahora mismo. Inténtalo de nuevo.",
    );
  }

  if (response.status === 400) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw HttpError.badRequest(
      payload?.error?.message ?? "Código o consulta no válidos.",
    );
  }
  if (!response.ok) {
    throw HttpError.internal("No se pudo ejecutar el código. Inténtalo de nuevo.");
  }
  return (await response.json()) as T;
}

export function execRunJs(code: string): Promise<JsRunResult> {
  return callExecService<JsRunResult>("/exec/js", { code });
}

export function execRunSql(sql: string): Promise<SqlRunResult> {
  return callExecService<SqlRunResult>("/exec/sql", { sql });
}
