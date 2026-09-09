import { Worker } from "node:worker_threads";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "../../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKER_PATH = path.join(__dirname, "js-runner.worker.ts");

export interface JsRunResult {
  outputs: string[];
  errors: string[];
  timedOut: boolean;
  truncated: boolean;
  durationMs: number;
}

const HARD_KILL_GRACE_MS = 500;

/**
 * Ejecuta código JavaScript de usuario en un worker_thread dedicado y
 * desechable (uno nuevo por request, nunca se reutiliza entre usuarios).
 * Ver docs/SECURITY.md §Ejecución de código para el modelo de amenazas.
 */
export function runJavaScript(code: string): Promise<JsRunResult> {
  const startedAt = Date.now();

  return new Promise((resolve) => {
    const worker = new Worker(WORKER_PATH, {
      workerData: {
        code,
        timeoutMs: env.EXEC_JS_TIMEOUT_MS,
        maxOutputBytes: env.EXEC_MAX_OUTPUT_BYTES,
      },
      resourceLimits: {
        maxOldGenerationSizeMb: env.EXEC_JS_MEMORY_MB,
        maxYoungGenerationSizeMb: Math.max(16, Math.floor(env.EXEC_JS_MEMORY_MB / 4)),
      },
      // El worker no necesita nada del entorno del proceso principal.
      env: {},
    });

    let settled = false;

    const killTimer = setTimeout(() => {
      void worker.terminate();
    }, env.EXEC_JS_TIMEOUT_MS + HARD_KILL_GRACE_MS);

    function finish(result: JsRunResult) {
      if (settled) return;
      settled = true;
      clearTimeout(killTimer);
      void worker.terminate();
      resolve(result);
    }

    worker.once("message", (message: Omit<JsRunResult, "durationMs">) => {
      finish({ ...message, durationMs: Date.now() - startedAt });
    });

    worker.once("error", (err) => {
      finish({
        outputs: [],
        errors: [`Error interno de ejecución: ${err.message}`],
        timedOut: false,
        truncated: false,
        durationMs: Date.now() - startedAt,
      });
    });

    worker.once("exit", (code) => {
      if (code !== 0 && !settled) {
        finish({
          outputs: [],
          errors: [
            "El proceso de ejecución se detuvo inesperadamente (posible límite de memoria).",
          ],
          timedOut: false,
          truncated: false,
          durationMs: Date.now() - startedAt,
        });
      }
    });
  });
}
